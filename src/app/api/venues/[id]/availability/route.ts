import { NextRequest } from 'next/server'
import { getAvailabilityBlocksByVenue } from '@/lib/supabase/queries'

/**
 * GET /api/venues/[id]/availability?from=...&to=...
 *
 * Returns availability blocks for a venue, optionally filtered by date range.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined

  const blocks = await getAvailabilityBlocksByVenue(id, from, to)

  return Response.json({ venue_id: id, blocks })
}
