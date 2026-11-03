'use client'

import { useState } from 'react'
import { useApp } from './AppProvider'
import { type Course, CoursePicker } from './CoursePicker'
import { Logo } from './Logo'

type Tab = 'sign-in' | 'sign-up'

const FEATURES: [string, string][] = [
  ['Every module, topic by topic', 'Summaries, exam traps, diagrams and practical checklists for UK optometry.'],
  ['Quizzes that learn from you', 'Questions you got wrong come back more often until they stick.'],
  ['Know what you need', 'Enter your weightings and marks to see what the rest of the year needs.'],
  ['A tutor on hand', 'Send any topic straight to Claude to explain it again or quiz you.'],
]

export function LoginScreen() {
  const [tab, setTab] = useState<Tab>('sign-in')

  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between bg-accent-soft px-12 py-10 text-ink lg:flex xl:px-16">
        <Logo size={34} />
        <div className="max-w-[520px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-strong">For UK optometry students</p>
          <h1 className="mt-4 text-[44px] font-semibold leading-[1.08] tracking-[-0.03em] xl:text-[52px]">
            Revision that remembers what you got wrong.
          </h1>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map(([title, body]) => (
              <li key={title} className="border-t border-ink/15 pt-4">
                <p className="text-[15px] font-semibold">{title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-muted">A revision aid in testing. Not affiliated with any university.</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo size={30} />
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <div className="lg:hidden">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em]">Revision that remembers what you got wrong.</h1>
            <p className="mt-2 text-[15px] text-muted">A study companion for UK optometry students.</p>
          </div>

          <div role="tablist" aria-label="Account" className="mt-8 grid grid-cols-2 rounded-[11px] bg-accent-soft p-1 lg:mt-0">
            {(
              [
                ['sign-in', 'Sign in'],
                ['sign-up', 'Create account'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`min-h-10 rounded-lg text-[14px] font-semibold transition-colors ${
                  tab === key ? 'bg-surface text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'sign-in' ? <SignInForm onSwitch={() => setTab('sign-up')} /> : <SignUpForm onSwitch={() => setTab('sign-in')} />}
        </div>
        <p className="text-center text-[12px] text-muted lg:hidden">A revision aid in testing. Not affiliated with any university.</p>
      </main>
    </div>
  )
}

function useSubmit(action: () => Promise<void>, fallback: string) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback)
      setBusy(false)
    }
  }
  return { busy, error, submit }
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { signIn, mode } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, submit } = useSubmit(() => signIn(email, password), 'Couldn’t sign in.')

  return (
    <form onSubmit={submit} className="fade-in mt-8 space-y-4" role="tabpanel" aria-label="Sign in">
      <div>
        <h2 className="text-[22px] font-semibold">Welcome back</h2>
        <p className="mt-1 text-[15px] text-muted">Sign in to pick up where you left off.</p>
      </div>
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
      <FormError error={error} />
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-center text-[14px] text-muted">
        New here?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-accent underline-offset-4 hover:underline">
          Create an account
        </button>
      </p>
      {mode === 'local' && <LocalNote />}
    </form>
  )
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { signUp, mode } = useApp()
  const [name, setName] = useState('')
  const [course, setCourse] = useState<Course>({ university: null, studyYear: null })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, submit } = useSubmit(() => signUp(email, password, { displayName: name, ...course }), 'Couldn’t create the account.')

  return (
    <form onSubmit={submit} className="fade-in mt-8 space-y-4" role="tabpanel" aria-label="Create account">
      <div>
        <h2 className="text-[22px] font-semibold">Create your account</h2>
        <p className="mt-1 text-[15px] text-muted">Free while we’re testing. Takes ten seconds.</p>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[14px] font-medium">Your first name</span>
        <input className="field" autoComplete="given-name" maxLength={40} required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <CoursePicker value={course} onChange={setCourse} required />
      <EmailField value={email} onChange={setEmail} hint="Used to sign in. We won’t send you marketing." />
      <PasswordField value={password} onChange={setPassword} autoComplete="new-password" hint="At least 6 characters." />
      <FormError error={error} />
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-[14px] text-muted">
        Already have one?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-accent underline-offset-4 hover:underline">
          Sign in
        </button>
      </p>
      {mode === 'local' && <LocalNote />}
    </form>
  )
}

function EmailField({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium">Email</span>
      <input
        className="field"
        type="text"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1.5 block text-[13px] text-muted">{hint}</span>}
    </label>
  )
}

function PasswordField({
  value,
  onChange,
  autoComplete,
  hint,
}: {
  value: string
  onChange: (v: string) => void
  autoComplete: string
  hint?: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium">Password</span>
      <span className="relative block">
        <input
          className="field pr-16"
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={autoComplete === 'new-password' ? 6 : undefined}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-md px-2.5 text-[13px] font-semibold text-muted hover:bg-bg hover:text-ink"
          aria-label={shown ? 'Hide password' : 'Show password'}
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </span>
      {hint && <span className="mt-1.5 block text-[13px] text-muted">{hint}</span>}
    </label>
  )
}

function FormError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-[10px] bg-bad-soft px-3 py-2.5 text-[14px] text-bad-ink">
      {error}
    </p>
  )
}

function LocalNote() {
  return <p className="text-center text-[12px] leading-snug text-muted">Accounts on this preview are saved in this browser only.</p>
}
