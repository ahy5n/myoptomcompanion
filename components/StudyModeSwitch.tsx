'use client'

import { readStudyMode, studyModeValue, type StudyMode } from '@/lib/studyMode'
import { useApp, useData } from './AppProvider'

export function useStudyMode(): [StudyMode, (m: StudyMode) => void] {
  const { setChecklist } = useApp()
  const mode = readStudyMode(useData().checklists)
  return [mode, (m) => setChecklist('pref:study-mode', studyModeValue(m))]
}

const OPTIONS: { key: StudyMode; label: string; hint: string }[] = [
  { key: 'exams', label: 'Exams', hint: 'Exam essentials and background' },
  { key: 'clinical', label: 'Clinical', hint: 'Exam essentials and clinical know-how' },
]

/** Two-way switch between Exams and Clinical study modes. */
export function StudyModeSwitch({ showHint = false }: { showHint?: boolean }) {
  const [mode, setMode] = useStudyMode()
  return (
    <div>
      <div role="radiogroup" aria-label="Study mode" className="inline-flex gap-1 rounded-full bg-bg p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            role="radio"
            aria-checked={mode === o.key}
            onClick={() => setMode(o.key)}
            className={`min-h-10 rounded-full px-4 text-[14px] font-semibold transition-all ${
              mode === o.key ? 'bg-surface text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {showHint && <p className="mt-1.5 text-[14px] text-muted">{OPTIONS.find((o) => o.key === mode)!.hint}</p>}
    </div>
  )
}
