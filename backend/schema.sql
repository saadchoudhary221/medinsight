-- MedInsight database schema
-- Run this once against your Postgres database (local or Neon) to create all tables.

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text not null unique,
  password_hash   text not null,
  avatar_url      text,
  email_verified  boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── email verification tokens ──────────────────────────────────────────
create table if not exists email_verifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  token       text not null unique,
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── password reset tokens ──────────────────────────────────────────────
create table if not exists password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  token       text not null unique,
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── reports ─────────────────────────────────────────────────────────────
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  file_name     text not null,
  mime_type     text not null,
  size_bytes    integer not null,
  file_data     bytea not null,
  status        text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  upload_date   timestamptz not null default now()
);

create index if not exists idx_reports_user_id on reports(user_id);

-- ── analysis_results ────────────────────────────────────────────────────
create table if not exists analysis_results (
  id                     uuid primary key default gen_random_uuid(),
  report_id              uuid not null unique references reports(id) on delete cascade,
  summary                text,
  findings               jsonb,        -- [{ test, value, status }]
  explanations           text,
  recommendations        jsonb,        -- [string, string, ...]
  recommendation_status  text check (recommendation_status in ('normal', 'borderline', 'attention')),
  created_at             timestamptz not null default now()
);

-- ── contact_messages ────────────────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Notes on Row Level Security:
-- RLS as Postgres understands it is designed around Postgres-native roles
-- (e.g. Supabase's auth.uid()). Since this project uses its own Express + JWT
-- auth layer rather than Supabase Auth, authorization is enforced in the
-- application layer instead: every query in backend/src/routes filters by
-- the authenticated user's id from the JWT. If you later migrate this
-- project onto Supabase Auth, you can enable native RLS policies here too.
