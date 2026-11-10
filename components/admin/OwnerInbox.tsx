'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fmtShort } from '@/lib/dates'
import { type AdminInbox, backend, type FeedbackKind } from '@/lib/store'
import { useApp } from '../AppProvider'
import { BackLink } from '../bits'
import { ResetIcon } from '../icons'

type Tab = 'overview' | 'feedback' | 'flags' | 'signups'

const KIND_LABEL: Record<FeedbackKind, string> = { bug: 'Bug', idea: 'Idea', content: 'Lesson mistake', other: 'Other' }
const KIND_PILL: Record<FeedbackKind, string> = {
  bug: 'bg-bad-soft text-bad-ink',
  idea: 'bg-accent-soft text-accent-strong',
  content: 'bg-warn-soft text-warn-ink',
  other: 'bg-bg text-muted',
}

/** Usage events as a reader would say them. */
const EVENT_LABEL: Record<string, string> = {
  signup: 'Accounts created',
  guest_start: 'Guest sessions started',
  answer_mcq: 'Quiz questions answered',
  answer_flashcard: 'Flashcards marked',
  answer_case: 'Clinical cases answered',
  timetable_added: 'Timetable imports / additions',
  slides_saved: 'Slide decks added',
  flashcards_saved: 'Flashcard sets saved',
  placement_emailed: 'Placements marked emailed',
  placement_interview: 'Placements marked interview',
  placement_confirmed: 'Placements marked confirmed',
  osce_finished: 'Practical stations run',
}

const when = (iso: string) => `${fmtShort(iso.slice(0, 10))}, ${iso.slice(11, 16)}`

export function OwnerInbox() {
  const { user, mode } = useApp()
  const [inbox, setInbox] = useState<AdminInbox | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setInbox(await backend.adminInbox(user))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t load the inbox.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => void load(), [load])

  const tabs: { key: Tab; label: string; n?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'feedback', label: 'Feedback', n: inbox?.feedback.length },
    { key: 'flags', label: 'Flags', n: inbox?.flags.length },
    { key: 'signups', label: 'Sign-ups', n: inbox?.signups.length },
  ]

  return (
    <div className="mx-auto max-w-[960px]">
      <BackLink href="/settings">Settings</BackLink>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold">Owner inbox</h1>
          <p className="mt-1 text-muted">
            {mode === 'supabase' ? 'Feedback, flagged questions, sign-ups and usage from everyone on the site.' : 'Device-only preview: this shows the notes saved in this browser.'}
          </p>
        </div>
        <button className="btn btn-quiet" onClick={() => void load()} disabled={loading}>
          <ResetIcon className="size-[18px]" />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="card mt-6 p-6">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-[14px] text-muted">
            To open this page, run <code>supabase/schema.sql</code> in the Supabase SQL Editor, then add your sign-in email with:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-bg p-3 text-[13px]">insert into public.admins (email) values (&apos;you@example.com&apos;);</pre>
        </div>
      ) : (
        inbox && (
          <>
            <div role="tablist" aria-label="Inbox sections" className="no-scrollbar -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`min-h-10 shrink-0 rounded-lg px-3.5 text-[14px] font-semibold ${
                    tab === t.key ? 'bg-accent text-on-accent' : 'bg-surface text-muted shadow-[var(--shadow-soft)] hover:text-ink'
                  }`}
                >
                  {t.label}
                  {t.n !== undefined && <span className="ml-1.5 opacity-75">{t.n}</span>}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {tab === 'overview' && <Overview inbox={inbox} onOpen={setTab} />}
              {tab === 'feedback' && <FeedbackList items={inbox.feedback} />}
              {tab === 'flags' && <FlagList items={inbox.flags} />}
              {tab === 'signups' && <SignupList items={inbox.signups} />}
            </div>
          </>
        )
      )}
    </div>
  )
}

function Stat({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const body = (
    <>
      <p className="text-[28px] font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-[13px] text-muted">{label}</p>
    </>
  )
  return onClick ? (
    <button className="card p-4 text-left hover:shadow-[var(--shadow-lift)]" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="card p-4">{body}</div>
  )
}

function Overview({ inbox, onOpen }: { inbox: AdminInbox; onOpen: (t: Tab) => void }) {
  const { counts, usage } = inbox
  const max = Math.max(1, ...usage.daily.map((d) => d.views))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Accounts" value={counts.users} onClick={() => onOpen('signups')} />
        <Stat label="New this week" value={counts.newUsers7d} />
        <Stat label="Signed in this week" value={counts.active7d} />
        <Stat label="Feedback" value={counts.feedback} onClick={() => onOpen('feedback')} />
        <Stat label="Flags" value={counts.flags} onClick={() => onOpen('flags')} />
      </div>

      <section className="card p-5" aria-labelledby="views-title">
        <h2 id="views-title" className="text-[17px] font-semibold">
          Page views, last 14 days
        </h2>
        {usage.daily.length === 0 ? (
          <p className="mt-2 text-[14px] text-muted">No usage recorded yet.</p>
        ) : (
          <div className="mt-4 flex h-36 items-end gap-1.5" role="img" aria-label={usage.daily.map((d) => `${d.day}: ${d.views}`).join(', ')}>
            {usage.daily.map((d) => (
              <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[11px] text-muted">{d.views}</span>
                <span className="w-full rounded-t-md bg-accent" style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }} />
                <span className="text-[10.5px] text-muted">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-5" aria-labelledby="pages-title">
          <h2 id="pages-title" className="text-[17px] font-semibold">
            Most viewed pages (30 days)
          </h2>
          <ul className="mt-3 space-y-1.5 text-[14px]">
            {usage.pages.length === 0 && <li className="text-muted">Nothing yet.</li>}
            {usage.pages.map((p) => (
              <li key={p.path} className="flex justify-between gap-3">
                <span className="truncate">{p.path}</span>
                <span className="shrink-0 font-semibold">{p.n}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5" aria-labelledby="events-title">
          <h2 id="events-title" className="text-[17px] font-semibold">
            Features used (30 days)
          </h2>
          <ul className="mt-3 space-y-1.5 text-[14px]">
            {usage.events.length === 0 && <li className="text-muted">Nothing yet.</li>}
            {usage.events.map((e) => (
              <li key={e.event} className="flex justify-between gap-3">
                <span className="truncate">{EVENT_LABEL[e.event] ?? e.event.replace(/_/g, ' ')}</span>
                <span className="shrink-0 font-semibold">{e.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-[12.5px] text-muted">
        Usage counts are anonymous: no account, IP address or cookie is stored, and browsers that ask not to be tracked are skipped.
      </p>
    </div>
  )
}

function FeedbackList({ items }: { items: AdminInbox['feedback'] }) {
  const [kind, setKind] = useState<FeedbackKind | 'all'>('all')
  const shown = useMemo(() => (kind === 'all' ? items : items.filter((f) => f.kind === kind)), [items, kind])
  if (!items.length) return <p className="card p-5 text-muted">No feedback yet.</p>
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['all', 'bug', 'idea', 'content', 'other'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`min-h-9 rounded-lg px-3 text-[13.5px] font-semibold ${kind === k ? 'bg-ink text-bg' : 'bg-bg text-muted hover:text-ink'}`}
          >
            {k === 'all' ? 'All' : KIND_LABEL[k]} {k === 'all' ? items.length : items.filter((f) => f.kind === k).length}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {shown.map((f) => (
          <li key={f.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
              <span className={`rounded-md px-1.5 py-0.5 font-semibold ${KIND_PILL[f.kind] ?? KIND_PILL.other}`}>{KIND_LABEL[f.kind] ?? f.kind}</span>
              <span>{when(f.createdAt)}</span>
              {f.page && <span>· from {f.page}</span>}
              {f.name && <span>· {f.name}</span>}
            </div>
            <p className="mt-2 whitespace-pre-line text-[15px]">{f.message}</p>
            {f.canContact && f.email && (
              <a href={`mailto:${f.email}?subject=${encodeURIComponent('Your optom companion feedback')}`} className="mt-2 inline-block text-[14px] font-semibold text-accent underline-offset-4 hover:underline">
                Reply to {f.email}
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

function FlagList({ items }: { items: AdminInbox['flags'] }) {
  if (!items.length) return <p className="card p-5 text-muted">No flagged questions yet.</p>
  return (
    <ul className="space-y-2">
      {items.map((f) => (
        <li key={f.id} className="card p-4">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
            <span>{when(f.createdAt)}</span>
            <span>·</span>
            {f.topicId && f.topicId.startsWith('/') ? (
              <span>{f.topicId}</span>
            ) : (
              <Link href={`/t/${f.topicId}`} className="font-semibold text-accent underline-offset-4 hover:underline">
                {f.topicId}
              </Link>
            )}
            {f.itemId && <span className="font-mono">{f.itemId}</span>}
          </div>
          <p className="mt-2 whitespace-pre-line text-[15px]">{f.message || <span className="text-muted">(no message)</span>}</p>
        </li>
      ))}
    </ul>
  )
}

function SignupList({ items }: { items: AdminInbox['signups'] }) {
  if (!items.length) return <p className="card p-5 text-muted">No accounts yet.</p>
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead className="border-b border-border text-[12.5px] text-muted">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Name</th>
            <th className="px-4 py-2.5 font-semibold">Email</th>
            <th className="px-4 py-2.5 font-semibold">University · year</th>
            <th className="px-4 py-2.5 font-semibold">Joined</th>
            <th className="px-4 py-2.5 font-semibold">Last sign-in</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {items.map((s) => (
            <tr key={s.email}>
              <td className="px-4 py-2.5">{s.name || '—'}</td>
              <td className="px-4 py-2.5 break-all">{s.email}</td>
              <td className="px-4 py-2.5">
                {s.university ?? '—'}
                {s.studyYear ? ` · Y${s.studyYear}` : ''}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">{fmtShort(s.createdAt.slice(0, 10))}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">{s.lastSignIn ? fmtShort(s.lastSignIn.slice(0, 10)) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
