'use client'

import Link from 'next/link'
import { ROUND_SIZE, unlockedRounds } from '@/lib/quizLadder'
import { useData } from '../AppProvider'
import { BackLink } from '../bits'
import { ChevronRight } from '../icons'
import { ModuleName } from '../ModuleName'

interface Props {
  code: string
  name: string
  topics: { id: string; title: string; count: number }[]
  mixedCount: number
}

export function ModuleQuizSection({ code, name, topics, mixedCount }: Props) {
  const data = useData()
  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href={`/m/${code}`}>
        {code} · <ModuleName code={code} name={name} />
      </BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">{code} Quiz</h1>
      <p className="mt-1 text-muted">
        Each topic has its own quiz in rounds of {ROUND_SIZE}. Get a whole round right to unlock the next. You&apos;ll see the
        explanation after each answer, with a link back to the topic.
      </p>

      <ul className="card mt-6 divide-y divide-border/70 px-5">
        {topics.map((t) => {
          const rounds = Math.ceil(t.count / ROUND_SIZE)
          const open = unlockedRounds(data.checklists, t.id, rounds)
          return (
            <li key={t.id}>
              <Link href={`/t/${t.id}/quiz`} className="flex min-h-14 items-center justify-between gap-3 py-3 hover:text-accent-strong">
                <span className="min-w-0 font-medium">{t.title}</span>
                <span className="flex shrink-0 items-center gap-1 text-[13px] text-muted">
                  {t.count} questions · round {open} of {rounds}
                  <ChevronRight className="size-4" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6">
        <Link href={`/m/${code}/quiz/all`} className="btn btn-soft">
          Mixed quiz · all {mixedCount} questions shuffled
        </Link>
      </div>
    </div>
  )
}
