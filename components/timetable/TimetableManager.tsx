'use client'

import { useMemo, useRef, useState } from 'react'
import { addDays, fmtDayLong, fmtRange, fmtShort, mondayOf } from '@/lib/dates'
import type { TimetableEntry } from '@/lib/store'
import { type IcsResult, detectModule, parseIcs, sessionKey, weeklyEntries } from '@/lib/timetable'
import { useApp, useData, useModuleName } from '../AppProvider'
import { BackLink, type ColourMap, ModuleChip } from '../bits'
import type { ModuleOption } from '@/lib/moduleOptions'
import { PlusIcon, TrashIcon } from '../icons'

export function TimetableManager({ modules }: { modules: ModuleOption[] }) {
  const { timetable } = useData()
  const { today } = useApp()
  const [showPast, setShowPast] = useState(false)
  const colours: ColourMap = Object.fromEntries(modules.map((m) => [m.code, m.colour]))

  const sorted = useMemo(() => [...timetable].sort((a, b) => sessionKey(a).localeCompare(sessionKey(b))), [timetable])
  const upcoming = sorted.filter((e) => e.date >= today)
  const past = sorted.filter((e) => e.date < today)
  const shown = showPast ? sorted : upcoming

  return (
    <div className="mx-auto max-w-[1080px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Your timetable</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Import your university calendar or add sessions yourself. They show on your home page and module pages, and slides you add can be linked
        to them.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ImportCard modules={modules} hasImported={timetable.some((e) => e.source === 'calendar')} />
        <AddCard modules={modules} />
      </div>

      <section className="mt-10" aria-labelledby="sessions">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="sessions" className="text-[22px] font-semibold">
            {showPast ? 'All sessions' : 'Coming up'} <span className="text-muted">· {shown.length}</span>
          </h2>
          <div className="flex gap-2">
            {past.length > 0 && (
              <button className="btn btn-ghost min-h-9 px-3 text-[14px]" onClick={() => setShowPast((v) => !v)}>
                {showPast ? 'Hide past sessions' : `Show past sessions (${past.length})`}
              </button>
            )}
            {timetable.length > 0 && <ClearAll count={timetable.length} />}
          </div>
        </div>
        {shown.length === 0 ? (
          <div className="card mt-3 p-6 text-muted">Nothing here yet. Import your calendar or add a session above.</div>
        ) : (
          <WeekList entries={shown} colours={colours} today={today} />
        )}
      </section>
    </div>
  )
}

// ── Import ────────────────────────────────────────────────────────────────

function ImportCard({ modules, hasImported }: { modules: ModuleOption[]; hasImported: boolean }) {
  const { addTimetable, deleteTimetable, toast, today } = useApp()
  const { timetable } = useData()
  const [via, setVia] = useState<'link' | 'file'>('link')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<IcsResult | null>(null)
  const [replace, setReplace] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const codes = modules.map((m) => m.code)

  function read(text: string) {
    const result = parseIcs(text, codes, today)
    if (result.entries.length === 0) throw new Error('No timed sessions found in that calendar for the coming year.')
    setPreview(result)
  }

  async function fromLink(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/calendar?url=${encodeURIComponent(link.trim())}`)
      if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? 'Couldn’t read that link.')
      read(await res.text())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t read that link.')
    } finally {
      setBusy(false)
    }
  }

  async function fromFile(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error('That file is too big to be a timetable.')
      read(await file.text())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t read that file.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function confirm() {
    if (!preview) return
    setBusy(true)
    try {
      if (replace && hasImported) await deleteTimetable(timetable.filter((e) => e.source === 'calendar').map((e) => e.id))
      await addTimetable(preview.entries)
      toast(`Added ${preview.entries.length} sessions.`)
      setPreview(null)
      setLink('')
    } catch {
      toast('Couldn’t save the timetable just now.')
    } finally {
      setBusy(false)
    }
  }

  if (preview) {
    const first = preview.entries[0].date
    const last = preview.entries[preview.entries.length - 1].date
    const found = new Set(preview.entries.map((e) => e.module).filter(Boolean)).size
    return (
      <section className="card p-6" aria-labelledby="import">
        <h2 id="import" className="text-[20px] font-semibold">
          Ready to import
        </h2>
        <p className="mt-2 text-[15px] text-muted">
          <b className="text-ink">{preview.entries.length} sessions</b> from {fmtShort(first)} to {fmtShort(last)}
          {found > 0 ? `, ${found} matched to your modules` : ''}.
          {preview.skippedAllDay > 0 && ` ${preview.skippedAllDay} all-day ${preview.skippedAllDay === 1 ? 'event was' : 'events were'} left out.`}
        </p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-[10px] bg-wash p-3 text-[14px]">
          {preview.entries.slice(0, 8).map((e) => (
            <li key={e.id} className="flex gap-2">
              <span className="w-28 shrink-0 tabular-nums text-muted">
                {fmtShort(e.date)} {e.start}
              </span>
              <span className="truncate">{e.title}</span>
            </li>
          ))}
          {preview.entries.length > 8 && <li className="text-muted">…and {preview.entries.length - 8} more</li>}
        </ul>
        {hasImported && (
          <label className="mt-3 flex items-center gap-2 text-[14px]">
            <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            Replace sessions I imported before
          </label>
        )}
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" disabled={busy} onClick={() => void confirm()}>
            {busy ? 'Importing…' : 'Import sessions'}
          </button>
          <button className="btn btn-quiet" disabled={busy} onClick={() => setPreview(null)}>
            Cancel
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card p-6" aria-labelledby="import">
      <h2 id="import" className="text-[20px] font-semibold">
        Import from your university
      </h2>
      <p className="mt-1 text-[15px] text-muted">Most timetable systems have an “iCal”, “ICS” or “Subscribe” option.</p>
      <div role="tablist" aria-label="Import from" className="mt-4 inline-grid grid-cols-2 rounded-[10px] bg-wash p-1">
        {(
          [
            ['link', 'Calendar link'],
            ['file', '.ics file'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={via === key}
            onClick={() => {
              setVia(key)
              setError(null)
            }}
            className={`min-h-9 rounded-lg px-4 text-[14px] font-semibold ${via === key ? 'bg-card text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {via === 'link' ? (
        <form onSubmit={fromLink} className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Calendar link</span>
            <input
              className="field"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="https://… or webcal://…"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <button className="btn btn-primary mt-3" disabled={busy || !link.trim()}>
            {busy ? 'Reading…' : 'Read calendar'}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-[#c9ced6] bg-wash/60 px-4 text-center hover:bg-wash">
            <span className="text-[15px] font-semibold">Choose an .ics file</span>
            <span className="text-[13px] text-muted">Exported from your university timetable or calendar app</span>
            <input ref={fileRef} type="file" accept=".ics,text/calendar" className="sr-only" onChange={(e) => void fromFile(e.target.files?.[0])} />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-[10px] bg-danger-soft px-3 py-2.5 text-[14px] text-danger-ink">
          {error}
        </p>
      )}
    </section>
  )
}

// ── Add by hand ──────────────────────────────────────────────────────────

function AddCard({ modules }: { modules: ModuleOption[] }) {
  const { addTimetable, toast, today } = useApp()
  const moduleName = useModuleName()
  const [title, setTitle] = useState('')
  const [module, setModule] = useState('')
  const [date, setDate] = useState(today)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [room, setRoom] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [until, setUntil] = useState(addDays(today, 7 * 11))
  const [assessment, setAssessment] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (end <= start) {
      setError('The session needs to end after it starts.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const mod = module || detectModule(title, modules.map((m) => m.code))
      const entries = weeklyEntries(
        { title: title.trim(), module: mod, room: room.trim() || null, start, end, isAssessment: assessment },
        date,
        repeat ? until : null,
      )
      await addTimetable(entries)
      toast(entries.length === 1 ? 'Session added.' : `Added ${entries.length} weekly sessions.`)
      setTitle('')
      setRoom('')
      setAssessment(false)
    } catch {
      toast('Couldn’t save that just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card p-6" aria-labelledby="add">
      <h2 id="add" className="text-[20px] font-semibold">
        Add a session
      </h2>
      <form onSubmit={submit} className="mt-4 grid grid-cols-2 gap-3">
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1.5 block text-[14px] font-medium">What is it?</span>
          <input className="field" required maxLength={80} placeholder="e.g. Dispensing lecture" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1.5 block text-[14px] font-medium">Module</span>
          <select className="field" value={module} onChange={(e) => setModule(e.target.value)}>
            <option value="">None / not sure</option>
            {modules.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} · {moduleName(m.code, m.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-[14px] font-medium">Date</span>
          <input className="field" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Starts</span>
            <input className="field" type="time" required value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Ends</span>
            <input className="field" type="time" required value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-[14px] font-medium">Room (optional)</span>
          <input className="field" maxLength={60} value={room} onChange={(e) => setRoom(e.target.value)} />
        </label>
        <div className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
            Repeats every week
          </label>
          {repeat && (
            <label className="flex items-center gap-2">
              until
              <input className="field min-h-9 w-auto py-1 text-[14px]" type="date" min={date} value={until} onChange={(e) => setUntil(e.target.value)} />
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={assessment} onChange={(e) => setAssessment(e.target.checked)} />
            It’s an assessment
          </label>
        </div>
        {error && (
          <p role="alert" className="col-span-2 text-[14px] text-danger-ink">
            {error}
          </p>
        )}
        <div className="col-span-2">
          <button className="btn btn-primary" disabled={busy}>
            <PlusIcon className="size-[18px]" />
            {busy ? 'Adding…' : repeat ? 'Add weekly sessions' : 'Add session'}
          </button>
        </div>
      </form>
    </section>
  )
}

// ── The list ─────────────────────────────────────────────────────────────

function WeekList({ entries, colours, today }: { entries: TimetableEntry[]; colours: ColourMap; today: string }) {
  const weeks = new Map<string, TimetableEntry[]>()
  for (const e of entries) weeks.set(mondayOf(e.date), [...(weeks.get(mondayOf(e.date)) ?? []), e])
  return (
    <div className="mt-3 space-y-4">
      {[...weeks].map(([monday, list]) => (
        <div key={monday} className="card overflow-hidden">
          <p className="border-b border-line px-5 py-3 text-[14px] font-semibold text-muted">
            Week of {fmtRange(monday, addDays(monday, 6))}
            {monday === mondayOf(today) && <span className="ml-2 rounded-md bg-rose-soft px-1.5 py-0.5 text-[12px] text-rose-ink">This week</span>}
          </p>
          <ul className="divide-y divide-line/80">
            {list.map((e) => (
              <EntryRow key={e.id} e={e} colours={colours} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function EntryRow({ e, colours }: { e: TimetableEntry; colours: ColourMap }) {
  const { deleteTimetable, toast } = useApp()
  const { timetable } = useData()
  const [asking, setAsking] = useState(false)
  const seriesIds = e.series ? timetable.filter((x) => x.series === e.series).map((x) => x.id) : [e.id]

  async function remove(ids: string[]) {
    try {
      await deleteTimetable(ids)
      toast(ids.length === 1 ? 'Session removed.' : `Removed ${ids.length} sessions.`)
    } catch {
      toast('Couldn’t remove that just now.')
    }
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] tabular-nums text-muted">
            {fmtDayLong(e.date)} · {e.start}–{e.end}
          </span>
          {e.module && <ModuleChip code={e.module} colours={colours} />}
          {e.isAssessment && <span className="text-[13px] font-semibold text-lilac-ink">Assessment</span>}
        </p>
        <p className="mt-0.5 truncate text-[16px] font-medium">{e.title}</p>
        {e.room && <p className="truncate text-[14px] text-muted">{e.room}</p>}
      </div>
      {asking ? (
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
          <button className="btn btn-quiet min-h-9 px-3 text-[13px] text-danger-ink" onClick={() => void remove([e.id])}>
            This one
          </button>
          {seriesIds.length > 1 && (
            <button className="btn btn-quiet min-h-9 px-3 text-[13px] text-danger-ink" onClick={() => void remove(seriesIds)}>
              Every week ({seriesIds.length})
            </button>
          )}
          <button className="btn btn-ghost min-h-9 px-3 text-[13px]" onClick={() => setAsking(false)}>
            Keep
          </button>
        </div>
      ) : (
        <button
          className="btn btn-ghost size-10 min-h-10 p-0"
          aria-label={`Remove ${e.title} on ${fmtDayLong(e.date)}`}
          onClick={() => (seriesIds.length > 1 ? setAsking(true) : void remove([e.id]))}
        >
          <TrashIcon className="size-[18px]" />
        </button>
      )}
    </li>
  )
}

function ClearAll({ count }: { count: number }) {
  const { deleteTimetable, toast } = useApp()
  const { timetable } = useData()
  const [sure, setSure] = useState(false)
  if (!sure) {
    return (
      <button className="btn btn-ghost min-h-9 px-3 text-[14px] text-danger-ink" onClick={() => setSure(true)}>
        Clear timetable
      </button>
    )
  }
  return (
    <span className="flex items-center gap-2 text-[14px]">
      Remove all {count}?
      <button
        className="btn btn-quiet min-h-9 px-3 text-[14px] text-danger-ink"
        onClick={async () => {
          try {
            await deleteTimetable(timetable.map((e) => e.id))
            toast('Timetable cleared.')
          } catch {
            toast('Couldn’t clear it just now.')
          }
          setSure(false)
        }}
      >
        Yes, clear
      </button>
      <button className="btn btn-ghost min-h-9 px-3 text-[14px]" onClick={() => setSure(false)}>
        Cancel
      </button>
    </span>
  )
}
