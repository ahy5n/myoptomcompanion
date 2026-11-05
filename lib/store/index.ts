import { localBackend } from './local'
import { supabaseBackend } from './supabase'
import type { Backend } from './types'

export const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const accounts: Backend = hasSupabase ? supabaseBackend : localBackend

// Guests try the app without an account. Their progress lives in this
// browser (the device-only backend), whatever the site normally uses.
const GUEST_KEY = 'oc:guest'
export function isGuest(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}
export function setGuest(on: boolean) {
  try {
    if (on) localStorage.setItem(GUEST_KEY, '1')
    else localStorage.removeItem(GUEST_KEY)
  } catch {
    // Storage blocked: guest mode can't persist, and the app falls back to accounts.
  }
}

/** The account backend, ignoring guest mode (for copying guest progress into a new account). */
export const accountBackend = accounts

/** Whichever backend applies right now: device storage for guests, accounts otherwise. */
export const backend: Backend = new Proxy({} as Backend, {
  get(_, key) {
    const b = isGuest() ? localBackend : accounts
    const v = b[key as keyof Backend]
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(b) : v
  },
})

export { clearGuestData, readGuestData, startGuest } from './local'
export * from './types'
