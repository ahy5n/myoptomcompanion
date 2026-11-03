// Supabase mode: email + password. Accounts made before sign-up existed
// used a username, mapped to a synthetic {username}@{DOMAIN} address.
// Row Level Security (supabase/schema.sql) limits every table to the
// signed-in user's own rows.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ReviewItem } from '../leitner'
import type { Assessment } from '../tracker'
import { isMode, isPalette } from '../theme'
import type { AuthUser, Backend, CardSet, FeedbackItem, TimetableEntry, UserData, UserDeck } from './types'
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

// Databases set up before a profile column was added don't have it until
// schema.sql is run again. Drop each column Supabase says is missing and
// retry, so signing in and saving everything else still works.
const MISSING_COLUMN = /Could not find the '(\w+)' column|column \w+\.(\w+) does not exist/

async function writeProfile(
  row: Record<string, unknown>,
  write: (row: Record<string, unknown>) => PromiseLike<{ error: { message: string } | null }>,
) {
  const r = { ...row }
  for (;;) {
    const { error } = await write(r)
    const m = error?.message.match(MISSING_COLUMN)
    const col = m?.[1] ?? m?.[2]
    if (!error) return
    if (!col || !(col in r)) throw new Error(error.message)
    delete r[col]
    if (Object.keys(r).length === 0) return
  }
}

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

interface EntryRow {
  id: string
  series: string | null
  date: string
  start_time: string
  end_time: string
  title: string
  module: string | null
  room: string | null
  is_assessment: boolean
  source: string
}
const rowToEntry = (r: EntryRow): TimetableEntry => ({
  id: r.id,
  series: r.series,
  date: r.date,
  start: r.start_time,
  end: r.end_time,
  title: r.title,
  module: r.module,
  room: r.room,
  isAssessment: r.is_assessment,
  source: r.source === 'calendar' ? 'calendar' : 'manual',
})
const entryToRow = (e: TimetableEntry) => ({
  id: e.id,
  series: e.series,
  date: e.date,
  start_time: e.start,
  end_time: e.end,
  title: e.title,
  module: e.module,
  room: e.room,
  is_assessment: e.isAssessment,
  source: e.source,
})
interface DeckRow {
  id: string
  title: string
  module: string | null
  session_date: string | null
  session_start: string | null
  topics: string[] | null
  slides: UserDeck['slides'] | null
  file_name: string
  created_at: string
}
const rowToDeck = (r: DeckRow): UserDeck => ({
  id: r.id,
  title: r.title,
  module: r.module,
  sessionDate: r.session_date,
  sessionStart: r.session_start,
  topics: r.topics ?? [],
  slides: r.slides ?? [],
  fileName: r.file_name,
  createdAt: r.created_at,
})

interface CardSetRow {
  id: string
  name: string
  module: string | null
  cards: CardSet['cards'] | null
  created_at: string
}
const rowToCardSet = (r: CardSetRow): CardSet => ({
  id: r.id,
  name: r.name,
  module: r.module,
  cards: r.cards ?? [],
  createdAt: r.created_at,
})

/** Big calendar imports go up in slices so no single request is huge. */
function chunks<T>(list: T[], size = 400): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

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

  async signUp(rawEmail, password, about) {
    const username = checkNewAccount(rawEmail, password)
    const { data, error } = await sb().auth.signUp({
      email: username,
      password,
      options: { data: { display_name: about.displayName.trim() } },
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
    await writeProfile(
      {
        id: data.user.id,
        username,
        display_name: about.displayName.trim() || null,
        university: about.university,
        study_year: about.studyYear,
      },
      (row) => sb().from('profiles').upsert(row),
    ).catch(() => {})
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
    const [profile, progress, checklists, notes, reviews, assessments, overrides, flags, placements, timetable, decks, cardSets, feedback] = await Promise.all([
      // '*' so a database missing a newer column still loads.
      c.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      c.from('topic_progress').select('topic_id, covered, revised'),
      c.from('checklist_progress').select('checklist_id, done_steps'),
      c.from('notes').select('topic_id, body'),
      c.from('review_items').select('item_id, item_type, box, due_date, last_result'),
      c.from('assessments').select('id, name, module, weight, mark, pass_fail, date').order('date', { nullsFirst: false }),
      c.from('module_overrides').select('module_code, name'),
      c.from('flags').select('topic_id, item_id, message, created_at').order('created_at', { ascending: false }).limit(50),
      c.from('placement_progress').select('placement_id, status, interview_date, interview_time'),
      c.from('timetable_entries').select('id, series, date, start_time, end_time, title, module, room, is_assessment, source'),
      c.from('slide_decks').select('id, title, module, session_date, session_start, topics, slides, file_name, created_at'),
      c.from('flashcard_sets').select('id, name, module, cards, created_at').order('created_at'),
      c.from('feedback').select('id, kind, message, page, can_contact, created_at').order('created_at', { ascending: false }).limit(50),
    ])
    const d: UserData = emptyData(user.username)
    const p = check(profile)
    if (p) {
      d.profile = {
        username: p.username ?? user.username,
        displayName: p.display_name ?? '',
        targetMark: p.target_mark ?? 70,
        reflection: p.reflection ?? 'off',
        university: p.university ?? null,
        studyYear: p.study_year ?? null,
        claudeProjectUrl: p.claude_project_url ?? '',
        palette: isPalette(p.palette) ? p.palette : null,
        colorMode: isMode(p.color_mode) ? p.color_mode : null,
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
    // Timetable and slides came later too: same tolerance.
    if (!timetable.error) d.timetable = (timetable.data ?? []).map(rowToEntry)
    if (!decks.error) d.decks = (decks.data ?? []).map(rowToDeck)
    if (!cardSets.error) d.cardSets = (cardSets.data ?? []).map(rowToCardSet)
    if (!feedback.error) {
      d.feedback = (feedback.data ?? []).map((r) => ({
        id: r.id,
        kind: r.kind as FeedbackItem['kind'],
        message: r.message,
        page: r.page ?? '',
        canContact: !!r.can_contact,
        createdAt: r.created_at,
      }))
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
    if (patch.university !== undefined) row.university = patch.university
    if (patch.studyYear !== undefined) row.study_year = patch.studyYear
    if (patch.claudeProjectUrl !== undefined) row.claude_project_url = patch.claudeProjectUrl
    if (patch.palette !== undefined) row.palette = patch.palette
    if (patch.colorMode !== undefined) row.color_mode = patch.colorMode
    if (patch.trackerSeeded !== undefined) row.tracker_seeded = patch.trackerSeeded
    await writeProfile(row, (r) => sb().from('profiles').update(r).eq('id', user.id))
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
  async addFeedback(user, item) {
    const res = await sb().from('feedback').insert({
      id: item.id,
      kind: item.kind,
      message: item.message,
      page: item.page,
      can_contact: item.canContact,
      // Only kept when they're happy to hear back.
      email: item.canContact ? user.username : null,
      created_at: item.createdAt,
    })
    if (res.error && /feedback/.test(res.error.message)) {
      throw new Error('Feedback can’t be sent until the site owner runs the latest supabase/schema.sql.')
    }
    check(res)
  },
  async addTimetable(_user, entries) {
    for (const part of chunks(entries)) check(await sb().from('timetable_entries').insert(part.map(entryToRow)))
  },
  async deleteTimetable(_user, ids) {
    for (const part of chunks(ids)) check(await sb().from('timetable_entries').delete().in('id', part))
  },
  async saveDeck(_user, deck) {
    check(
      await sb().from('slide_decks').upsert({
        id: deck.id,
        title: deck.title,
        module: deck.module,
        session_date: deck.sessionDate,
        session_start: deck.sessionStart,
        topics: deck.topics,
        slides: deck.slides,
        file_name: deck.fileName,
        created_at: deck.createdAt,
      }),
    )
  },
  async deleteDeck(_user, id) {
    check(await sb().from('slide_decks').delete().eq('id', id))
  },
  async saveCardSet(_user, set) {
    const res = await sb().from('flashcard_sets').upsert({
      id: set.id,
      name: set.name,
      module: set.module,
      cards: set.cards,
      created_at: set.createdAt,
    })
    if (res.error && /flashcard_sets/.test(res.error.message)) {
      throw new Error('Flashcards can’t be saved until the site owner runs the latest supabase/schema.sql.')
    }
    check(res)
  },
  async deleteCardSet(_user, id) {
    check(await sb().from('flashcard_sets').delete().eq('id', id))
  },
}
