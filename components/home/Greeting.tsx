'use client'

import { useEffect, useState } from 'react'
import { ukHourNow } from '@/lib/dates'
import { useData } from '../AppProvider'

const LAST = 'sc:last-encouragement'

function greeting(hour: number): { text: string } {
  if (hour < 5) return { text: 'Hello, night owl' }
  if (hour < 12) return { text: 'Good morning' }
  if (hour < 17) return { text: 'Good afternoon' }
  return { text: 'Good evening' }
}

export function Greeting({ lines }: { lines: string[] }) {
  const { profile } = useData()
  const name = profile.displayName.trim() || profile.username.split('@')[0]
  const [line, setLine] = useState<string | null>(null)
  const g = greeting(ukHourNow())

  useEffect(() => {
    // One random line per visit, never the same as last time.
    let last = -1
    try {
      last = Number(localStorage.getItem(LAST) ?? -1)
    } catch {}
    let i = Math.floor(Math.random() * lines.length)
    if (lines.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length
    try {
      localStorage.setItem(LAST, String(i))
    } catch {}
    setLine(lines[i].replaceAll('{target}', String(profile.targetMark)))
  }, [lines, profile.targetMark])

  return (
    <div>
      <h1 className="text-[30px] font-semibold tracking-tight sm:text-[34px]">
        {g.text}, {name}
      </h1>
      <p className="mt-1.5 min-h-[1.6em] text-[18px] text-muted">{line ?? ' '}</p>
      <p className="mt-2 text-[15px] text-muted">This resource is built first to help you pass your optometry exams.</p>
    </div>
  )
}
