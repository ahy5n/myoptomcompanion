# myoptomcompanion

A study companion for UK optometry students: a two-week "next up" view, a module library with progress, quizzes that lean on past mistakes, a mistakes deck, practical checklists, a target-mark tracker and an "Ask my tutor" link to Claude.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Vercel. Free tiers only.

This is the **tester version**, forked from a private one-student site. All personal content, university staff details, timetable data and lecture materials have been taken out. What's here:

| | What's in it |
|---|---|
| **Study** | Module library with progress rings · module pages (ticks, editable names) · topics (summary, key points, exam traps, SVG diagrams, go deeper, checklists, flashcards, multiple choice, clinical cases, label the diagram, notes) · mistakes deck (Leitner) · quick quiz and module quiz · Ask Claude · Flag this · Save for GoodNotes (A4 PDF) |
| **You** | Settings → About you: name, university and year, target average, and an optional daily reflection (off by default, or motivational quotes, or Qur'an verses) |
| **Your year** | Pick your university (all 17 GOC-approved optometry degrees, or "Not listed") and year at sign-up. The home page then shows that year's real modules, each linked to the subjects that cover it, and the subject library filters to your year. From `data/universities.json`, built from each university's course page (checked Nov 2026) |
| **Tracker** | Weighted marks towards each student's own target |
| **Timetable** | `/timetable`: import a university calendar (link or `.ics` file, weekly repeats, moved and cancelled weeks handled) or add sessions by hand. Shows as "Next two weeks" on the home page and on module pages |
| **Slides** | `/slides`: add a PDF or PowerPoint (.pptx). It's read in the browser into a slide-by-slide outline; only the outline is saved, never the file. Link it to a session and topics; "Summarise with Claude" sends the outline to Claude |
| **Subjects** | 19 subjects, each tagged with the years it's usually taught in. 12 have full lessons, written from standard UK practice (not checked against any university's slides; every topic says so). 7 are outlines for now: optics, ocular anatomy, visual perception, pharmacology, low vision, the placement year, and glaucoma/medical retina/prescribing |

Still to do before testers: onboarding (university and modules), a simpler tutor setup, a disclaimer page and a basic usage log.

---

## Run it on this Mac

Node is installed in `~/.local/node` (no admin needed). In a terminal:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

```bash
cd ~/Documents/myoptomcompanion && npm run dev
```

Open http://localhost:3000. With no Supabase keys the site runs in **"this device only" mode**: accounts made on the front page and all progress are saved in that browser only.

Testing helpers:

- `?today=2026-10-19` on any URL pretends it's that date (handy for checking the timetable); `?today=off` clears it.
- `npm test` runs the unit tests (Leitner schedule, 70% maths, UK dates, anchors).
- `npm run check-content` validates every content file.

---

## 1. Set up Supabase (free) — so ticks sync across devices

1. Create a project at [supabase.com](https://supabase.com) (free plan). Any region near the UK, e.g. London.
2. **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), **Run**. This creates the tables, turns on Row Level Security (everyone sees only their own rows) and adds a trigger that creates a profile for each new user.
3. **Authentication → Sign In / Providers → Email**: turn **off** “Confirm email” and make sure **“Allow new users to sign up”** is **on**. Students create their own accounts from the front page with their email and a password. With “Confirm email” off, Supabase sends them nothing. (Turn it on later if you want verified addresses; the front page then tells new students to check their inbox. Supabase's built-in mailer only sends a few emails an hour, so add your own SMTP first.)
4. Accounts made in the dashboard before sign-up existed still work: they can sign in with the username, which is the part of their `@{domain}` address before the `@`.
5. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key. *Never* use the `service_role` / secret key in this app.
6. Copy `.env.example` to `.env.local` and fill in both values. Restart `npm run dev`.

> `NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN` only matters for those older username accounts. New accounts use real email addresses, because Supabase rejects made-up domains such as `.local`.

## 2. Deploy to Vercel (free)

Easiest: push this folder to a private GitHub repo, then on [vercel.com](https://vercel.com) **Add New → Project → Import** it. Or with the CLI:

```bash
npx vercel
```

In the Vercel project: **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and the email-domain one if you changed it), then redeploy.

The build runs `scripts/fetch-verses.mjs` first (verses only show for students who pick the faith-based daily reflection in Settings). It fetches the exact Arabic and Sahih International English for the 16 verses from api.quran.com into `data/verses.resolved.json`. Until that has run with network access, the verse card shows the English fallback and hides the Arabic (on purpose, so it never shows wrong text). To fetch them locally:

```bash
npm run verses
```

Verses quoted only in part on the card (e.g. 20:114) show the quoted excerpt, with **“Read the full ayah”** revealing the whole ayah in Arabic and English.

## 3. Set up a Claude project (optional)

Follow [`claude-project/PROJECT-INSTRUCTIONS.md`](claude-project/PROJECT-INSTRUCTIONS.md). Then paste the project link into **myoptomcompanion → Settings → Your Claude project link**. Without it, the Ask Claude buttons open a new chat at claude.ai/new.

## 4. On an iPad or phone

Safari → open the site → **Share → Add to Home Screen**. It opens full screen like an app, with its own icon.

---

## How things work

- **Content** is read from `data/` at build time (no CMS). `data/` files are used exactly as supplied.
- **Storage**: `lib/store/` has one interface with two backends: Supabase (when the env vars are set) and browser storage (when they aren't). Saves are optimistic and queued per row, so quick taps always land in order.
- **Diagrams** are hand-built inline SVGs in `components/diagrams/Diagrams.tsx` (AaD) and `MoreDiagrams.tsx` (other modules), keyed by `diagram.id`. Unknown ids (and the focimeter, which is too complex to draw well) show a “Diagram to sketch” card with the description and labels instead. That card doubles as a GoodNotes prompt.
- **Mistakes deck**: wrong answer, “Again” or “Partly”/“Missed it” → box 1 (tomorrow). Right while due → next box (3 days, 7 days, 14 days) → retired. Wrong at any point → back to box 1. Right when not yet due doesn't skip boxes.
- **Quick quiz**: 10 questions from all full modules; ones they've ever got wrong are 3× as likely, ones still in the deck 6×.
- **Target tracker**: weighted average of marked, weighted, graded items; the “needed” figure is `(target × total weight − points so far) ÷ remaining weight`, where the target is each student's own (Settings → About you, default 70). Pass/fail items are excluded. Until every upcoming item has a weighting it says “so far” rather than claiming a final result.
- **PDF export**: “Save for GoodNotes” opens an A4 print view with a ~50 mm right margin for handwriting, a “Test yourself” section and the answers at the end.
- **Universities**: `data/universities.json` lists each degree's modules by year and maps each to subject codes. `npm run check-content` checks every mapping points at a real subject. Lists change each year, so re-check the source links before a new intake.
- **Dates** are always UK time (Europe/London), whatever the device clock says. Calendar times in UTC are converted to UK time.
- **Calendar links** go through `/api/calendar`, a small server route (browsers can't read another site's calendar directly). It only fetches public `https` addresses, checks every redirect, and caps size and time.
- **Slide reading** loads PDF.js and JSZip from cdnjs on first use. Scanned (image-only) PDFs and old `.ppt`/Keynote files are refused with a hint to export as PDF or `.pptx`.

## Project layout

```
app/                 routes (/, /m/[code], /m/[code]/quiz, /t/[topicId], /t/[topicId]/print,
                     /quiz, /mistakes, /checklists, /tracker, /timetable, /slides, /slides/view,
                     /settings, /api/calendar, manifest, icons)
components/          UI (home/, module/, topic/, practice/, diagrams/, tracker/, settings/)
lib/                 content loader, dates, Leitner, tracker maths, storage backends
data/                course data from the build pack (+ verses.resolved.json, generated)
scripts/             fetch-verses.mjs, check-content.mjs
supabase/schema.sql  tables, RLS policies, new-user trigger
tests/               unit tests (npm test)
docs/                adding a module (v3)
claude-project/      instructions for a student's own Claude tutor project
```

## Notes and known limits

- **Content for the 11 non-AaD modules was written from standard UK optometry knowledge** (College CMGs, NICE, DESP, TFOS DEWS II, GOC) to follow each module's outline. It has *not* been checked against any university's lecture slides. Every topic shows the "check against your lecture slides" note, and the Flag button exists for exactly this. Numbers that vary by department (fog lens size, Van Herick referral grade, cycloplegic protocols, Abbe values, statistics on sight loss) are hedged in the text.

- Schema: `profiles` has `display_name`, `target_mark` and `reflection`; `timetable_entries` and `slide_decks` hold each student's own sessions and slide outlines. `schema.sql` is safe to re-run after pulling changes.
- One content inconsistency to check: in `aad.json`, the centration key points say minus lenses are “base-to-apex”, but the diagram spec (and usual teaching) says **apex-to-apex**. The diagram follows apex-to-apex. Worth checking against a dispensing textbook and fixing the text if needed.
- The 1.60 and 1.74 points on the materials chart use typical Abbe values (≈42 and ≈33), shown as dashed “approximate” points. The other values come from the content file.
- No offline service worker: Add to Home Screen works, but the site needs a connection. That's deliberate, so new content always shows up.
- No reminders, streaks, countdowns or study plans anywhere.
