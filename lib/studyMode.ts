// Study mode: which content blocks a student sees. Exams shows exam-core
// and background for the module being read; Clinical shows clinical and
// exam-core and hides background. The choice lives in the synced
// checklist store, like the quiz ladder levels.
import type { BlockMeta } from './types'

export type StudyMode = 'exams' | 'clinical'

export const STUDY_MODE_KEY = 'pref:study-mode'

export function readStudyMode(saved: Record<string, number[]>): StudyMode {
  return saved[STUDY_MODE_KEY]?.[0] === 1 ? 'clinical' : 'exams'
}

export function studyModeValue(mode: StudyMode): number[] {
  return [mode === 'clinical' ? 1 : 0]
}

export function showsBlock(meta: BlockMeta, mode: StudyMode, moduleCode: string): boolean {
  if (mode === 'exams') return meta.module === moduleCode && meta.priority !== 'clinical'
  return meta.priority !== 'background'
}
