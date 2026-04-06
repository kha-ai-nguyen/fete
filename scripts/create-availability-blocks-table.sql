-- Phase 2: Calendar sync — add iCal columns to availability_blocks + venue calendar columns
-- Run after create-venues-table.sql
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards.

-- Add calendar connection columns to venues
alter table venues
  add column if not exists calendar_type text check (calendar_type in ('google', 'ical')),
  add column if not exists ical_url text,
  add column if not exists last_synced_at timestamptz;

-- If availability_blocks already exists (from the simple blocked_date schema),
-- add the iCal sync columns. These are nullable so legacy rows stay valid.
alter table availability_blocks
  add column if not exists title text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists all_day boolean default false,
  add column if not exists source text check (source in ('google', 'ical')),
  add column if not exists uid text,
  add column if not exists synced_at timestamptz default now();

-- Fast lookups by venue + date range (iCal sync queries)
create index if not exists idx_availability_blocks_venue_date
  on availability_blocks (venue_id, starts_at, ends_at);

-- Unique constraint on external UID per venue to enable upsert
create unique index if not exists idx_availability_blocks_venue_uid
  on availability_blocks (venue_id, uid) where uid is not null;
