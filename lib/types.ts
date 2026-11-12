// Shapes of the static course data in /data. Content files added later
// (content/aam.json, content/clb.json, …) must follow the same schema.

export type ThemeName = 'Foundations' | 'Management' | 'Patient' | 'Professional'

export interface ModuleMeta {
  code: string
  name: string
  /** Left blank until the lecturer is confirmed. */
  lecturer?: string
  theme: ThemeName
  /** Years of the degree this subject is usually taught in. */
  years: number[]
  contentStatus: 'full' | 'outline'
  contentFile?: string
  colour: string
  topics?: string[]
  outline?: string[]
}

export interface McqOption {
  text: string
  correct: boolean
  feedback: string
}

export interface Mcq {
  id: string
  q: string
  options: McqOption[]
  explanation: string
  /** "topic-id#section-anchor" or just "topic-id" */
  link?: string
  needsReview?: boolean
  /** The question this one replaced, kept for comparison. Never shown. */
  original?: { q: string; options: McqOption[]; explanation?: string }
}

/** exam-core: examinable essentials. clinical: practice know-how. background: context, statistics, history. */
export type Priority = 'exam-core' | 'clinical' | 'background'

export interface BlockMeta {
  priority: Priority
  /** Code of the module this block belongs to (see modules.json). */
  module: string
  /** Written or rewritten and waiting for an optometrist to check it. */
  needsReview?: boolean
  /** For rules and rules of thumb: the anatomy or physiology behind them. */
  why?: string
  /** For rules and rules of thumb: when they don't hold. */
  limits?: string
}

export interface TextBlock extends BlockMeta {
  text: string
}

export interface GoDeeperBlock extends BlockMeta {
  heading: string
  body: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface ClinicalCase {
  scenario: string
  question: string
  modelAnswer: string
}

export interface Checklist {
  id: string
  title: string
  steps: string[]
}

export interface Topic {
  id: string
  title: string
  summary: string
  /** Tags for the summary block. */
  summaryMeta: BlockMeta
  keyPoints: TextBlock[]
  examTraps: TextBlock[]
  diagram?: { id: string; description: string; labels: string[] }
  goDeeper: GoDeeperBlock[]
  checklist?: Checklist & Partial<BlockMeta>
  labelDiagram?: { diagramId: string; targets: string[] }
  flashcards: Flashcard[]
  mcq: Mcq[]
  cases: ClinicalCase[]
  links: { label: string; url: string }[]
  askClaude: string
}

export interface ModuleContent {
  module: string
  verifyNote?: string
  topics: Topic[]
}

/** A topic row on a module page: either a full topic or an outline line. */
export interface TopicRow {
  id: string
  title: string
  full: boolean
}

export interface ModuleView extends ModuleMeta {
  rows: TopicRow[]
  hasContent: boolean
}

export interface Session {
  week: number
  date: string
  day: string
  start: string
  end: string
  type: string
  theme: string | null
  module: string | null
  lead: string | null
  leadName: string | null
  room: string | null
  isAssessment: boolean
  needsRotaCheck: boolean
  raw: string
}

export interface WeekInfo {
  week: number
  monday: string
  readingWeek: boolean
}

export interface ResolvedVerse {
  ref: string
  surah: string
  arabic: string | null
  /** The English shown on the card (the excerpt when `partial`). */
  english: string
  /** The whole ayah in English, when fetched and different from `english`. */
  englishFull: string | null
  partial: boolean
}

// Practice items, flattened across all full modules, used by the
// mistakes deck and the quizzes.
interface ItemBase {
  id: string
  topicId: string
  topicTitle: string
  moduleCode: string
}
export type PracticeItem =
  | (ItemBase & { kind: 'mcq'; mcq: Mcq })
  | (ItemBase & { kind: 'flashcard'; card: Flashcard })
  | (ItemBase & { kind: 'case'; kase: ClinicalCase })

export type ItemKind = PracticeItem['kind']
