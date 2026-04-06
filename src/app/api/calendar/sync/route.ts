import { NextRequest } from 'next/server'
import {
  getVenuesWithCalendar,
  upsertAvailabilityBlocks,
  markVenueSynced,
} from '@/lib/supabase/queries'
import { parseIcalFeed } from '@/lib/ical/parser'
import type { CalendarType } from '@/types'

interface SyncResult {
  venue_id: string
  venue_name: string
  events_synced: number
  error: string | null
}

/**
 * POST /api/calendar/sync
 *
 * Syncs all venues that have a calendar configured.
 * Optionally accepts { venue_id } to sync a single venue.
 * Intended to be called by a cron job or manually by an admin.
 */
export async function POST(request: NextRequest) {
  let targetVenueId: string | undefined
  try {
    const body = await request.json()
    targetVenueId = body?.venue_id
  } catch {
    // No body or invalid JSON — sync all venues
  }

  const venues = await getVenuesWithCalendar()

  const toSync = targetVenueId
    ? venues.filter((v) => v.id === targetVenueId)
    : venues

  if (toSync.length === 0) {
    return Response.json({ message: 'No venues to sync', results: [] })
  }

  const results: SyncResult[] = []

  for (const venue of toSync) {
    if (!venue.ical_url || !venue.calendar_type) continue

    try {
      const events = await parseIcalFeed(venue.ical_url)

      const blocks = events.map((e) => ({
        title: e.title,
        starts_at: e.starts_at.toISOString(),
        ends_at: e.ends_at.toISOString(),
        all_day: e.all_day,
        source: venue.calendar_type as CalendarType,
        uid: e.uid,
      }))

      const { inserted, error } = await upsertAvailabilityBlocks(venue.id, blocks)

      if (!error) {
        await markVenueSynced(venue.id)
      }

      results.push({
        venue_id: venue.id,
        venue_name: venue.name,
        events_synced: inserted,
        error,
      })
    } catch (err) {
      results.push({
        venue_id: venue.id,
        venue_name: venue.name,
        events_synced: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const synced = results.filter((r) => !r.error).length
  const failed = results.filter((r) => r.error).length

  return Response.json({
    message: `Synced ${synced} venue(s), ${failed} failed`,
    results,
  })
}
