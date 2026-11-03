'use client'

import Link from 'next/link'
import { useState } from 'react'
import { fmtDayLong } from '@/lib/dates'
import type { ModuleOption } from '@/lib/moduleOptions'
import { useData } from '../AppProvider'
import { BackLink, type ColourMap, ModuleChip } from '../bits'
import { ChevronRight, PlusIcon } from '../icons'
import { AddDeck } from './AddDeck'

export function SlidesLibrary({ modules }: { modules: ModuleOption[] }) {
  const { decks } = useData()
  const [adding, setAdding] = useState(false)
  const [mod, setMod] = useState<string | null>(null)
  const colours: ColourMap = Object.fromEntries(modules.map((m) => [m.code, m.colour]))
  const used = modules.filter((m) => decks.some((d) => d.module === m.code)).map((m) => m.code)
  const shown = [...decks]
    .filter((d) => !mod || d.module === mod)
    .sort((a, b) => (b.sessionDate ?? b.createdAt).localeCompare(a.sessionDate ?? a.createdAt))

  return (
    <div className="mx-auto max-w-[920px]">
      <BackLink href="/">Home</BackLink>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold">Slides & materials</h1>
          <p className="mt-1 max-w-2xl text-muted">Add a lecture deck and get a slide-by-slide outline, linked to its session and topics.</p>
        </div>
        {!adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            <PlusIcon className="size-[18px]" />
            Add slides
          </button>
        )}
      </div>

      {adding && <AddDeck modules={modules} onDone={() => setAdding(false)} />}

      {decks.length === 0 && !adding ? (
        <div className="card mt-6 p-8 text-center">
          <p className="text-[18px] font-semibold">No slides yet</p>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">
            Add a PDF or PowerPoint from your lectures. It’s read on your device and only the outline is saved to your account.
          </p>
          <button className="btn btn-primary mt-4" onClick={() => setAdding(true)}>
            <PlusIcon className="size-[18px]" />
            Add your first deck
          </button>
        </div>
      ) : (
        decks.length > 0 && (
          <>
            {used.length > 1 && (
              <div role="group" aria-label="Filter by module" className="no-scrollbar -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
                {[null, ...used].map((m) => (
                  <button
                    key={m ?? 'all'}
                    onClick={() => setMod(m)}
                    aria-pressed={mod === m}
                    className={`min-h-10 shrink-0 rounded-lg px-3.5 text-[14px] font-semibold ${mod === m ? 'bg-ink text-white' : 'bg-card text-muted shadow-[var(--shadow-soft)] hover:text-ink'}`}
                  >
                    {m ?? 'All'}
                  </button>
                ))}
              </div>
            )}
            <ul className="card mt-4 divide-y divide-line/80">
              {shown.map((d) => (
                <li key={d.id}>
                  <Link href={`/slides/view?id=${encodeURIComponent(d.id)}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-wash/50">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                        {d.module && <ModuleChip code={d.module} colours={colours} />}
                        {d.sessionDate ? `${fmtDayLong(d.sessionDate)}${d.sessionStart ? `, ${d.sessionStart}` : ''}` : 'Not linked to a session'}
                        <span>· {d.slides.length} slides</span>
                      </span>
                      <span className="mt-1 block truncate text-[16px] font-medium">{d.title}</span>
                    </span>
                    <ChevronRight className="size-[18px] shrink-0 text-faint group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </div>
  )
}
