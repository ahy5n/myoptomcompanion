-- myoptomcompanion — Supabase schema
-- Paste the whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- ── Tables ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  target_mark numeric not null default 70,
  reflection text not null default 'off' check (reflection in ('off', 'quotes', 'faith')),
  university text,
  study_year int check (study_year between 1 and 5),
  claude_project_url text,
  tracker_seeded boolean not null default false, -- target tracker pre-filled from the timetable once
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists tracker_seeded boolean not null default false;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists target_mark numeric not null default 70;
alter table public.profiles add column if not exists reflection text not null default 'off';
alter table public.profiles add column if not exists university text;
alter table public.profiles add column if not exists study_year int;
alter table public.profiles add column if not exists palette text;
alter table public.profiles add column if not exists color_mode text;

create table if not exists public.topic_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text not null,
  covered boolean not null default false,
  revised boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.checklist_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  checklist_id text not null,
  done_steps int[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, checklist_id)
);

create table if not exists public.notes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.review_items (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  item_id text not null,
  item_type text not null,
  box int not null default 1,
  due_date date,
  last_result text,
  primary key (user_id, item_id)
);

create table if not exists public.quiz_attempts (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  item_id text not null,
  correct boolean not null,
  chosen text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  module text,
  weight numeric,
  mark numeric,
  pass_fail boolean not null default false,
  date date
);

create table if not exists public.module_overrides (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  module_code text not null,
  name text not null,
  primary key (user_id, module_code)
);

create table if not exists public.flags (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text,
  item_id text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.placement_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  placement_id text not null,
  status text not null default 'not-contacted'
    check (status in ('not-contacted', 'emailed', 'interview', 'confirmed')),
  interview_date date,
  interview_time text,
  updated_at timestamptz not null default now(),
  primary key (user_id, placement_id)
);

-- A student's own timetable: one row per dated session.
create table if not exists public.timetable_entries (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  series text,
  date date not null,
  start_time text not null,
  end_time text not null,
  title text not null,
  module text,
  room text,
  is_assessment boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Lecture decks a student added: the slide-by-slide outline only, never the file.
create table if not exists public.slide_decks (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  title text not null,
  module text,
  session_date date,
  session_start text,
  topics text[] not null default '{}',
  slides jsonb not null default '[]',
  file_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Flashcard sets a student imported (Quizlet, Anki, a spreadsheet) or typed in.
create table if not exists public.flashcard_sets (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  name text not null,
  module text,
  cards jsonb not null default '[]',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Feedback students send from Settings. Read it in Supabase → Table Editor → feedback.
-- email is only filled in when they ticked "happy for you to reply".
create table if not exists public.feedback (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  kind text not null default 'other',
  message text not null,
  page text,
  can_contact boolean not null default false,
  email text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, item_id);
create index if not exists assessments_user_idx on public.assessments (user_id);
create index if not exists flags_user_idx on public.flags (user_id);

-- ── Row Level Security: everyone sees only their own rows ───────────────

alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'topic_progress', 'checklist_progress', 'notes', 'review_items',
    'quiz_attempts', 'assessments', 'module_overrides', 'flags', 'placement_progress',
    'timetable_entries', 'slide_decks', 'flashcard_sets', 'feedback'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- ── Create a profile automatically for each new user ────────────────────
-- username holds the sign-in email (unique), display_name what they asked to be called.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, lower(new.email), nullif(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Usage stats (anonymous) ─────────────────────────────────────────────
-- Page views and feature use, with no user id, IP or cookie. Anyone may add
-- a row (guests too); nobody can read rows through the API — only the owner
-- inbox function below summarises them.
create table if not exists public.usage_events (
  id bigserial primary key,
  event text not null check (char_length(event) <= 60),
  path text check (char_length(path) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists usage_events_created_idx on public.usage_events (created_at);
alter table public.usage_events enable row level security;
drop policy if exists "anyone can add" on public.usage_events;
create policy "anyone can add" on public.usage_events for insert to anon, authenticated with check (true);

-- ── Owner inbox ─────────────────────────────────────────────────────────
-- Add the site owner's sign-in email once, in the SQL editor:
--   insert into public.admins (email) values ('you@example.com');
-- The table has no policies, so it can't be read or changed through the API.
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

create or replace function public.admin_inbox()
returns json
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return json_build_object(
    'counts', json_build_object(
      'users', (select count(*) from auth.users),
      'newUsers7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'active7d', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
      'feedback', (select count(*) from public.feedback),
      'flags', (select count(*) from public.flags)
    ),
    'feedback', coalesce((select json_agg(x) from (
      select f.id, f.kind, f.message, f.page, f.can_contact as "canContact", f.email, f.created_at as "createdAt", p.display_name as name
      from public.feedback f left join public.profiles p on p.id = f.user_id
      order by f.created_at desc limit 300) x), '[]'::json),
    'flags', coalesce((select json_agg(x) from (
      select fl.id, fl.topic_id as "topicId", fl.item_id as "itemId", fl.message, fl.created_at as "createdAt"
      from public.flags fl order by fl.created_at desc limit 300) x), '[]'::json),
    'signups', coalesce((select json_agg(x) from (
      select u.email, p.display_name as name, p.university, p.study_year as "studyYear", u.created_at as "createdAt", u.last_sign_in_at as "lastSignIn"
      from auth.users u left join public.profiles p on p.id = u.id
      order by u.created_at desc limit 300) x), '[]'::json),
    'usage', json_build_object(
      'daily', coalesce((select json_agg(x order by x.day) from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*) as views
        from public.usage_events where event = 'view' and created_at > now() - interval '14 days'
        group by 1) x), '[]'::json),
      'pages', coalesce((select json_agg(x) from (
        select path, count(*) as n from public.usage_events
        where event = 'view' and created_at > now() - interval '30 days'
        group by path order by n desc limit 25) x), '[]'::json),
      'events', coalesce((select json_agg(x) from (
        select event, count(*) as n from public.usage_events
        where event <> 'view' and created_at > now() - interval '30 days'
        group by event order by n desc limit 25) x), '[]'::json)
    )
  );
end;
$$;

revoke all on function public.admin_inbox() from public, anon;
grant execute on function public.admin_inbox() to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
