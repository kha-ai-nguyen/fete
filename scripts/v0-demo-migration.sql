-- V0 Demo Migration
-- Run this in the Supabase SQL editor

-- 1. Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity int NOT NULL,
  base_price int NOT NULL, -- price per head (£)
  photos text[] DEFAULT '{}',
  payment_deposit_pct int,       -- e.g. 25 = 25%
  payment_min_spend int,         -- e.g. 2000 = £2,000
  payment_pay_ahead bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Create events table if it doesn't exist, or add new columns if it does
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  venue_name text NOT NULL DEFAULT '',
  venue_email text NOT NULL DEFAULT '',
  event_date date,
  headcount int NOT NULL DEFAULT 0,
  price_per_head int,
  event_type text NOT NULL DEFAULT '',
  notes text,
  booker_name text NOT NULL DEFAULT 'Guest',
  budget_per_head_max int,
  date_from date,
  date_to date,
  postcode text,
  radius_km int DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- If the table already existed, add any missing columns
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS budget_per_head_max int,
  ADD COLUMN IF NOT EXISTS date_from date,
  ADD COLUMN IF NOT EXISTS date_to date,
  ADD COLUMN IF NOT EXISTS postcode text,
  ADD COLUMN IF NOT EXISTS radius_km int DEFAULT 5;

-- 3. Create availability if it doesn't exist, or add space_id if it does
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- If the table already existed without space_id, add it
ALTER TABLE availability
  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

-- 4. Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  space_id uuid REFERENCES spaces(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Add space_id to conversations if table already existed without it
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE SET NULL;

-- 5. Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  from_type text NOT NULL CHECK (from_type IN ('booker', 'venue', 'felicity')),
  message_text text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- 6. Seed demo spaces (requires venue IDs — update these after seeding venues)
-- Example: INSERT INTO spaces (venue_id, name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend)
-- VALUES ('<venue_id>', 'Private Dining Room', 40, 65, ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'], 25, NULL);

-- 7. Enable RLS policies if needed (skip for demo — using service key)
-- ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
