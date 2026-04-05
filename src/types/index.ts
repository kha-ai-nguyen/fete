export type EventType =
  | 'Workshop'
  | 'Wedding'
  | 'Corporate'
  | 'Party'
  | 'Exhibition'

// Matches the Supabase venues table schema (snake_case)
export interface Venue {
  id: string
  name: string
  neighbourhood: string
  capacity_min: number | null
  capacity_max: number | null
  price_estimate: string | null
  price_per_head: number | null          // KHA-155: rolling avg of last 10 proposals
  event_types: string[]
  description: string | null
  photos: string[]
  website: string | null
  last_confirmed_at: string | null
  created_at: string
}

export type ProposalStatus = 'submitted' | 'accepted' | 'declined'

// Matches the Supabase proposals table schema (snake_case)
export interface Proposal {
  id: string
  venue_id: string
  enquiry_id: string | null
  price_per_head: number
  status: ProposalStatus
  created_at: string
}
