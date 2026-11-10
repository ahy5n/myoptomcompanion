// "This device only" mode: used until Supabase keys are added. Accounts and
// progress live in localStorage, so they don't follow the student to another device.
import type { AuthUser, Backend, UserData } from './types'
import { checkLogin, checkNewAccount, emptyData } from './types'

const USERS = 'sc:v1:users'
const SESSION = 'sc:v1:session'
const dataKey = (id: string) => `sc:v1:data:${id}`

type Users = Record<string, { id: string; hash: string }>

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function hash(username: string, password: string): Promise<string> {
  const text = `myoptomcompanion:${username}:${password}`
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Non-secure origins (e.g. a dev server opened over the LAN) have no
  // crypto.subtle. This mode only guards a device-local profile anyway.
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 16777619)
    h2 = Math.imul(h2 ^ text.charCodeAt(i), 2246822507)
  }
  return `fnv:${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

function mutate(user: AuthUser, fn: (d: UserData) => void) {
  const d = read<UserData>(dataKey(user.id), emptyData(user.username))
  fn(d)
  write(dataKey(user.id), d)
}

// ── Guest mode ───────────────────────────────────────────────────────────
const GUEST: AuthUser = { id: 'guest', username: 'Guest' }

/** Signs in as the device's guest, keeping any earlier guest progress. */
export function startGuest(): AuthUser {
  if (!localStorage.getItem(dataKey(GUEST.id))) write(dataKey(GUEST.id), emptyData(GUEST.username))
  write(SESSION, GUEST)
  return GUEST
}
export function readGuestData(): UserData | null {
  return read<UserData | null>(dataKey(GUEST.id), null)
}
export function clearGuestData() {
  localStorage.removeItem(dataKey(GUEST.id))
}

export const localBackend: Backend = {
  mode: 'local',

  async currentUser() {
    return read<AuthUser | null>(SESSION, null)
  },

  async signIn(rawLogin, password) {
    const username = checkLogin(rawLogin)
    const entry = read<Users>(USERS, {})[username]
    if (!entry) throw new Error('There’s no account with that email on this device. Create one instead.')
    if (entry.hash !== (await hash(username, password))) throw new Error('That email and password don’t match.')
    const user = { id: entry.id, username }
    write(SESSION, user)
    return user
  },

  async signUp(rawEmail, password, about) {
    const username = checkNewAccount(rawEmail, password)
    const users = read<Users>(USERS, {})
    if (users[username]) throw new Error('There’s already an account with that email. Sign in instead.')
    const user = { id: newId(), username }
    users[username] = { id: user.id, hash: await hash(username, password) }
    write(USERS, users)
    const d = emptyData(username)
    d.profile.displayName = about.displayName.trim()
    d.profile.university = about.university
    d.profile.studyYear = about.studyYear
    write(dataKey(user.id), d)
    write(SESSION, user)
    return user
  },

  async signOut() {
    localStorage.removeItem(SESSION)
  },

  async sendPasswordReset() {
    throw new Error('Accounts in this preview live on this device only, so there’s no reset email. Create a new account instead.')
  },
  async setNewPassword() {
    throw new Error('Password reset links only work on the live site.')
  },
  async changePassword(user, current, next) {
    const users = read<Users>(USERS, {})
    const entry = users[user.username]
    if (!entry || entry.hash !== (await hash(user.username, current))) throw new Error('Your current password isn’t right.')
    if (next.length < 6) throw new Error('Passwords need at least 6 characters.')
    entry.hash = await hash(user.username, next)
    write(USERS, users)
  },

  async load(user) {
    const d = read<UserData>(dataKey(user.id), emptyData(user.username))
    return { ...emptyData(user.username), ...d, profile: { ...emptyData(user.username).profile, ...d.profile } }
  },

  async saveProfile(user, patch) {
    mutate(user, (d) => Object.assign(d.profile, patch))
  },
  async saveProgress(user, topicId, p) {
    mutate(user, (d) => void (d.progress[topicId] = p))
  },
  async saveChecklist(user, id, steps) {
    mutate(user, (d) => void (d.checklists[id] = steps))
  },
  async saveNote(user, topicId, body) {
    mutate(user, (d) => void (d.notes[topicId] = body))
  },
  async saveReview(user, r) {
    mutate(user, (d) => void (d.reviews[r.itemId] = r))
  },
  async addAttempt() {
    // Attempts are only kept server-side; the deck holds what matters locally.
  },
  async addAssessments(user, items) {
    const created = items.map((a) => ({ ...a, id: newId() }))
    mutate(user, (d) => void d.assessments.push(...created))
    return created
  },
  async updateAssessment(user, a) {
    mutate(user, (d) => void (d.assessments = d.assessments.map((x) => (x.id === a.id ? a : x))))
  },
  async deleteAssessment(user, id) {
    mutate(user, (d) => void (d.assessments = d.assessments.filter((x) => x.id !== id)))
  },
  async saveOverride(user, code, name) {
    mutate(user, (d) => {
      if (name) d.overrides[code] = name
      else delete d.overrides[code]
    })
  },
  async addFlag(user, f) {
    mutate(user, (d) => void d.flags.push({ ...f, createdAt: new Date().toISOString() }))
  },
  async savePlacement(user, id, p) {
    mutate(user, (d) => void ((d.placements ??= {})[id] = p))
  },
  async addTimetable(user, entries) {
    mutate(user, (d) => void (d.timetable = [...(d.timetable ?? []), ...entries]))
  },
  async deleteTimetable(user, ids) {
    const gone = new Set(ids)
    mutate(user, (d) => void (d.timetable = (d.timetable ?? []).filter((e) => !gone.has(e.id))))
  },
  async saveDeck(user, deck) {
    mutate(user, (d) => void (d.decks = [...(d.decks ?? []).filter((x) => x.id !== deck.id), deck]))
  },
  async deleteDeck(user, id) {
    mutate(user, (d) => void (d.decks = (d.decks ?? []).filter((x) => x.id !== id)))
  },
  async saveCardSet(user, set) {
    mutate(user, (d) => void (d.cardSets = [...(d.cardSets ?? []).filter((x) => x.id !== set.id), set]))
  },
  // On this device there's no one else, so the inbox shows this device's own notes.
  async isAdmin() {
    return true
  },
  async adminInbox(user) {
    const d = read<UserData>(dataKey(user.id), emptyData(user.username))
    return {
      counts: { users: 1, newUsers7d: 0, active7d: 1, feedback: (d.feedback ?? []).length, flags: d.flags.length },
      feedback: (d.feedback ?? []).map((f) => ({ ...f, email: null, name: d.profile.displayName || null })),
      flags: d.flags.map((f, i) => ({ id: i, ...f })),
      signups: [],
      usage: { daily: [], pages: [], events: [] },
    }
  },
  async logUsage() {
    // Device-only mode keeps no usage stats.
  },
  async addFeedback(user, item) {
    mutate(user, (d) => void (d.feedback = [item, ...(d.feedback ?? [])]))
  },
  async deleteCardSet(user, id) {
    mutate(user, (d) => void (d.cardSets = (d.cardSets ?? []).filter((x) => x.id !== id)))
  },
}
