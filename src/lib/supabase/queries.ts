import { createServiceClient } from './client'
import type { Space, BookerEvent, Conversation, Message, Proposal } from '@/types'

// ─── Spaces ──────────────────────────────────────────────────────────────────

export async function getSpacesByVenue(venueId: string): Promise<Space[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('spaces')
    .select('*, venue:venues(id, name, slug, neighbourhood)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getSpace(spaceId: string): Promise<Space | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('spaces')
    .select('*, venue:venues(id, name, slug, neighbourhood)')
    .eq('id', spaceId)
    .single()

  if (error) return null
  return data
}

export type SpaceFilters = {
  headcount?: number
  budget_max?: number
  eventType?: string
  dateFrom?: string   // YYYY-MM-DD
  dateTo?: string     // YYYY-MM-DD
}

export async function getSpacesWithFilters(filters: SpaceFilters = {}): Promise<Space[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('spaces')
    .select('*, venue:venues(id, name, slug, neighbourhood)')

  if (filters.headcount) {
    query = query.gte('capacity', filters.headcount)
  }

  if (filters.budget_max) {
    query = query.lte('base_price', filters.budget_max)
  }

  const { data: spaces, error } = await query.order('base_price', { ascending: true })
  if (error) throw error
  if (!spaces) return []

  // Filter out spaces blocked on any of the requested dates
  if (filters.dateFrom && spaces.length > 0) {
    const spaceIds = spaces.map((s) => s.id)

    let blockQuery = supabase
      .from('availability')
      .select('space_id, blocked_date')
      .in('space_id', spaceIds)

    if (filters.dateFrom) blockQuery = blockQuery.gte('blocked_date', filters.dateFrom)
    if (filters.dateTo) blockQuery = blockQuery.lte('blocked_date', filters.dateTo)
    else blockQuery = blockQuery.eq('blocked_date', filters.dateFrom)

    const { data: blocks } = await blockQuery
    const blockedSpaceIds = new Set((blocks ?? []).map((b) => b.space_id))

    return spaces.filter((s) => !blockedSpaceIds.has(s.id))
  }

  return spaces
}

export async function createSpace(data: {
  venue_id: string
  name: string
  capacity: number
  base_price: number
  photos?: string[]
  payment_deposit_pct?: number | null
  payment_min_spend?: number | null
  payment_pay_ahead?: boolean
}): Promise<Space> {
  const supabase = createServiceClient()
  const { data: space, error } = await supabase
    .from('spaces')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return space
}

export async function updateSpace(
  spaceId: string,
  data: Partial<{
    name: string
    capacity: number
    base_price: number
    photos: string[]
    payment_deposit_pct: number | null
    payment_min_spend: number | null
    payment_pay_ahead: boolean
  }>
): Promise<Space> {
  const supabase = createServiceClient()
  const { data: space, error } = await supabase
    .from('spaces')
    .update(data)
    .eq('id', spaceId)
    .select()
    .single()

  if (error) throw error
  return space
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spaces').delete().eq('id', spaceId)
  if (error) throw error
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function createBookerEvent(data: {
  event_type: string
  headcount: number
  budget_per_head_max?: number | null
  date_from?: string | null
  date_to?: string | null
  postcode?: string | null
  radius_km?: number
  booker_name?: string
}): Promise<BookerEvent> {
  const supabase = createServiceClient()
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      event_type: data.event_type,
      headcount: data.headcount,
      budget_per_head_max: data.budget_per_head_max ?? null,
      date_from: data.date_from ?? null,
      date_to: data.date_to ?? null,
      postcode: data.postcode ?? null,
      radius_km: data.radius_km ?? 5,
      booker_name: data.booker_name ?? 'Guest',
      // legacy required fields — set empty for new flow
      venue_name: '',
      venue_email: '',
      event_date: data.date_from ?? new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw error
  return event
}

export async function getBookerEvent(eventId: string): Promise<BookerEvent | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error) return null
  return data
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function getOrCreateConversation(
  eventId: string,
  venueId: string | null,
  spaceId?: string | null
): Promise<string> {
  const supabase = createServiceClient()

  let query = supabase
    .from('conversations')
    .select('id')
    .eq('event_id', eventId)

  if (venueId) query = query.eq('venue_id', venueId)
  if (spaceId) query = query.eq('space_id', spaceId)

  const { data: existing } = await query.maybeSingle()
  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      event_id: eventId,
      venue_id: venueId ?? null,
      space_id: spaceId ?? null,
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

export async function insertMessage(
  conversationId: string,
  fromType: 'booker' | 'venue' | 'felicity',
  messageText: string
): Promise<Message> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      from_type: fromType,
      message_text: messageText,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      event:events(*),
      venue:venues(id, name, slug, neighbourhood),
      space:spaces(*)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getConversationsByEventId(eventId: string): Promise<Conversation[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      venue:venues(id, name, slug, neighbourhood),
      space:spaces(id, name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ─── Venue dashboard ──────────────────────────────────────────────────────────

export async function getConversationsByVenueId(venueId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      space_id,
      event_id,
      event:events(id, event_type, headcount, budget_per_head_max, date_from, booker_name),
      space:spaces(id, name, capacity, base_price)
    `)
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getAvailabilityBlocks(spaceId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('availability')
    .select('blocked_date')
    .eq('space_id', spaceId)
    .order('blocked_date', { ascending: true })

  if (error) throw error
  return (data ?? []).map((b) => b.blocked_date)
}

export async function toggleAvailabilityBlock(
  spaceId: string,
  date: string
): Promise<{ blocked: boolean }> {
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('availability')
    .select('id')
    .eq('space_id', spaceId)
    .eq('blocked_date', date)
    .maybeSingle()

  if (existing) {
    await supabase.from('availability_blocks').delete().eq('id', existing.id)
    return { blocked: false }
  } else {
    await supabase
      .from('availability')
      .insert({ space_id: spaceId, blocked_date: date })
    return { blocked: true }
  }
}

// ─── Price Proposals (KHA-155: verified pricing) ─────────────────────────────

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
