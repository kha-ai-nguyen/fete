import { createServiceClient } from './client'
import type { Venue, Proposal, AvailabilityBlock, Enquiry } from '@/types'

export async function getVenues(filters?: { date?: string }): Promise<Venue[]> {
  const supabase = createServiceClient()
  let query = supabase.from('venues').select('*').order('created_at', { ascending: false })

  if (filters?.date) {
    // Fetch venue IDs blocked on this date, then exclude them
    const { data: blocks } = await supabase
      .from('availability_blocks')
      .select('venue_id')
      .eq('blocked_date', filters.date)

    if (blocks && blocks.length > 0) {
      const blockedVenueIds = blocks.map((b) => b.venue_id)
      query = query.not('id', 'in', `(${blockedVenueIds.join(',')})`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getVenues error:', error.message)
    return []
  }
  return (data ?? []) as Venue[]
}

export async function getProposalsByVenue(venueId: string): Promise<Proposal[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProposalsByVenue error:', error.message)
    return []
  }
  return (data ?? []) as Proposal[]
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    console.error('getVenueBySlug error:', error.message)
    return null
  }
  return data as Venue
}

export async function getAvailabilityBlocks(venueId: string): Promise<AvailabilityBlock[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('availability_blocks')
    .select('*')
    .eq('venue_id', venueId)
    .order('blocked_date', { ascending: true })
  if (error) {
    console.error('getAvailabilityBlocks error:', error.message)
    return []
  }
  return (data ?? []) as AvailabilityBlock[]
}

export async function getEnquiriesByVenue(venueId: string): Promise<Enquiry[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('venue_id', venueId)
    .order('sent_at', { ascending: false })
  if (error) {
    console.error('getEnquiriesByVenue error:', error.message)
    return []
  }
  return (data ?? []) as Enquiry[]
}

// ─── Conversation helpers (referenced by enquire API + thread view) ──────────

export async function getOrCreateConversation(
  enquiryId: string,
  venueId: string,
): Promise<string> {
  const supabase = createServiceClient()

  // Check for an existing conversation for this enquiry
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('enquiry_id', enquiryId)
    .single()

  if (existing) return existing.id

  // Create a new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({ enquiry_id: enquiryId, venue_id: venueId })
    .select('id')
    .single()

  if (error) throw new Error(`getOrCreateConversation: ${error.message}`)
  return data.id
}

export async function insertMessage(
  conversationId: string,
  fromType: string,
  messageText: string,
): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      from_type: fromType,
      message_text: messageText,
    })

  if (error) throw new Error(`insertMessage: ${error.message}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getConversation(id: string): Promise<any> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('*, enquiries(*), venues(name, slug)')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getConversation: ${error.message}`)
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getConversationMessages(conversationId: string): Promise<any[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error) {
    console.error('getConversationMessages error:', error.message)
    return []
  }
  return data ?? []
}
