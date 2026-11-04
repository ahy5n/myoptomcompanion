'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApp } from '../AppProvider'
import { FormError, PasswordField } from '../LoginScreen'
import { Logo } from '../Logo'

/**
 * Where the reset email's link lands. Supabase reads the token from the
 * link and signs the student in for this one job: choosing a new password.
 */
export function ResetPassword() {
  const { user, setNewPassword, toast } = useApp()
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  // An expired or reused link comes back with the reason in the address.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
    const reason = params.get('error_description')
    if (reason) setLinkError(/expired|invalid/i.test(reason) ? 'This reset link has expired or has already been used.' : reason)
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (password !== again) return setError('Those two passwords don’t match.')
    setBusy(true)
    setError(null)
    try {
      await setNewPassword(password)
      toast('Password changed. You’re signed in.')
      // A full load, so the app opens with the account fresh.
      window.location.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t change the password.')
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <Logo size={30} />
      {!user ? (
        <div className="card mt-8 p-6">
          <h1 className="text-[22px] font-semibold">Link not working</h1>
          <p className="mt-2 text-[15px] text-muted">
            {linkError ?? 'This page only works from the link in a password reset email.'} Ask for a new link from the sign-in page; each one works once.
          </p>
          <Link href="/" className="btn btn-primary mt-5 w-full">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={save} className="card mt-8 space-y-4 p-6">
          <div>
            <h1 className="text-[22px] font-semibold">Choose a new password</h1>
            <p className="mt-1 text-[15px] text-muted">
              For <b className="text-ink">{user.username}</b>.
            </p>
          </div>
          <PasswordField value={password} onChange={setPassword} autoComplete="new-password" label="New password" hint="At least 6 characters." />
          <PasswordField value={again} onChange={setAgain} autoComplete="new-password" label="Type it again" />
          <FormError error={error} />
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </div>
  )
}
