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
