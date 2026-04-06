-- KHA-155: Proposals table — each venue reply to an enquiry creates a proposal row.
-- Used by the verified pricing model to compute rolling-average price_per_head.

create table proposals (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  enquiry_id uuid,                       -- nullable until enquiries table exists (KHA-157)
  price_per_head numeric(10,2) not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'accepted', 'declined')),
  created_at timestamptz default now()
);

create index idx_proposals_venue_id on proposals(venue_id);
create index idx_proposals_created_at on proposals(venue_id, created_at desc);
