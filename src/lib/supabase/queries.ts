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

export async function getOrCreateConversation(enquiryId: string, venueId: string) {
  const supabase = createServiceClient()
  
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('enquiry_id', enquiryId)
    .single()

  if (existing) {
    return existing.id
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      enquiry_id: enquiryId,
      venue_id: venueId,
      booker_id: 'Fete User',
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function insertMessage(
  conversationId: string,
  fromType: 'booker' | 'venue' | 'felicity',
  messageText: string
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      from_type: fromType,
      from_agent: fromType === 'felicity',
      message_text: messageText,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function getConversationMessages(conversationId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('id, from_type, from_agent, message_text, sent_at')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getConversation(conversationId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      status,
      created_at,
      enquiry_id,
      venue_id,
      enquiries (
        id,
        event_date,
        headcount,
        price_per_head,
        event_type,
        notes
      ),
      venues (
        id,
        name,
        slug
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error) throw error
  return data
}

export async function getVenueConversations(venueId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      status,
      created_at,
      enquiry_id,
      enquiries (
        id,
        event_date,
        headcount,
        event_type
      )
    `)
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateConversationStatus(
  conversationId: string,
  status: 'open' | 'closed' | 'handed_off'
) {
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) throw error
}
