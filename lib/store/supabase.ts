// Supabase mode: email + password. Accounts made before sign-up existed
// used a username, mapped to a synthetic {username}@{DOMAIN} address.
// Row Level Security (supabase/schema.sql) limits every table to the
// signed-in user's own rows.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ReviewItem } from '../leitner'
import type { Assessment } from '../tracker'
import type { AuthUser, Backend, UserData } from './types'
import { checkLogin, checkNewAccount, emptyData } from './types'

const DOMAIN = process.env.NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN || 'myoptomcompanion.local'

let client: SupabaseClient | null = null
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'myoptomcompanion-auth' },
    })
  }
  return client
}

const toEmail = (login: string) => (login.includes('@') ? login : `${login}@${DOMAIN}`)
const fromEmail = (email: string | undefined) => {
  const e = email ?? ''
  return e.endsWith(`@${DOMAIN}`) ? e.slice(0, -DOMAIN.length - 1) : e
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data
}

const nowIso = () => new Date().toISOString()

interface AssessmentRow {
  id: number
  name: string
  module: string | null
  weight: number | string | null
  mark: number | string | null
  pass_fail: boolean
  date: string | null
}
const num = (v: number | string | null) => (v == null ? null : Number(v))
const rowToAssessment = (r: AssessmentRow): Assessment => ({
  id: String(r.id),
  name: r.name,
  module: r.module ?? '',
  weight: num(r.weight),
  mark: num(r.mark),
  passFail: r.pass_fail,
  date: r.date,
})
const assessmentToRow = (a: Omit<Assessment, 'id'>) => ({
  name: a.name,
  module: a.module,
  weight: a.weight,
  mark: a.mark,
  pass_fail: a.passFail,
  date: a.date,
})

export const supabaseBackend: Backend = {
  mode: 'supabase',

  async currentUser() {
    const { data } = await sb().auth.getSession()
    const u = data.session?.user
    return u ? { id: u.id, username: fromEmail(u.email) } : null
  },

  async signIn(rawLogin, password) {
    const username = checkLogin(rawLogin)
    const { data, error } = await sb().auth.signInWithPassword({ email: toEmail(username), password })
    if (error || !data.user) {
      const msg = error?.message ?? ''
      throw new Error(
        /invalid login credentials/i.test(msg)
          ? 'That email and password don’t match.'
          : /not confirmed|confirm/i.test(msg)
            ? 'Confirm your email first: open the link Supabase sent you, then sign in.'
            : /fetch|network/i.test(msg)
              ? 'Couldn’t reach the server — check your connection.'
              : msg || 'Couldn’t sign in.',
      )
    }
    return { id: data.user.id, username }
  },

  async signUp(rawEmail, password, displayName) {
    const username = checkNewAccount(rawEmail, password)
    const { data, error } = await sb().auth.signUp({
      email: username,
      password,
      options: { data: { display_name: displayName.trim() } },
    })
    if (error) {
      const msg = error.message
      throw new Error(
        /already registered|already exists/i.test(msg)
          ? 'There’s already an account with that email. Sign in instead.'
          : /signups? not allowed|disabled/i.test(msg)
            ? 'New accounts are switched off. In Supabase, turn on “Allow new users to sign up”.'
            : /invalid/i.test(msg) && /email/i.test(msg)
              ? 'That email address was rejected. Check it’s typed correctly and is one you can receive mail at.'
              : /fetch|network/i.test(msg)
                ? 'Couldn’t reach the server — check your connection.'
                : msg || 'Couldn’t create the account.',
      )
    }
    // With "Confirm email" on, Supabase makes the user but no session until
    // they click the link it emails them.
    if (!data.session || !data.user) {
      throw new Error('Nearly there: check your inbox for a confirmation link, then come back and sign in.')
    }
    // The signup trigger copies the name too; this covers databases set up
    // before it did.
    await sb().from('profiles').upsert({ id: data.user.id, username, display_name: displayName.trim() || null })
    return { id: data.user.id, username }
  },

  async signOut() {
    await sb().auth.signOut()
  },

  async changePassword(user, current, next) {
    if (next.length < 6) throw new Error('Passwords need at least 6 characters.')
    const check1 = await sb().auth.signInWithPassword({ email: toEmail(user.username), password: current })
    if (check1.error) throw new Error('Your current password isn’t right.')
    const { error } = await sb().auth.updateUser({ password: next })
    if (error) throw new Error(error.message)
  },

  async load(user) {
    const c = sb()
    const [profile, progress, checklists, notes, reviews, assessments, overrides, flags, placements] = await Promise.all([
      c.from('profiles').select('username, display_name, target_mark, reflection, claude_project_url, tracker_seeded').eq('id', user.id).maybeSingle(),
      c.from('topic_progress').select('topic_id, covered, revised'),
      c.from('checklist_progress').select('checklist_id, done_steps'),
      c.from('notes').select('topic_id, body'),
      c.from('review_items').select('item_id, item_type, box, due_date, last_result'),
      c.from('assessments').select('id, name, module, weight, mark, pass_fail, date').order('date', { nullsFirst: false }),
      c.from('module_overrides').select('module_code, name'),
      c.from('flags').select('topic_id, item_id, message, created_at').order('created_at', { ascending: false }).limit(50),
      c.from('placement_progress').select('placement_id, status, interview_date, interview_time'),
    ])
    const d: UserData = emptyData(user.username)
    const p = check(profile)
    if (p) {
      d.profile = {
        username: p.username ?? user.username,
        displayName: p.display_name ?? '',
        targetMark: p.target_mark ?? 70,
        reflection: p.reflection ?? 'off',
        claudeProjectUrl: p.claude_project_url ?? '',
        trackerSeeded: !!p.tracker_seeded,
      }
    } else {
      // The signup trigger normally creates this; make sure it exists.
      await c.from('profiles').upsert({ id: user.id, username: user.username })
    }
    for (const r of check(progress) ?? []) d.progress[r.topic_id] = { covered: !!r.covered, revised: !!r.revised }
    for (const r of check(checklists) ?? []) d.checklists[r.checklist_id] = r.done_steps ?? []
    for (const r of check(notes) ?? []) d.notes[r.topic_id] = r.body ?? ''
    for (const r of check(reviews) ?? []) {
      d.reviews[r.item_id] = {
        itemId: r.item_id,
        itemType: r.item_type as ReviewItem['itemType'],
        box: r.box,
        dueDate: r.due_date,
        lastResult: r.last_result as ReviewItem['lastResult'],
      }
    }
    d.assessments = (check(assessments) ?? []).map(rowToAssessment)
    for (const r of check(overrides) ?? []) d.overrides[r.module_code] = r.name
    // Placements came later than the other tables: if the table hasn't been
    // created yet, carry on without it rather than failing the whole load.
    if (!placements.error) {
      for (const r of placements.data ?? []) {
        d.placements[r.placement_id] = {
          status: r.status,
          interviewDate: r.interview_date,
          interviewTime: r.interview_time,
        }
      }
    }
    d.flags = (check(flags) ?? []).map((r) => ({
      topicId: r.topic_id,
      itemId: r.item_id,
      message: r.message,
      createdAt: r.created_at,
    }))
    return d
  },

  async saveProfile(user, patch) {
    const row: Record<string, unknown> = {}
    if (patch.displayName !== undefined) row.display_name = patch.displayName
    if (patch.targetMark !== undefined) row.target_mark = patch.targetMark
    if (patch.reflection !== undefined) row.reflection = patch.reflection
    if (patch.claudeProjectUrl !== undefined) row.claude_project_url = patch.claudeProjectUrl
    if (patch.trackerSeeded !== undefined) row.tracker_seeded = patch.trackerSeeded
    check(await sb().from('profiles').update(row).eq('id', user.id))
  },

  async saveProgress(user, topicId, p) {
    check(
      await sb()
        .from('topic_progress')
        .upsert({ user_id: user.id, topic_id: topicId, covered: p.covered, revised: p.revised, updated_at: nowIso() }),
    )
  },

  async saveChecklist(user, id, steps) {
    check(
      await sb()
        .from('checklist_progress')
        .upsert({ user_id: user.id, checklist_id: id, done_steps: steps, updated_at: nowIso() }),
    )
  },

  async saveNote(user, topicId, body) {
    check(await sb().from('notes').upsert({ user_id: user.id, topic_id: topicId, body, updated_at: nowIso() }))
  },

  async saveReview(user, r) {
    check(
      await sb().from('review_items').upsert({
        user_id: user.id,
        item_id: r.itemId,
        item_type: r.itemType,
        box: r.box,
        due_date: r.dueDate,
        last_result: r.lastResult,
      }),
    )
  },

  async addAttempt(user, itemId, correct, chosen) {
    check(await sb().from('quiz_attempts').insert({ user_id: user.id, item_id: itemId, correct, chosen }))
  },

  async addAssessments(user, items) {
    if (!items.length) return []
    const rows = check(
      await sb()
        .from('assessments')
        .insert(items.map((a) => ({ ...assessmentToRow(a), user_id: user.id })))
        .select('id, name, module, weight, mark, pass_fail, date'),
    )
    return (rows ?? []).map(rowToAssessment)
  },

  async updateAssessment(_user, a) {
    check(await sb().from('assessments').update(assessmentToRow(a)).eq('id', Number(a.id)))
  },

  async deleteAssessment(_user, id) {
    check(await sb().from('assessments').delete().eq('id', Number(id)))
  },

  async saveOverride(user, code, name) {
    if (name) {
      check(await sb().from('module_overrides').upsert({ user_id: user.id, module_code: code, name }))
    } else {
      check(await sb().from('module_overrides').delete().eq('module_code', code))
    }
  },

  async savePlacement(user, id, p) {
    check(
      await sb().from('placement_progress').upsert({
        user_id: user.id,
        placement_id: id,
        status: p.status,
        interview_date: p.interviewDate,
        interview_time: p.interviewTime,
        updated_at: nowIso(),
      }),
    )
  },

  async addFlag(user, f) {
    check(
      await sb().from('flags').insert({ user_id: user.id, topic_id: f.topicId, item_id: f.itemId, message: f.message }),
    )
  },
}
