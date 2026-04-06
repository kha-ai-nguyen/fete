import { NextRequest } from 'next/server'
import { updateVenueCalendar } from '@/lib/supabase/queries'
import { isValidIcalUrl } from '@/lib/ical/parser'
import type { CalendarType } from '@/types'

/**
 * POST /api/venues/[id]/calendar
 * Body: { calendar_type: 'google' | 'ical' | null, ical_url: string | null }
 *
 * Saves or clears a venue's calendar connection.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: { calendar_type?: CalendarType | null; ical_url?: string | null }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const calendarType = body.calendar_type ?? null
  const icalUrl = body.ical_url ?? null

  // Validate: if setting a calendar, URL is required and must be valid
  if (calendarType && !icalUrl) {
    return Response.json(
      { error: 'ical_url is required when calendar_type is set' },
      { status: 400 }
    )
  }

  if (icalUrl && !isValidIcalUrl(icalUrl)) {
    return Response.json(
      { error: 'ical_url must be a valid http(s) URL' },
      { status: 400 }
    )
  }

  const { error } = await updateVenueCalendar(id, calendarType, icalUrl)
  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ ok: true, venue_id: id, calendar_type: calendarType })
}
