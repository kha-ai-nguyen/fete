export type EventType =
  | 'Workshop'
  | 'Wedding'
  | 'Corporate'
  | 'Party'
  | 'Exhibition'
  | 'Alumni dinner'
  | 'Birthday'
  | 'Other'

export interface PaymentTerms {
  deposit_pct: number | null   // e.g. 25 = 25%
  min_spend: number | null     // e.g. 2000 = £2,000
  pay_ahead: boolean
}

export interface Space {
  id: string
  venue_id: string
  name: string
  capacity: number
  base_price: number           // price per head (£)
  photos: string[]
  payment_deposit_pct: number | null
  payment_min_spend: number | null
  payment_pay_ahead: boolean
  created_at: string
  // joined fields (optional, present when fetched with venue)
  venue?: Venue
}

export interface Venue {
  id: string
  name: string
  slug: string | null
  neighbourhood: string
  capacity_min: number | null
  capacity_max: number | null
  price_estimate: string | null
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
  space_id: string | null      // new: space-scoped calendar
  venue_id: string | null      // legacy: kept for backward compat
  blocked_date: string         // YYYY-MM-DD
  note: string | null
  created_at: string
}

// New booker-created event (v0 demo flow)
export interface BookerEvent {
  id: string
  event_type: string
  headcount: number
  budget_per_head_max: number | null
  date_from: string | null     // YYYY-MM-DD
  date_to: string | null       // YYYY-MM-DD
  postcode: string | null
  radius_km: number
  booker_name: string
  created_at: string
}

// Legacy event (enquire flow — kept for backward compat)
export interface Event {
  id: string
  venue_id: string | null
  venue_name: string
  venue_email: string
  event_date: string           // YYYY-MM-DD
  headcount: number
  price_per_head: number | null
  event_type: string
  notes: string | null
  created_at: string
  booker_name: string
  // v0 new columns
  budget_per_head_max?: number | null
  date_from?: string | null
  date_to?: string | null
  postcode?: string | null
  radius_km?: number
}

export interface Conversation {
  id: string
  event_id: string
  venue_id: string | null
  space_id: string | null
  created_at: string
  // joined fields
  event?: BookerEvent
  venue?: Venue
  space?: Space
}

export interface Message {
  id: string
  conversation_id: string
  from_type: 'booker' | 'venue' | 'felicity'
  message_text: string
  sent_at: string
}

export interface Booker {
  id: string
  email: string
  name: string | null
  created_at: string
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

// Follow-up questions by event type
export const FOLLOW_UP_QUESTIONS: Record<string, string[]> = {
  Wedding: [
    'Do you have any dietary restrictions or allergies?',
    'Will you need a DJ or live music?',
    'Is a dance floor required?',
    'What are your setup and breakdown time requirements?',
  ],
  Corporate: [
    'What AV equipment will you need (projector, microphone, screens)?',
    'How strong is the WiFi? Will we need dedicated bandwidth?',
    'Is parking available on-site or nearby?',
    'Do you have any dietary restrictions or catering requirements?',
  ],
  Workshop: [
    'What table setup do you need (boardroom, classroom, U-shape)?',
    'How strong is the WiFi? Will participants need to connect devices?',
    'Is parking available on-site or nearby?',
    'Do you have any dietary restrictions for refreshments?',
  ],
  Party: [
    'Will you need a DJ or live music?',
    'Is a dance floor required?',
    'Is parking available on-site or nearby?',
    'Do you have any dietary restrictions or allergies?',
  ],
  'Alumni dinner': [
    'Do you have any dietary restrictions or allergies?',
    'Will you need a microphone or AV for speeches?',
    'What table setup do you prefer (long table, round tables)?',
    'Do you need a private room or is semi-private fine?',
  ],
  Birthday: [
    'Will you need a DJ or live music?',
    'Is a dance floor required?',
    'Do you have any dietary restrictions or allergies?',
    'Any decoration or theming requirements?',
  ],
  Exhibition: [
    'What display or hanging requirements do you have?',
    'Will you need AV or lighting rigs?',
    'How many hours do you need for setup and breakdown?',
    'Do you have any dietary restrictions for catering?',
  ],
  Other: [
    'What are the key requirements for your event?',
    'Do you have any dietary restrictions or allergies?',
    'Will you need any AV equipment?',
    'Any other questions for the venue?',
  ],
}
