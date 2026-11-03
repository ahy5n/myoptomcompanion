'use client'

import { useEffect, useState } from 'react'
import { fmtShort } from '@/lib/dates'
import type { FeedbackKind } from '@/lib/store'
import { newId } from '@/lib/timetable'
import { useApp, useData } from '../AppProvider'

const KINDS: { value: FeedbackKind; label: string; prompt: string }[] = [
  { value: 'bug', label: 'Something’s broken', prompt: 'What happened, and what did you expect to happen?' },
  { value: 'idea', label: 'An idea', prompt: 'What would make this more useful for you?' },
  { value: 'content', label: 'A mistake in a lesson', prompt: 'Which topic, and what’s wrong? (The Flag button on each question works too.)' },
  { value: 'other', label: 'Something else', prompt: 'Anything you’d like to tell us.' },
]
const LABEL = Object.fromEntries(KINDS.map((k) => [k.value, k.label])) as Record<FeedbackKind, string>
const MAX = 2000

/** Send a note to the people running the site. */
export function FeedbackCard() {
  const { sendFeedback, user } = useApp()
  const { feedback } = useData()
  const [kind, setKind] = useState<FeedbackKind>('idea')
  const [message, setMessage] = useState('')
  const [canContact, setCanContact] = useState(false)
  const [from, setFrom] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The footer link passes the page they were on, so a bug report has context.
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('from')
    if (p?.startsWith('/')) setFrom(p.slice(0, 200))
    if (location.hash === '#feedback') document.getElementById('feedback')?.scrollIntoView()
  }, [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = message.trim()
    if (!text) return
    setBusy(true)
    setError(null)
    try {
      await sendFeedback({ id: newId(), kind, message: text, page: from || '/settings', canContact, createdAt: new Date().toISOString() })
      setMessage('')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t send that just now. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  const prompt = KINDS.find((k) => k.value === kind)!.prompt

  return (
    <section id="feedback" className="card mt-6 scroll-mt-6 p-6" aria-labelledby="feedback-title">
      <h2 id="feedback-title" className="text-[20px] font-semibold">
        Feedback
      </h2>
      <p className="mt-1 text-[14px] text-muted">This is a test version, so tell us what works, what doesn’t and what you’d like next. We read every message.</p>

      {sent ? (
        <div className="mt-4 rounded-xl bg-good-soft px-4 py-4" role="status">
          <p className="font-semibold text-good-ink">Thanks, that’s been sent.</p>
          <button className="mt-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline" onClick={() => setSent(false)}>
            Send something else
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="mt-4">
          <div role="radiogroup" aria-label="What’s it about?" className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                role="radio"
                aria-checked={kind === k.value}
                onClick={() => setKind(k.value)}
                className={`min-h-10 rounded-lg px-3.5 text-[14px] font-semibold transition-colors ${
                  kind === k.value ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-ink'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <label htmlFor="feedback-text" className="sr-only">
            Your message
          </label>
          <textarea
            id="feedback-text"
            className="field mt-3 min-h-[130px]"
            placeholder={prompt}
            value={message}
            maxLength={MAX}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-1 flex justify-between gap-3 text-[12.5px] text-muted">
            <span>{from && `Sent with the page you came from (${from}).`}</span>
            {message.length > MAX * 0.8 && (
              <span>
                {message.length}/{MAX}
              </span>
            )}
          </div>
          <label className="mt-3 flex min-h-10 items-center gap-2 text-[14px]">
            <input type="checkbox" className="size-4" checked={canContact} onChange={(e) => setCanContact(e.target.checked)} />
            Happy for us to email you back{user?.username.includes('@') ? ` at ${user.username}` : ''}
          </label>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-bad-soft px-4 py-3 text-[14px] text-bad-ink">
              {error}
            </p>
          )}
          <button className="btn btn-primary mt-4" disabled={busy || !message.trim()}>
            {busy ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}

      {feedback.length > 0 && (
        <details className="mt-6 border-t border-border pt-4">
          <summary className="text-[14px] font-semibold text-muted hover:text-ink">What you’ve sent ({feedback.length})</summary>
          <ul className="mt-3 space-y-2">
            {feedback.slice(0, 10).map((f) => (
              <li key={f.id} className="rounded-xl bg-bg px-4 py-3 text-[14.5px]">
                <p className="text-[12.5px] font-semibold text-muted">
                  {LABEL[f.kind] ?? 'Feedback'} · {fmtShort(f.createdAt.slice(0, 10))}
                </p>
                <p className="mt-1 whitespace-pre-line">{f.message}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
