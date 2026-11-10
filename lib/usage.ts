// Anonymous usage counts: which pages and features get used. No user id,
// no cookie, nothing stored in the browser. Skipped when the browser asks
// not to be tracked (Do Not Track / Global Privacy Control).
import { accountBackend, type UsageEvent } from './store'

let queue: UsageEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function optedOut(): boolean {
  if (typeof navigator === 'undefined') return true
  const n = navigator as Navigator & { globalPrivacyControl?: boolean }
  return n.doNotTrack === '1' || n.globalPrivacyControl === true
}

function flush() {
  timer = null
  const batch = queue
  queue = []
  void accountBackend.logUsage(batch)
}

/** Paths keep their shape but lose ids and query strings: /flashcards?set=abc → /flashcards. */
export function cleanPath(path: string): string {
  return path.split(/[?#]/)[0].slice(0, 120) || '/'
}

export function track(event: string, path: string | null = null) {
  if (optedOut() || accountBackend.mode !== 'supabase') return
  queue.push({ event: event.slice(0, 60), path: path ? cleanPath(path) : null })
  if (!timer) timer = setTimeout(flush, 4000)
}

if (typeof window !== 'undefined') {
  // Send anything waiting when the tab is hidden or closed.
  addEventListener('pagehide', () => queue.length && flush())
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && queue.length && flush())
}
