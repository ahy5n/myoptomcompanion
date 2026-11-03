// UK optometry degrees and what each teaches by year (data/universities.json),
// for the "your university and year" view. Safe to use on the client.
import data from '../data/universities.json'

export interface UniModule {
  name: string
  optional?: boolean
  /** Codes of the subjects (data/modules.json) that cover this module. */
  subjects: string[]
}

export interface University {
  id: string
  name: string
  short: string
  degree: string
  years: number
  source: string
  note?: string
  syllabus: { year: number; modules: UniModule[] }[]
}

export const UNIVERSITIES = data.universities as University[]
export const SYLLABUS_CHECKED = data.checked

export const getUniversity = (id: string | null | undefined) => (id ? UNIVERSITIES.find((u) => u.id === id) : undefined)

export function modulesFor(uni: University | undefined, year: number | null): UniModule[] {
  if (!uni || !year) return []
  return uni.syllabus.find((y) => y.year === year)?.modules ?? []
}

/** The years a subject comes up at this university. */
export function subjectYearsAt(uni: University | undefined, code: string): number[] {
  if (!uni) return []
  return uni.syllabus.filter((y) => y.modules.some((m) => m.subjects.includes(code))).map((y) => y.year)
}

/** "Year 2" or "Years 1–3" */
export function yearLabel(years: number[]): string {
  if (!years.length) return ''
  const sorted = [...new Set(years)].sort((a, b) => a - b)
  if (sorted.length === 1) return `Year ${sorted[0]}`
  const contiguous = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1)
  return contiguous ? `Years ${sorted[0]}–${sorted[sorted.length - 1]}` : `Years ${sorted.join(', ')}`
}
