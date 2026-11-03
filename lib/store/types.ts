import type { ReviewItem } from '../leitner'
import type { Assessment } from '../tracker'

export interface AuthUser {
  id: string
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
  claudeProjectUrl: string
  trackerSeeded: boolean
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
}

export type NewAssessment = Omit<Assessment, 'id'>

export interface Backend {
  mode: 'local' | 'supabase'
  currentUser(): Promise<AuthUser | null>
  signIn(username: string, password: string): Promise<AuthUser>
  signUp(username: string, password: string, displayName: string): Promise<AuthUser>
  signOut(): Promise<void>
  changePassword(user: AuthUser, current: string, next: string): Promise<void>
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
}

export function emptyData(username: string): UserData {
  return {
    profile: { username, displayName: '', targetMark: 70, reflection: 'off', claudeProjectUrl: '', trackerSeeded: false },
    progress: {},
    checklists: {},
    notes: {},
    reviews: {},
    assessments: [],
    overrides: {},
    flags: [],
    placements: {},
  }
}

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,30}$/

export function normaliseUsername(u: string): string {
  return u.trim().toLowerCase()
}
