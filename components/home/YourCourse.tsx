'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { LibraryModule } from '@/lib/progress'
import { getUniversity, modulesFor, SYLLABUS_CHECKED } from '@/lib/universities'
import { useApp, useData, useModuleName } from '../AppProvider'
import { type Course, CoursePicker } from '../CoursePicker'

const checkedLabel = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(SYLLABUS_CHECKED))

/** "Your Year 2 at Cardiff": that year's modules, each linked to the subjects that cover it. */
export function YourCourse({ modules }: { modules: LibraryModule[] }) {
  const { profile } = useData()
  const byCode = new Map(modules.map((m) => [m.code, m]))
  const moduleName = useModuleName()
  const uni = getUniversity(profile.university)
  const year = profile.studyYear

  if (!profile.university || !year) return <AskCourse />

  const uniModules = modulesFor(uni, year)
  const subjectsThisYear = uni ? null : modules.filter((m) => m.years.includes(year))

  return (
    <section aria-labelledby="your-year" className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="eyebrow">Your year</p>
          <h2 id="your-year" className="mt-0.5 text-[20px] font-semibold">
            Year {year}
            {uni ? ` at ${uni.short}` : ''}
          </h2>
          {uni && <p className="text-[13px] text-muted">{uni.degree}</p>}
        </div>
        <Link href="/settings" className="btn btn-ghost min-h-9 px-3 text-[14px]">
          Change
        </Link>
      </div>

      {uni ? (
        <>
          <ul className="divide-y divide-border/80">
            {uniModules.map((m) => (
              <li key={m.name} className="px-5 py-3">
                <p className="text-[15px] font-medium leading-snug">
                  {m.name}
                  {m.optional && <span className="ml-2 rounded-md bg-bg px-1.5 py-0.5 text-[12px] font-semibold text-muted">Optional</span>}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.subjects.map((code) => {
                    const s = byCode.get(code)
                    if (!s) return null
                    return (
                      <Link
                        key={code}
                        href={`/m/${code}`}
                        className="inline-flex min-h-7 items-center gap-1.5 rounded-md bg-bg px-2 text-[12.5px] font-medium text-ink hover:bg-border"
                      >
                        <span aria-hidden className="size-2 rounded-full" style={{ background: s.colour, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--subject-ink) 15%, transparent)' }} />
                        {moduleName(s.code, s.name)}
                        {!s.hasContent && <span className="text-muted">· soon</span>}
                      </Link>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-5 py-3 text-[12.5px] leading-snug text-muted">
            {uni.note ? `${uni.note} ` : ''}From{' '}
            <a href={uni.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
              {uni.short}’s course page
            </a>{' '}
            ({checkedLabel}). Your modules may be named differently; the subjects below still apply.
          </p>
        </>
      ) : (
        <div className="px-5 py-4">
          <p className="text-[14px] text-muted">Most UK optometry degrees cover these subjects in Year {year}:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subjectsThisYear!.map((s) => (
              <Link key={s.code} href={`/m/${s.code}`} className="inline-flex min-h-8 items-center rounded-md bg-bg px-2.5 text-[13px] font-medium hover:bg-border">
                {moduleName(s.code, s.name)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function AskCourse() {
  const { saveProfile, toast } = useApp()
  const { profile } = useData()
  const [course, setCourse] = useState<Course>({ university: profile.university, studyYear: profile.studyYear })
  const [busy, setBusy] = useState(false)

  return (
    <section aria-labelledby="ask-course" className="card p-5">
      <h2 id="ask-course" className="text-[18px] font-semibold">
        Which university and year are you in?
      </h2>
      <p className="mt-1 text-[14px] text-muted">We’ll show the modules your year studies and which subjects here cover them.</p>
      <form
        className="mt-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          try {
            await saveProfile(course)
          } catch {
            toast('Couldn’t save that just now.')
            setBusy(false)
          }
        }}
      >
        <CoursePicker value={course} onChange={setCourse} required />
        <button className="btn btn-primary mt-3" disabled={busy}>
          {busy ? 'Saving…' : 'Show my year'}
        </button>
      </form>
    </section>
  )
}
