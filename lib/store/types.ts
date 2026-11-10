import type { ReviewItem } from '../leitner'
import type { Mode, Palette } from '../theme'
import type { Assessment } from '../tracker'

export interface AuthUser {
  id: string
  /** What they sign in with: their email, or a username for older accounts. */
  username: string
}

export type Reflection = 'off' | 'quotes' | 'faith'

export interface Profile {
  username: string
  /** What the home page calls them. Empty → their username. */
  displayName: string
  /** The average they're aiming for, used by the target tracker. */
  targetMark: number
  /** Optional daily line under the greeting. Off by default. */
  reflection: Reflection
  /** Id from data/universities.json, or 'other'. */
  university: string | null
  /** Year of the degree they're in (1–5). */
  studyYear: number | null
  claudeProjectUrl: string
  trackerSeeded: boolean
  /** Colour theme, synced across devices. Null → whatever this device has. */
  palette: Palette | null
  colorMode: Mode | null
}

export interface Progress {
  covered: boolean
  revised: boolean
}

export interface FlagRecord {
  topicId: string
  itemId: string | null
  message: string
  createdAt: string
}

export type PlacementStatus = 'not-contacted' | 'emailed' | 'interview' | 'confirmed'

export interface PlacementProgress {
  status: PlacementStatus
  /** YYYY-MM-DD */
  interviewDate: string | null
  /** HH:mm (optional) */
  interviewTime: string | null
}

/** One dated session in a student's own timetable. */
export interface TimetableEntry {
  id: string
  /** Shared by every week of a repeating session, so the series can go at once. */
  series: string | null
  /** YYYY-MM-DD, UK time */
  date: string
  /** HH:mm */
  start: string
  end: string
  title: string
  module: string | null
  room: string | null
  isAssessment: boolean
  source: 'manual' | 'calendar'
}

export interface DeckSlide {
  n: number
  title: string
  points: string[]
}

/** A lecture deck the student added. Only the outline is kept, never the file. */
export interface UserDeck {
  id: string
  title: string
  module: string | null
  sessionDate: string | null
  sessionStart: string | null
  topics: string[]
  slides: DeckSlide[]
  fileName: string
  createdAt: string
}

export interface UserCard {
  id: string
  front: string
  back: string
}

/** A set of flashcards the student imported or typed in themselves. */
export interface CardSet {
  id: string
  name: string
  module: string | null
  cards: UserCard[]
  createdAt: string
}

export type FeedbackKind = 'bug' | 'idea' | 'content' | 'other'

/** A note to the people running the site: a bug, an idea, a content mistake. */
export interface FeedbackItem {
  id: string
  kind: FeedbackKind
  message: string
  /** The page they were on, so a bug report has context. */
  page: string
  /** Whether they're happy to be emailed back. */
  canContact: boolean
  createdAt: string
}

export interface UsageEvent {
  event: string
  path: string | null
}

/** What the site owner sees in /admin. */
export interface AdminInbox {
  counts: { users: number; newUsers7d: number; active7d: number; feedback: number; flags: number }
  feedback: { id: string; kind: FeedbackKind; message: string; page: string | null; canContact: boolean; email: string | null; createdAt: string; name: string | null }[]
  flags: { id: number | string; topicId: string; itemId: string | null; message: string; createdAt: string }[]
  signups: { email: string; name: string | null; university: string | null; studyYear: number | null; createdAt: string; lastSignIn: string | null }[]
  usage: { daily: { day: string; views: number }[]; pages: { path: string; n: number }[]; events: { event: string; n: number }[] }
}

export interface UserData {
  profile: Profile
  progress: Record<string, Progress>
  checklists: Record<string, number[]>
  notes: Record<string, string>
  reviews: Record<string, ReviewItem>
  assessments: Assessment[]
  overrides: Record<string, string>
  flags: FlagRecord[]
  placements: Record<string, PlacementProgress>
  timetable: TimetableEntry[]
  decks: UserDeck[]
  cardSets: CardSet[]
  feedback: FeedbackItem[]
}

export interface NewAccount {
  displayName: string
  university: string | null
  studyYear: number | null
}

export type NewAssessment = Omit<Assessment, 'id'>

export interface Backend {
  mode: 'local' | 'supabase'
  currentUser(): Promise<AuthUser | null>
  signIn(username: string, password: string): Promise<AuthUser>
  signUp(email: string, password: string, about: NewAccount): Promise<AuthUser>
  signOut(): Promise<void>
  changePassword(user: AuthUser, current: string, next: string): Promise<void>
  /** Emails a link to /reset-password. Says nothing about whether the account exists. */
  sendPasswordReset(email: string): Promise<void>
  /** Sets a new password for the account signed in by that link. */
  setNewPassword(password: string): Promise<void>
  load(user: AuthUser): Promise<UserData>
  saveProfile(user: AuthUser, patch: Partial<Omit<Profile, 'username'>>): Promise<void>
  saveProgress(user: AuthUser, topicId: string, p: Progress): Promise<void>
  saveChecklist(user: AuthUser, checklistId: string, steps: number[]): Promise<void>
  saveNote(user: AuthUser, topicId: string, body: string): Promise<void>
  saveReview(user: AuthUser, r: ReviewItem): Promise<void>
  addAttempt(user: AuthUser, itemId: string, correct: boolean, chosen: string): Promise<void>
  addAssessments(user: AuthUser, items: NewAssessment[]): Promise<Assessment[]>
  updateAssessment(user: AuthUser, a: Assessment): Promise<void>
  deleteAssessment(user: AuthUser, id: string): Promise<void>
  saveOverride(user: AuthUser, moduleCode: string, name: string | null): Promise<void>
  addFlag(user: AuthUser, f: Omit<FlagRecord, 'createdAt'>): Promise<void>
  savePlacement(user: AuthUser, placementId: string, p: PlacementProgress): Promise<void>
  addTimetable(user: AuthUser, entries: TimetableEntry[]): Promise<void>
  deleteTimetable(user: AuthUser, ids: string[]): Promise<void>
  saveDeck(user: AuthUser, deck: UserDeck): Promise<void>
  deleteDeck(user: AuthUser, id: string): Promise<void>
  saveCardSet(user: AuthUser, set: CardSet): Promise<void>
  deleteCardSet(user: AuthUser, id: string): Promise<void>
  addFeedback(user: AuthUser, item: FeedbackItem): Promise<void>
  /** Whether the signed-in account may open the owner inbox. */
  isAdmin(): Promise<boolean>
  adminInbox(user: AuthUser): Promise<AdminInbox>
  /** Anonymous usage counts; never throws. */
  logUsage(events: UsageEvent[]): Promise<void>
}

export function emptyData(username: string): UserData {
  return {
    profile: { username, displayName: '', targetMark: 70, reflection: 'off', university: null, studyYear: null, claudeProjectUrl: '', trackerSeeded: false, palette: null, colorMode: null },
    progress: {},
    checklists: {},
    notes: {},
    reviews: {},
    assessments: [],
    overrides: {},
    flags: [],
    placements: {},
    timetable: [],
    decks: [],
    cardSets: [],
    feedback: [],
  }
}

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,30}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normaliseUsername(u: string): string {
  return u.trim().toLowerCase()
}

/** Sign-in accepts an email, or a username from before sign-up used email. */
export function checkLogin(raw: string): string {
  const login = normaliseUsername(raw)
  if (!EMAIL_RE.test(login) && !USERNAME_RE.test(login)) throw new Error('Enter the email address you signed up with.')
  return login
}

export function checkNewAccount(rawEmail: string, password: string): string {
  const email = normaliseUsername(rawEmail)
  if (!EMAIL_RE.test(email)) throw new Error('That email address doesn’t look right.')
  if (password.length < 6) throw new Error('Passwords need at least 6 characters.')
  return email
}
