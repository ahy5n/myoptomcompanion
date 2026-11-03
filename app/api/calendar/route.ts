// Fetches a student's calendar link (.ics) for them, since browsers can't
// read another site's calendar directly. Public https addresses only.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 3 * 1024 * 1024

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  }
  return h.includes(':') // any IPv6 literal
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('url')?.trim() ?? ''
  let url: URL
  try {
    url = new URL(raw.replace(/^webcals?:\/\//i, 'https://'))
  } catch {
    return NextResponse.json({ error: 'That link doesn’t look right.' }, { status: 400 })
  }
  if (url.protocol !== 'https:' || isPrivateHost(url.hostname)) {
    return NextResponse.json({ error: 'Use the https:// (or webcal://) calendar link from your university.' }, { status: 400 })
  }

  try {
    // Follow redirects by hand so each hop gets the same public-host check.
    let res: Response | null = null
    for (let hop = 0; hop < 4; hop++) {
      res = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(12000),
        headers: { accept: 'text/calendar, text/plain;q=0.9, */*;q=0.5' },
      })
      const next = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null
      if (!next) break
      url = new URL(next, url)
      if (url.protocol !== 'https:' || isPrivateHost(url.hostname)) {
        return NextResponse.json({ error: 'That calendar link redirects somewhere we can’t read.' }, { status: 400 })
      }
    }
    if (!res) throw new Error('no response')
    if (!res.ok) return NextResponse.json({ error: `The calendar site answered ${res.status}. Check the link is still valid.` }, { status: 502 })
    if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) {
      return NextResponse.json({ error: 'That calendar is too big to import.' }, { status: 413 })
    }
    const text = await res.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'That calendar is too big to import.' }, { status: 413 })
    if (!/BEGIN:VCALENDAR/i.test(text)) {
      return NextResponse.json({ error: 'That link didn’t return a calendar. Look for an “iCal”, “ICS” or “subscribe” link.' }, { status: 422 })
    }
    return new NextResponse(text, { headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Couldn’t reach that calendar link. Try downloading the .ics file instead.' }, { status: 504 })
  }
}
