'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { todayISO } from '@/lib/dates'
import { schedule } from '@/lib/leitner'
import { track } from '@/lib/usage'
import {
  accountBackend,
  backend,
  clearGuestData,
  isGuest,
  readGuestData,
  setGuest,
  startGuest,
  type AuthUser,
  type FlagRecord,
  type NewAccount,
  type NewAssessment,
  type PlacementProgress,
  type Profile,
  type Progress,
  type TimetableEntry,
  type UserDeck,
  type CardSet,
  type FeedbackItem,
  type UserData,
} from '@/lib/store'
import type { Assessment } from '@/lib/tracker'
import type { ItemKind } from '@/lib/types'

type Status = 'loading' | 'signed-out' | 'ready' | 'error'

interface AppState {
  status: Status
  user: AuthUser | null
  data: UserData | null
  mode: 'local' | 'supabase'
  today: string
  error: string | null
  signIn(username: string, password: string): Promise<void>
  signUp(email: string, password: string, about: NewAccount, keepGuestProgress?: boolean): Promise<void>
  signOut(): Promise<void>
  /** True while using the app without an account (progress on this device only). */
  guest: boolean
  continueAsGuest(): Promise<void>
  /** Whether this device has guest progress that a new account could take over. */
  hasGuestProgress(): boolean
  changePassword(current: string, next: string): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  setNewPassword(password: string): Promise<void>
  retry(): void
  setProgress(topicId: string, field: keyof Progress, value: boolean): void
  setChecklist(checklistId: string, steps: number[]): void
  toggleChecklistStep(checklistId: string, step: number): void
  saveNote(topicId: string, body: string): Promise<void>
  recordResult(itemId: string, kind: ItemKind, correct: boolean, chosen: string): void
  addAssessments(items: NewAssessment[]): Promise<void>
  updateAssessment(a: Assessment): void
  deleteAssessment(id: string): void
  setOverride(code: string, name: string | null): void
  setClaudeUrl(url: string): Promise<void>
  saveProfile(patch: Partial<Omit<Profile, 'username'>>): Promise<void>
  markTrackerSeeded(): void
  flag(f: Omit<FlagRecord, 'createdAt'>): Promise<void>
  setPlacement(placementId: string, patch: Partial<PlacementProgress>): void
  addTimetable(entries: TimetableEntry[]): Promise<void>
  deleteTimetable(ids: string[]): Promise<void>
  saveDeck(deck: UserDeck): Promise<void>
  deleteDeck(id: string): Promise<void>
  saveCardSet(set: CardSet): Promise<void>
  deleteCardSet(id: string): Promise<void>
  sendFeedback(item: FeedbackItem): Promise<void>
  toast(message: string): void
}

const Ctx = createContext<AppState | null>(null)

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}

/** The signed-in user's data; only call inside the signed-in shell. */
export function useData(): UserData {
  const { data } = useApp()
  if (!data) throw new Error('useData before data loaded')
  return data
}

/** A subject's name as the student renamed it, or its built-in name. */
export function useModuleName(): (code: string, fallback: string) => string {
  const { overrides } = useData()
  return (code, fallback) => overrides[code] || fallback
}

/** Copies a guest's progress from this device into their new account. */
async function copyGuestProgress(user: AuthUser, g: UserData) {
  const b = accountBackend
  const jobs: Promise<unknown>[] = []
  for (const [id, p] of Object.entries(g.progress)) jobs.push(b.saveProgress(user, id, p))
  for (const [id, steps] of Object.entries(g.checklists)) jobs.push(b.saveChecklist(user, id, steps))
  for (const [id, body] of Object.entries(g.notes)) if (body) jobs.push(b.saveNote(user, id, body))
  for (const r of Object.values(g.reviews)) jobs.push(b.saveReview(user, r))
  for (const [code, name] of Object.entries(g.overrides)) jobs.push(b.saveOverride(user, code, name))
  for (const [id, p] of Object.entries(g.placements ?? {})) jobs.push(b.savePlacement(user, id, p))
  for (const deck of g.decks ?? []) jobs.push(b.saveDeck(user, deck))
  for (const set of g.cardSets ?? []) jobs.push(b.saveCardSet(user, set))
  if (g.assessments.length) jobs.push(b.addAssessments(user, g.assessments.map(({ id: _id, ...a }) => a)))
  if (g.timetable?.length) jobs.push(b.addTimetable(user, g.timetable))
  const { targetMark, reflection, palette, colorMode, claudeProjectUrl } = g.profile
  jobs.push(b.saveProfile(user, { targetMark, reflection, palette, colorMode, claudeProjectUrl }))
  const results = await Promise.allSettled(jobs)
  if (results.some((r) => r.status === 'rejected')) throw new Error('partial copy')
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [data, setData] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [today, setToday] = useState(() => todayISO())
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Latest data for actions that compute from current state.
  const dataRef = useRef<UserData | null>(null)

  const toast = useCallback((message: string) => {
    setToastMsg(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 3200)
  }, [])

  const loadFor = useCallback(async (u: AuthUser) => {
    setStatus('loading')
    try {
      const d = await backend.load(u)
      dataRef.current = d
      setUser(u)
      setData(d)
      setError(null)
      setStatus('ready')
    } catch (e) {
      setUser(u)
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }, [])

  const boot = useCallback(async () => {
    try {
      const u = await backend.currentUser()
      if (u) await loadFor(u)
      else setStatus('signed-out')
    } catch {
      setStatus('signed-out')
    }
  }, [loadFor])

  useEffect(() => {
    // Dev/testing aid: ?today=2026-10-19 pretends it's that date.
    const q = new URLSearchParams(window.location.search).get('today')
    if (q === 'off') sessionStorage.removeItem('sc:today')
    else if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem('sc:today', q)
    const stored = sessionStorage.getItem('sc:today')
    if (stored) setToday(stored)
    void boot()
  }, [boot])

  // Saving failures shouldn't lose the tick on screen; say so gently.
  const persist = useCallback(
    (p: Promise<unknown>) => {
      p.catch(() => toast('Couldn’t save that just now — check your connection.'))
    },
    [toast],
  )

  // Saves to the same row run one after another, so the last tap wins.
  const queues = useRef(new Map<string, Promise<unknown>>())
  const serial = useCallback(
    (key: string, run: () => Promise<unknown>) => {
      const prev = queues.current.get(key) ?? Promise.resolve()
      const next = prev.catch(() => {}).then(run)
      queues.current.set(key, next)
      persist(next)
    },
    [persist],
  )

  // Apply changes to the latest data synchronously, so two quick taps
  // (before React re-renders) both land.
  const update = useCallback((fn: (d: UserData) => UserData) => {
    const cur = dataRef.current
    if (!cur) return
    const next = fn(cur)
    dataRef.current = next
    setData(next)
  }, [])

  const value = useMemo<AppState>(() => {
    const u = user!
    return {
      status,
      user,
      data,
      mode: backend.mode,
      today,
      error,
      toast,
      retry: () => void boot(),

      async signIn(username, password) {
        const signed = await backend.signIn(username, password)
        await loadFor(signed)
      },
      async signUp(email, password, about, keepGuestProgress = true) {
        track('signup')
        const guestData = readGuestData()
        const created = await backend.signUp(email, password, about)
        if (guestData && keepGuestProgress) {
          await copyGuestProgress(created, guestData).catch(() => toast('Some of your guest progress couldn’t be copied.'))
          clearGuestData()
        }
        await loadFor(created)
      },
      guest: !!user && isGuest(),
      async continueAsGuest() {
        track('guest_start')
        setGuest(true)
        await loadFor(startGuest())
      },
      hasGuestProgress() {
        const g = readGuestData()
        return !!g && (Object.keys(g.progress).length > 0 || Object.keys(g.reviews).length > 0 || g.cardSets.length > 0 || Object.keys(g.placements ?? {}).length > 0 || g.assessments.length > 0 || Object.keys(g.notes).length > 0)
      },
      async signOut() {
        await backend.signOut()
        // Leaving guest mode keeps the guest's progress on this device for next time.
        setGuest(false)
        dataRef.current = null
        setUser(null)
        setData(null)
        setStatus('signed-out')
      },
      async changePassword(current, next) {
        await backend.changePassword(u, current, next)
      },
      sendPasswordReset: (email) => backend.sendPasswordReset(email),
      setNewPassword: (password) => backend.setNewPassword(password),

      setProgress(topicId, field, v) {
        const cur = dataRef.current?.progress[topicId] ?? { covered: false, revised: false }
        const next = { ...cur, [field]: v }
        update((d) => ({ ...d, progress: { ...d.progress, [topicId]: next } }))
        serial(`progress:${topicId}`, () => backend.saveProgress(u, topicId, next))
      },

      toggleChecklistStep(id, step) {
        const cur = new Set(dataRef.current?.checklists[id] ?? [])
        if (cur.has(step)) cur.delete(step)
        else cur.add(step)
        const steps = [...cur].sort((a, b) => a - b)
        update((d) => ({ ...d, checklists: { ...d.checklists, [id]: steps } }))
        serial(`checklist:${id}`, () => backend.saveChecklist(u, id, steps))
      },

      setChecklist(id, steps) {
        update((d) => ({ ...d, checklists: { ...d.checklists, [id]: steps } }))
        serial(`checklist:${id}`, () => backend.saveChecklist(u, id, steps))
      },

      async saveNote(topicId, body) {
        update((d) => ({ ...d, notes: { ...d.notes, [topicId]: body } }))
        await backend.saveNote(u, topicId, body)
      },

      recordResult(itemId, kind, correct, chosen) {
        track(`answer_${kind}`)
        const existing = dataRef.current?.reviews[itemId]
        const next = schedule(existing, itemId, kind, correct, today)
        if (next) {
          update((d) => ({ ...d, reviews: { ...d.reviews, [itemId]: next } }))
          serial(`review:${itemId}`, () => backend.saveReview(u, next))
        }
        persist(backend.addAttempt(u, itemId, correct, chosen))
      },

      async addAssessments(items) {
        const created = await backend.addAssessments(u, items)
        update((d) => ({ ...d, assessments: [...d.assessments, ...created] }))
      },
      updateAssessment(a) {
        update((d) => ({ ...d, assessments: d.assessments.map((x) => (x.id === a.id ? a : x)) }))
        serial(`assessment:${a.id}`, () => backend.updateAssessment(u, a))
      },
      deleteAssessment(id) {
        update((d) => ({ ...d, assessments: d.assessments.filter((x) => x.id !== id) }))
        persist(backend.deleteAssessment(u, id))
      },

      setOverride(code, name) {
        update((d) => {
          const overrides = { ...d.overrides }
          if (name) overrides[code] = name
          else delete overrides[code]
          return { ...d, overrides }
        })
        serial(`override:${code}`, () => backend.saveOverride(u, code, name))
      },

      async setClaudeUrl(url) {
        await backend.saveProfile(u, { claudeProjectUrl: url })
        update((d) => ({ ...d, profile: { ...d.profile, claudeProjectUrl: url } }))
      },

      async saveProfile(patch) {
        await backend.saveProfile(u, patch)
        update((d) => ({ ...d, profile: { ...d.profile, ...patch } }))
      },

      markTrackerSeeded() {
        update((d) => ({ ...d, profile: { ...d.profile, trackerSeeded: true } }))
        persist(backend.saveProfile(u, { trackerSeeded: true }))
      },

      setPlacement(id, patch) {
        if (patch.status) track(`placement_${patch.status}`)
        const cur: PlacementProgress = dataRef.current?.placements?.[id] ?? {
          status: 'not-contacted',
          interviewDate: null,
          interviewTime: null,
        }
        const next = { ...cur, ...patch }
        update((d) => ({ ...d, placements: { ...d.placements, [id]: next } }))
        serial(`placement:${id}`, () => backend.savePlacement(u, id, next))
      },

      async addTimetable(entries) {
        track('timetable_added')
        await backend.addTimetable(u, entries)
        update((d) => ({ ...d, timetable: [...d.timetable, ...entries] }))
      },

      async deleteTimetable(ids) {
        await backend.deleteTimetable(u, ids)
        const gone = new Set(ids)
        update((d) => ({ ...d, timetable: d.timetable.filter((e) => !gone.has(e.id)) }))
      },

      async saveDeck(deck) {
        track('slides_saved')
        await backend.saveDeck(u, deck)
        update((d) => ({ ...d, decks: [...d.decks.filter((x) => x.id !== deck.id), deck] }))
      },

      async deleteDeck(id) {
        await backend.deleteDeck(u, id)
        update((d) => ({ ...d, decks: d.decks.filter((x) => x.id !== id) }))
      },

      async saveCardSet(set) {
        track('flashcards_saved')
        await backend.saveCardSet(u, set)
        update((d) => ({ ...d, cardSets: [...d.cardSets.filter((x) => x.id !== set.id), set] }))
      },

      async sendFeedback(item) {
        track(`feedback_${item.kind}`)
        await backend.addFeedback(u, item)
        update((d) => ({ ...d, feedback: [item, ...d.feedback] }))
      },

      async deleteCardSet(id) {
        await backend.deleteCardSet(u, id)
        update((d) => ({ ...d, cardSets: d.cardSets.filter((x) => x.id !== id) }))
      },

      async flag(f) {
        await backend.addFlag(u, f)
        update((d) => ({ ...d, flags: [{ ...f, createdAt: new Date().toISOString() }, ...d.flags] }))
      },
    }
  }, [status, user, data, today, error, toast, boot, loadFor, persist, serial, update])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toastMsg && (
          <div className="toast-in rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-bg shadow-lg">
            {toastMsg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}
