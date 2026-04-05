import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

const migrations: { label: string; sql: string }[] = [
  {
    label: 'Add slug column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug text;',
  },
  {
    label: 'Add claimed column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT false;',
  },
  {
    label: 'Add claimed_by_name column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS claimed_by_name text;',
  },
  {
    label: 'Add claimed_by_email column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS claimed_by_email text;',
  },
  {
    label: 'Add claimed_by_role column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS claimed_by_role text;',
  },
  {
    label: 'Add claimed_at column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS claimed_at timestamptz;',
  },
  {
    label: 'Add placeholder_image_url column',
    sql: 'ALTER TABLE venues ADD COLUMN IF NOT EXISTS placeholder_image_url text;',
  },
  {
    label: 'Generate slugs for existing venues',
    sql: `UPDATE venues SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g')) WHERE slug IS NULL;`,
  },
  {
    label: 'Add unique constraint on slug',
    sql: 'ALTER TABLE venues ADD CONSTRAINT IF NOT EXISTS venues_slug_key UNIQUE (slug);',
  },
  {
    label: 'Create availability_blocks table',
    sql: `CREATE TABLE IF NOT EXISTS availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id, blocked_date)
);`,
  },
  {
    label: 'Create enquiries table',
    sql: `CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  venue_name text NOT NULL,
  venue_email text NOT NULL,
  event_date date NOT NULL,
  headcount integer NOT NULL,
  price_per_head integer,
  event_type text NOT NULL,
  notes text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  sender_placeholder text NOT NULL DEFAULT 'Fete User'
);`,
  },
  {
    label: 'Create claim_requests table',
    sql: `CREATE TABLE IF NOT EXISTS claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved boolean NOT NULL DEFAULT false
);`,
  },
]

async function runMigration(label: string, sql: string): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`

  // Try the Supabase SQL API endpoint
  const res = await fetch(`${SUPABASE_URL}/query/v1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.status === 404 || res.status === 401) {
    console.log(`[SKIP - API unavailable] ${label}`)
    console.log(`Run this SQL in Supabase SQL editor:\n${sql}\n`)
    return false
  }

  if (!res.ok) {
    const body = await res.text()
    console.error(`[FAIL] ${label} — HTTP ${res.status}: ${body}`)
    console.log(`Run this SQL in Supabase SQL editor:\n${sql}\n`)
    return false
  }

  console.log(`[OK] ${label}`)
  return true
}

async function main() {
  console.log('Starting migrations against:', SUPABASE_URL)
  console.log('─'.repeat(60))

  let apiWorking = true

  for (const { label, sql } of migrations) {
    const ok = await runMigration(label, sql)
    if (!ok) {
      apiWorking = false
    }
  }

  if (!apiWorking) {
    console.log('─'.repeat(60))
    console.log(
      'The /query/v1 endpoint was not reachable or returned errors.'
    )
    console.log(
      'Copy the SQL statements above into the Supabase SQL Editor at:'
    )
    console.log(`  ${SUPABASE_URL.replace('/rest/v1', '')}/project/sql`)
  } else {
    console.log('─'.repeat(60))
    console.log('All migrations completed successfully.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
