'use client'

import { getUniversity, UNIVERSITIES } from '@/lib/universities'

export interface Course {
  university: string | null
  studyYear: number | null
}

/** University + year selects. Year choices follow the chosen degree's length. */
export function CoursePicker({ value, onChange, required = false }: { value: Course; onChange: (c: Course) => void; required?: boolean }) {
  const uni = getUniversity(value.university)
  const maxYear = uni?.years ?? 5
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[14px] font-medium">University</span>
        <select
          className="field"
          required={required}
          value={value.university ?? ''}
          onChange={(e) => {
            const next = e.target.value || null
            const years = getUniversity(next)?.years ?? 5
            onChange({ university: next, studyYear: value.studyYear && value.studyYear <= years ? value.studyYear : null })
          }}
        >
          <option value="">Choose…</option>
          {UNIVERSITIES.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
          <option value="other">Not listed</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[14px] font-medium">Year</span>
        <select
          className="field"
          required={required}
          value={value.studyYear ?? ''}
          onChange={(e) => onChange({ ...value, studyYear: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">–</option>
          {Array.from({ length: maxYear }, (_, i) => i + 1).map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
