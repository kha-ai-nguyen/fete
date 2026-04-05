import { createServiceClient } from './client'
import type { Venue, Proposal } from '@/types'

export async function getVenues(): Promise<Venue[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: false })

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
