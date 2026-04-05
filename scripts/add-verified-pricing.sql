-- KHA-155: Verified pricing model
-- Adds price_per_head (numeric) to venues and a trigger that auto-computes it
-- as the rolling average of the last 10 proposals for that venue.

-- 1. Add the verified price column (null until proposals exist)
alter table venues
  add column if not exists price_per_head numeric(10,2);

-- 2. Function: recompute rolling average of last 10 proposals for a venue
create or replace function update_venue_price_per_head()
returns trigger as $$
begin
  update venues
  set price_per_head = (
    select round(avg(p.price_per_head), 2)
    from (
      select price_per_head
      from proposals
      where venue_id = NEW.venue_id
      order by created_at desc
      limit 10
    ) p
  )
  where id = NEW.venue_id;

  return NEW;
end;
$$ language plpgsql;

-- 3. Trigger: fire after every proposal insert
create trigger trg_update_venue_price_per_head
  after insert on proposals
  for each row
  execute function update_venue_price_per_head();
