'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { inkColour } from '@/lib/colour'
import { isDue } from '@/lib/leitner'
import { type LibraryModule, moduleProgress } from '@/lib/progress'
import { getUniversity, subjectYearsAt, yearLabel } from '@/lib/universities'
import { useApp, useData } from '../AppProvider'
import { ProgressRing } from '../bits'
import { ChevronRight } from '../icons'
import { YourCourse } from './YourCourse'

type Filter = 'mine' | 'all' | number

export function Library({
  modules,
  knownItemIds,
  checklistCount,
}: {
  modules: LibraryModule[]
  knownItemIds: string[]
  checklistCount: number
}) {
  const { today } = useApp()
  const data = useData()
  const { university, studyYear } = data.profile
  const uni = getUniversity(university)
  const [filter, setFilter] = useState<Filter>(studyYear ? 'mine' : 'all')
  // Jump to their year as soon as they set or change it.
  useEffect(() => {
    if (studyYear) setFilter('mine')
  }, [studyYear, university])

  const known = new Set(knownItemIds)
  const due = Object.values(data.reviews).filter((r) => known.has(r.itemId) && isDue(r, today)).length
  const inDeck = Object.values(data.reviews).filter((r) => known.has(r.itemId) && r.box < 5).length
  // Which years each subject comes up in: at their university if we know it,
  // otherwise when UK degrees usually teach it.
  const yearsOf = (m: LibraryModule) => {
    const atUni = subjectYearsAt(uni, m.code)
    return uni ? atUni : m.years
  }
  const yearCount = uni?.years ?? Math.max(4, studyYear ?? 0)
  const wanted = filter === 'mine' ? studyYear : filter === 'all' ? null : filter
  const shown = (wanted ? modules.filter((m) => yearsOf(m).includes(wanted)) : modules)
    .slice()
    .sort((a, b) => (Math.min(...yearsOf(a), 9) - Math.min(...yearsOf(b), 9)) || 0)
  const filters: { key: Filter; label: string }[] = [
    ...(studyYear ? [{ key: 'mine' as const, label: `My year (${studyYear})` }] : []),
    { key: 'all', label: 'All' },
    ...Array.from({ length: yearCount }, (_, i) => ({ key: i + 1, label: `Year ${i + 1}` })).filter((f) => f.key !== studyYear),
  ]

  return (
    <section aria-labelledby="library">
      <YourCourse modules={modules} />

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="library" className="text-[22px] font-semibold">
          Subject library
        </h2>
        <p className="text-[13px] text-muted">
          {uni ? `Years as taught at ${uni.short}` : 'Years as usually taught in the UK'}
          {' · '}
          <Link href="/settings#subject-names" className="font-semibold text-ink underline-offset-4 hover:underline">
            Rename subjects
          </Link>
        </p>
      </div>

      <div role="group" aria-label="Filter by year" className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={String(f.key)}
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={`min-h-10 shrink-0 rounded-lg px-3.5 text-[14px] font-semibold transition-colors ${
                active ? 'bg-accent text-on-accent' : 'bg-surface text-muted shadow-[var(--shadow-soft)] hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>
      {shown.length === 0 && <p className="mt-3 text-[14px] text-muted">No subjects match this year yet.</p>}

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((m) => {
          const pct = moduleProgress(m.rowIds, data.progress)
          const name = data.overrides[m.code] || m.name
          return (
            <li key={m.code}>
              <Link
                href={`/m/${m.code}`}
                className="card group flex h-full min-h-[132px] flex-col justify-between overflow-hidden p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[15px] font-semibold tracking-tight"
                    style={{ background: m.colour, color: inkColour(m.colour) }}
                  >
                    {m.code}
                  </span>
                  <ProgressRing value={pct} colour={m.colour} label={`${m.code} ${Math.round(pct * 100)}% ticked`} />
                </div>
                <div>
                  <p className="text-[15px] font-medium leading-snug text-ink">{name}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {yearLabel(yearsOf(m)) || 'Not in your syllabus'}
                    {!m.hasContent && ' · coming soon'}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Tile href="/mistakes" title="Mistakes deck" tone="rose">
          {due > 0 ? `${due} to redo today` : inDeck > 0 ? 'Nothing due today' : 'Empty for now'}
        </Tile>
        <Tile href="/quiz" title="Quick quiz" tone="lilac">
          10 questions from across your subjects
        </Tile>
        <Tile href="/college" title="College guidance" tone="sky">
          Clinical Management Guidelines and professional guidance
        </Tile>
        <Tile href="/checklists" title="Checklists" tone="sage">
          {checklistCount} practical {checklistCount === 1 ? 'routine' : 'routines'}
        </Tile>
        <Tile href="/tracker" title={`${data.profile.targetMark}% tracker`} tone="butter">
          Your marks and what’s left
        </Tile>
        <Tile href="/timetable" title="Timetable" tone="sky">
          {data.timetable.length ? `${data.timetable.filter((e) => e.date >= today).length} sessions coming up` : 'Import or add your sessions'}
        </Tile>
        <Tile href="/placements" title="Work experience" tone="sky">
          {(() => {
            const n = Object.values(data.placements).filter((p) => p.status !== 'not-contacted').length
            return n ? `${n} ${n === 1 ? 'place' : 'places'} contacted` : 'Eye departments and clinics in every city, on a map'
          })()}
        </Tile>
        <Tile href="/flashcards" title="Your flashcards" tone="lilac">
          {data.cardSets.length
            ? `${data.cardSets.reduce((n, s) => n + s.cards.length, 0)} cards in ${data.cardSets.length} ${data.cardSets.length === 1 ? 'set' : 'sets'}`
            : 'Import from Quizlet, Anki or slides'}
        </Tile>
        <Tile href="/slides" title="Slides & materials" tone="rose">
          {data.decks.length ? `${data.decks.length} ${data.decks.length === 1 ? 'deck' : 'decks'} outlined` : 'Add lecture slides, get outlines'}
        </Tile>
      </div>
    </section>
  )
}


const TONES = {
  rose: 'bg-accent-soft text-accent-strong',
  lilac: 'bg-accent-soft text-accent-strong',
  sage: 'bg-accent-soft text-accent-strong',
  butter: 'bg-accent-soft text-accent-strong',
  sky: 'bg-accent-soft text-accent-strong',
}

function Tile({
  href,
  title,
  tone,
  wide = false,
  children,
}: {
  href: string
  title: string
  tone: keyof typeof TONES
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`${wide ? 'sm:col-span-2 ' : ''}card flex min-h-[72px] items-center justify-between gap-3 px-5 py-4 transition-shadow hover:shadow-[var(--shadow-lift)]`}
    >
      <div>
        <p className="font-rounded text-[17px] font-semibold">{title}</p>
        <p className="text-[14px] text-muted">{children}</p>
      </div>
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}>
        <ChevronRight className="size-[18px]" />
      </span>
    </Link>
  )
}
