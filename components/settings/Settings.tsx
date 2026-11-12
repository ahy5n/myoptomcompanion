'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fmtShort } from '@/lib/dates'
import { backend, type Reflection } from '@/lib/store'
import { type Course, CoursePicker } from '../CoursePicker'
import { useApp, useData } from '../AppProvider'
import { FALLBACK_CLAUDE_URL } from '../AskClaudeButton'
import { BackLink } from '../bits'
import { SIGNUP_FLAG } from '../LoginScreen'
import { StudyModeSwitch } from '../StudyModeSwitch'
import { AboutApp, Appearance } from './Appearance'
import { FeedbackCard } from './FeedbackCard'

function isClaudeUrl(v: string) {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && (u.hostname === 'claude.ai' || u.hostname.endsWith('.claude.ai'))
  } catch {
    return false
  }
}

export function Settings({ modules }: { modules: { code: string; name: string }[] }) {
  const { setClaudeUrl, toast, mode, signOut, user, guest } = useApp()
  const data = useData()
  const [url, setUrl] = useState(data.profile.claudeProjectUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const v = url.trim()
    if (v && !isClaudeUrl(v)) {
      setError('That doesn’t look like a claude.ai link. It should start with https://claude.ai/project/…')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await setClaudeUrl(v)
      toast('Saved.')
    } catch {
      toast('Couldn’t save just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Settings</h1>

      <Appearance />

      <section className="card mt-6 p-6" aria-labelledby="study-mode">
        <h2 id="study-mode" className="text-[20px] font-semibold">
          Study mode
        </h2>
        <p className="mt-1 text-[16px] text-muted">
          Exams shows the exam essentials and background for each module. Clinical shows the exam essentials and clinical
          know-how, and hides background.
        </p>
        <div className="mt-4">
          <StudyModeSwitch showHint />
        </div>
      </section>

      <AboutYouCard />

      <SubjectNamesCard modules={modules} />

      <section className="card mt-6 p-6" aria-labelledby="claude">
        <h2 id="claude" className="text-[20px] font-semibold">
          Your Claude project link
        </h2>
        <form onSubmit={save} className="mt-3">
          <input
            className="field"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="https://claude.ai/project/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-describedby="claude-help"
          />
          {error && (
            <p role="alert" className="mt-2 text-[14px] text-bad-ink">
              {error}
            </p>
          )}
          <div id="claude-help" className="mt-3 space-y-1.5 text-[15px] text-muted">
            <p>Every “Ask Claude” button copies a question and opens this link, so your tutor chat already knows your course.</p>
            <p>
              To find it: open <b>claude.ai</b>, tap <b>Projects</b>, open your study project, then copy the address from the
              address bar (in Safari, tap the address bar → Copy). It looks like <span className="whitespace-nowrap">claude.ai/project/…</span>
            </p>
            <p>Left empty, the buttons open a new chat at {FALLBACK_CLAUDE_URL.replace('https://', '')}.</p>
          </div>
          <button className="btn btn-primary mt-4" disabled={busy}>
            Save
          </button>
        </form>
      </section>

      {!guest && <PasswordCard />}

      <section className="card mt-6 p-6" aria-labelledby="account">
        <h2 id="account" className="text-[20px] font-semibold">
          Account
        </h2>
        {guest ? (
          <>
            <p className="mt-2 text-[15px] text-muted">
              You’re using a <b className="text-ink">guest account</b>. Progress is saved in this browser only. Create a free account to keep it safe and
              use it on other devices; your guest progress comes with you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  try {
                    sessionStorage.setItem(SIGNUP_FLAG, '1')
                  } catch {}
                  void signOut()
                }}
              >
                Create a free account
              </button>
              <button className="btn btn-quiet" onClick={() => void signOut()}>
                Leave guest mode
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] text-muted">
              Signed in as <b className="text-ink">{user?.username}</b>.{' '}
              {mode === 'supabase'
                ? 'Your ticks, notes and marks sync across your devices.'
                : 'This device only — progress is saved in this browser and won’t appear on other devices.'}
            </p>
            <button className="btn btn-quiet mt-4" onClick={() => void signOut()}>
              Sign out
            </button>
          </>
        )}
      </section>

      {data.flags.length > 0 && (
        <section className="mt-8" aria-labelledby="flags">
          <h2 id="flags" className="text-[20px] font-semibold">
            Things you’ve flagged
          </h2>
          <ul className="mt-3 space-y-2">
            {data.flags.slice(0, 20).map((f, i) => (
              <li key={i} className="card px-4 py-3 text-[15px]">
                <p>{f.message}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {f.topicId}
                  {f.itemId ? ` · ${f.itemId}` : ''} · {fmtShort(f.createdAt.slice(0, 10))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FeedbackCard />

      <OwnerLink />

      <AboutApp />
    </div>
  )
}

const REFLECTIONS: { value: Reflection; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'quotes', label: 'Motivational quotes' },
  { value: 'faith', label: 'Faith-based (Qur’an verses)' },
]

function AboutYouCard() {
  const { saveProfile, toast } = useApp()
  const { profile } = useData()
  const [name, setName] = useState(profile.displayName)
  const [target, setTarget] = useState(String(profile.targetMark))
  const [reflection, setReflection] = useState<Reflection>(profile.reflection)
  const [course, setCourse] = useState<Course>({ university: profile.university, studyYear: profile.studyYear })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = Number(target)
    if (!Number.isFinite(t) || t < 40 || t > 100) {
      setError('Pick a target mark between 40 and 100.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await saveProfile({ displayName: name.trim(), targetMark: t, reflection, ...course })
      toast('Saved.')
    } catch {
      toast('Couldn’t save just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card mt-6 p-6" aria-labelledby="about">
      <h2 id="about" className="text-[20px] font-semibold">
        About you
      </h2>
      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">What should we call you?</span>
          <input className="field" maxLength={40} placeholder={profile.username.split('@')[0]} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">Target average (%)</span>
          <input className="field" type="number" inputMode="numeric" min={40} max={100} value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
        <div className="sm:col-span-2">
          <CoursePicker value={course} onChange={setCourse} />
        </div>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[14px] font-medium">Daily reflection on the home page</span>
          <select className="field" value={reflection} onChange={(e) => setReflection(e.target.value as Reflection)}>
            {REFLECTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p role="alert" className="text-[14px] text-bad-ink sm:col-span-2">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button className="btn btn-primary" disabled={busy}>
            Save
          </button>
        </div>
      </form>
    </section>
  )
}

function PasswordCard() {
  const { changePassword, toast } = useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      toast('Password changed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t change it.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card mt-6 p-6" aria-labelledby="pw">
      <h2 id="pw" className="text-[20px] font-semibold">
        Change password
      </h2>
      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">Current password</span>
          <input className="field" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">New password</span>
          <input className="field" type="password" autoComplete="new-password" minLength={6} required value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        {error && (
          <p role="alert" className="text-[14px] text-bad-ink sm:col-span-2">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button className="btn btn-quiet" disabled={busy}>
            Change password
          </button>
        </div>
      </form>
    </section>
  )
}

/** Rename any subject to match what your university calls it. */
function SubjectNamesCard({ modules }: { modules: { code: string; name: string }[] }) {
  const { setOverride, toast } = useApp()
  const { overrides } = useData()

  function commit(code: string, builtIn: string, value: string) {
    const v = value.trim()
    const next = v && v !== builtIn ? v : null
    if (next === (overrides[code] ?? null)) return
    setOverride(code, next)
    toast(next ? `Renamed ${code}.` : `${code} is back to its usual name.`)
  }

  return (
    <section id="subject-names" className="card mt-6 scroll-mt-6 p-6" aria-labelledby="subject-names-title">
      <h2 id="subject-names-title" className="text-[20px] font-semibold">
        Subject names
      </h2>
      <p className="mt-1 text-[14px] text-muted">
        Call each subject what your university calls it. The new name shows everywhere in the app. Clear a box to go back to the usual name.
      </p>
      <ul className="mt-4 divide-y divide-border/80">
        {modules.map((m) => (
          <SubjectNameRow key={m.code} code={m.code} builtIn={m.name} current={overrides[m.code] ?? ''} onCommit={commit} />
        ))}
      </ul>
    </section>
  )
}

function SubjectNameRow({
  code,
  builtIn,
  current,
  onCommit,
}: {
  code: string
  builtIn: string
  current: string
  onCommit: (code: string, builtIn: string, value: string) => void
}) {
  const [draft, setDraft] = useState(current || builtIn)
  const renamed = !!current
  return (
    <li className="flex items-center gap-3 py-2.5">
      <label htmlFor={`name-${code}`} className="w-12 shrink-0 text-[13px] font-semibold text-muted">
        {code}
      </label>
      <input
        id={`name-${code}`}
        className="field min-h-10 flex-1 py-1.5 text-[15px]"
        value={draft}
        placeholder={builtIn}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onCommit(code, builtIn, draft)
          if (!draft.trim()) setDraft(builtIn)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setDraft(current || builtIn)
        }}
      />
      {renamed ? (
        <button
          type="button"
          className="min-h-10 shrink-0 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
          onClick={() => {
            onCommit(code, builtIn, '')
            setDraft(builtIn)
          }}
          aria-label={`Reset ${code} to ${builtIn}`}
        >
          Reset
        </button>
      ) : (
        <span className="w-[38px] shrink-0" aria-hidden />
      )}
    </li>
  )
}

/** Only shown to accounts listed in the admins table. */
function OwnerLink() {
  const { guest, mode } = useApp()
  const [admin, setAdmin] = useState(false)
  useEffect(() => {
    if (guest || mode !== 'supabase') return
    backend.isAdmin().then(setAdmin, () => setAdmin(false))
  }, [guest, mode])
  if (!admin) return null
  return (
    <Link href="/admin" className="card mt-6 flex items-center justify-between p-5 hover:shadow-[var(--shadow-lift)]">
      <span>
        <span className="block text-[17px] font-semibold">Owner inbox</span>
        <span className="text-[14px] text-muted">Feedback, flagged questions, sign-ups and usage</span>
      </span>
      <span aria-hidden className="text-muted">→</span>
    </Link>
  )
}
