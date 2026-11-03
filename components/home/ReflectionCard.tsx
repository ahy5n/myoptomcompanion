'use client'

import { useState } from 'react'
import { daysBetween } from '@/lib/dates'
import type { ResolvedVerse } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { VerseCard } from './VerseCard'

/** The optional daily line under the greeting: off unless chosen in Settings. */
export function ReflectionCard({ verses, quotes }: { verses: ResolvedVerse[]; quotes: string[] }) {
  const { profile } = useData()
  if (profile.reflection === 'faith') return <VerseCard verses={verses} />
  if (profile.reflection === 'quotes') return <QuoteCard quotes={quotes} />
  return null
}

function QuoteCard({ quotes }: { quotes: string[] }) {
  const { today } = useApp()
  const [offset, setOffset] = useState(0)
  if (!quotes.length) return null
  const base = ((daysBetween('2026-01-01', today) % quotes.length) + quotes.length) % quotes.length
  const q = quotes[(base + offset) % quotes.length]

  return (
    <figure className="card relative overflow-hidden">
      <button className="block w-full px-6 pb-5 pt-6 text-left sm:px-7" onClick={() => setOffset((o) => o + 1)} aria-label="Show another quote">
        <blockquote className="text-[18px] leading-relaxed text-ink">“{q}”</blockquote>
        <figcaption className="mt-3 flex justify-end text-[12px] text-faint">
          <span aria-hidden>tap for another</span>
        </figcaption>
      </button>
    </figure>
  )
}
