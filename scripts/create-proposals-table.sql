create table proposals (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  space_id uuid references spaces(id) on delete set null,
  price_per_head numeric(10, 2),
  status text not null default 'submitted'
    check (status in ('submitted', 'accepted', 'declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_proposals_venue_id on proposals(venue_id);
create index idx_proposals_event_id on proposals(event_id);
create index idx_proposals_space_id on proposals(space_id);
create index idx_proposals_status on proposals(status);
