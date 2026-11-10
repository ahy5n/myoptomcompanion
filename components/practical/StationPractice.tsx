'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Checklist } from '@/lib/types'
import { track } from '@/lib/usage'
import { useApp } from '../AppProvider'
import { BackLink } from '../bits'
import { CheckIcon } from '../icons'

export interface Station {
  checklist: Checklist
  topicId: string
  topicTitle: string
  moduleCode: string
}

type Mode = 'solo' | 'partner'
interface Result {
  at: string
  done: number
  total: number
  seconds: number
  limit: number
}

const LIMITS = [5, 7, 10, 15]
const historyKey = (userId: string) => `oc:stations:${userId}`

function readHistory(userId: string): Record<string, Result[]> {
  try {
    return JSON.parse(localStorage.getItem(historyKey(userId)) ?? '{}')
  } catch {
    return {}
  }
}
function saveResult(userId: string, id: string, r: Result) {
  try {
    const h = readHistory(userId)
    h[id] = [r, ...(h[id] ?? [])].slice(0, 20)
    localStorage.setItem(historyKey(userId), JSON.stringify(h))
  } catch {
    // Storage blocked: the result still shows, it just isn't kept.
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

export function StationPractice({ stations }: { stations: Station[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('station')
  const station = stations.find((s) => s.checklist.id === id)

  if (!station) return <StationPicker stations={stations} onPick={(sid) => router.push(`/practical?station=${encodeURIComponent(sid)}`)} />
  return <StationRun key={station.checklist.id} station={station} />
}

function StationPicker({ stations, onPick }: { stations: Station[]; onPick: (id: string) => void }) {
  const { user } = useApp()
  const [history, setHistory] = useState<Record<string, Result[]>>({})
  useEffect(() => setHistory(user ? readHistory(user.id) : {}), [user])
  const byModule = useMemo(() => {
    const m = new Map<string, Station[]>()
    for (const s of stations) m.set(s.moduleCode, [...(m.get(s.moduleCode) ?? []), s])
    return [...m.entries()]
  }, [stations])

  return (
    <div className="mx-auto max-w-[820px]">
      <BackLink href="/checklists">Checklists</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Practical stations</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Run a checklist like an OSCE station: against the clock, alone or with a friend ticking as the examiner. You’ll see what you missed at the end.
      </p>
      <div className="mt-6 space-y-6">
        {byModule.map(([code, list]) => (
          <section key={code}>
            <h2 className="eyebrow">{code}</h2>
            <ul className="card mt-2 divide-y divide-border/80">
              {list.map((s) => {
                const best = (history[s.checklist.id] ?? []).reduce<Result | null>((b, r) => (!b || r.done / r.total > b.done / b.total ? r : b), null)
                return (
                  <li key={s.checklist.id}>
                    <button className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-bg/60" onClick={() => onPick(s.checklist.id)}>
                      <span className="min-w-0">
                        <span className="block text-[16px] font-medium">{s.checklist.title}</span>
                        <span className="text-[13px] text-muted">
                          {s.checklist.steps.length} steps · {s.topicTitle}
                        </span>
                      </span>
                      {best && (
                        <span className="shrink-0 rounded-md bg-good-soft px-2 py-0.5 text-[12.5px] font-semibold text-good-ink">
                          Best {best.done}/{best.total}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function StationRun({ station }: { station: Station }) {
  const { user } = useApp()
  const steps = station.checklist.steps
  const [phase, setPhase] = useState<'setup' | 'running' | 'done'>('setup')
  const [mode, setMode] = useState<Mode>('solo')
  const [limit, setLimit] = useState(7)
  const [ticked, setTicked] = useState<boolean[]>(() => steps.map(() => false))
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(true)
  const startedAt = useRef(0)
  const banked = useRef(0)
  const [last, setLast] = useState<Result | null>(null)
  // The clock's own finish needs the latest ticks, not the ones it started with.
  const tickedRef = useRef(ticked)
  tickedRef.current = ticked

  const left = limit * 60 - elapsed
  const done = ticked.filter(Boolean).length

  // Tick the clock; finish automatically when time runs out.
  useEffect(() => {
    if (phase !== 'running' || paused) return
    startedAt.current = Date.now()
    const t = setInterval(() => {
      const e = banked.current + Math.floor((Date.now() - startedAt.current) / 1000)
      setElapsed(e)
      if (e >= limit * 60) finish(e)
    }, 250)
    return () => {
      banked.current += Math.floor((Date.now() - startedAt.current) / 1000)
      clearInterval(t)
    }
  }, [phase, paused]) // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    setTicked(steps.map(() => false))
    setElapsed(0)
    banked.current = 0
    setPaused(false)
    setHidden(mode === 'partner')
    setPhase('running')
  }

  function finish(at = elapsed) {
    const r: Result = { at: new Date().toISOString(), done: tickedRef.current.filter(Boolean).length, total: steps.length, seconds: Math.min(at, limit * 60), limit }
    if (user) {
      const prev = readHistory(user.id)[station.checklist.id] ?? []
      setLast(prev.reduce<Result | null>((b, x) => (!b || x.done / x.total > b.done / b.total ? x : b), null))
      saveResult(user.id, station.checklist.id, r)
    }
    if (navigator.vibrate && at >= limit * 60) navigator.vibrate([200, 100, 200])
    track('osce_finished')
    setPhase('done')
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-[680px]">
        <BackLink href="/practical">All stations</BackLink>
        <p className="mt-2 text-[14px] font-medium text-muted">
          {station.moduleCode} ·{' '}
          <Link href={`/t/${station.topicId}#checklist`} className="underline-offset-4 hover:text-ink hover:underline">
            {station.topicTitle}
          </Link>
        </p>
        <h1 className="mt-1 text-[30px] font-semibold">{station.checklist.title}</h1>
        <p className="mt-1 text-muted">{steps.length} steps to get through.</p>

        <section className="card mt-6 space-y-5 p-5">
          <div>
            <p className="text-[14px] font-semibold">How are you practising?</p>
            <div role="radiogroup" className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['solo', 'On my own', 'Do the routine, then tick what you did.'],
                  ['partner', 'With a partner', 'They hold the phone and tick as the examiner. Steps stay hidden from you.'],
                ] as const
              ).map(([key, title, body]) => (
                <button
                  key={key}
                  role="radio"
                  aria-checked={mode === key}
                  onClick={() => setMode(key)}
                  className={`rounded-xl border-2 p-3 text-left ${mode === key ? 'border-accent bg-accent-soft' : 'border-border hover:border-muted/50'}`}
                >
                  <span className="block text-[15px] font-semibold">{title}</span>
                  <span className="text-[13.5px] text-muted">{body}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[14px] font-semibold">Time limit</p>
            <div role="radiogroup" className="mt-2 flex flex-wrap gap-2">
              {LIMITS.map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={limit === m}
                  onClick={() => setLimit(m)}
                  className={`min-h-10 rounded-lg px-4 text-[14px] font-semibold ${limit === m ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-ink'}`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-muted">Check your university’s station length; 5–10 minutes is common.</p>
          </div>
          <button className="btn btn-primary w-full" onClick={start}>
            Start the clock
          </button>
        </section>
      </div>
    )
  }

  if (phase === 'done') {
    const missed = steps.filter((_, i) => !ticked[i])
    const r = { done, total: steps.length }
    return (
      <div className="mx-auto max-w-[680px]">
        <BackLink href="/practical">All stations</BackLink>
        <h1 className="mt-2 text-[30px] font-semibold">{station.checklist.title}</h1>
        <section className="card mt-6 p-6 text-center" role="status">
          <p className="text-[48px] font-semibold leading-none">
            {r.done}/{r.total}
          </p>
          <p className="mt-2 text-muted">
            steps in {mmss(Math.min(elapsed, limit * 60))}
            {elapsed >= limit * 60 ? ' (time ran out)' : ` of ${limit}:00`}
          </p>
          {last && (
            <p className="mt-1 text-[14px] text-muted">
              Your previous best: {last.done}/{last.total}
              {r.done / r.total > last.done / last.total ? ' — a new best!' : ''}
            </p>
          )}
        </section>
        {missed.length > 0 ? (
          <section className="card mt-4 p-5">
            <h2 className="text-[17px] font-semibold">Missed steps</h2>
            <ol className="mt-3 space-y-2">
              {steps.map((s, i) =>
                ticked[i] ? null : (
                  <li key={i} className="flex gap-3 text-[15px]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-bad-soft text-[12px] font-bold text-bad-ink">{i + 1}</span>
                    {s}
                  </li>
                ),
              )}
            </ol>
          </section>
        ) : (
          <p className="card mt-4 p-5 text-center font-semibold text-good-ink">Every step covered.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={start}>
            Run it again
          </button>
          <Link href="/practical" className="btn btn-quiet">
            Another station
          </Link>
        </div>
      </div>
    )
  }

  // Running
  const urgent = left <= 60
  return (
    <div className="mx-auto max-w-[680px]">
      <div className="card sticky top-20 z-10 flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[13px] font-semibold text-muted">{station.checklist.title}</p>
          <p className={`font-mono text-[40px] font-semibold leading-none tabular-nums ${urgent ? 'text-bad-ink' : ''}`} aria-live="off">
            {mmss(left)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[14px] text-muted">
            {done}/{steps.length} ticked
          </span>
          <div className="flex gap-2">
            <button className="btn btn-quiet min-h-10 px-3" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-primary min-h-10 px-3" onClick={() => finish()}>
              Finish
            </button>
          </div>
        </div>
      </div>

      {mode === 'partner' && hidden ? (
        <div className="card mt-4 p-6 text-center">
          <p className="text-[17px] font-semibold">Examiner: tap to see the mark sheet</p>
          <p className="mt-1 text-[14px] text-muted">The candidate shouldn’t see the steps. Tick each one as they do it.</p>
          <button className="btn btn-soft mt-4" onClick={() => setHidden(false)}>
            Show mark sheet
          </button>
        </div>
      ) : (
        <ol className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
                aria-pressed={ticked[i]}
                className={`card flex w-full items-start gap-3 p-4 text-left transition-colors ${ticked[i] ? 'bg-good-soft' : ''}`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-[13px] font-bold ${
                    ticked[i] ? 'border-good-ink bg-good-ink text-surface' : 'border-border text-muted'
                  }`}
                >
                  {ticked[i] ? <CheckIcon className="size-4" /> : i + 1}
                </span>
                <span className="pt-0.5 text-[15px]">{s}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
