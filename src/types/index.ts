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
  slug: string | null
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
  claimed: boolean
  claimed_by_name: string | null
  claimed_by_email: string | null
  claimed_by_role: string | null
  claimed_at: string | null
  placeholder_image_url: string | null
}

export interface AvailabilityBlock {
  id: string
  venue_id: string
  blocked_date: string // YYYY-MM-DD
  note: string | null
  created_at: string
}

export interface Enquiry {
  id: string
  venue_id: string | null
  venue_name: string
  venue_email: string
  event_date: string // YYYY-MM-DD
  headcount: number
  price_per_head: number | null
  event_type: string
  notes: string | null
  sent_at: string
  sender_placeholder: string
}

export interface ClaimRequest {
  id: string
  venue_id: string
  name: string
  email: string
  role: string
  created_at: string
  approved: boolean
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
