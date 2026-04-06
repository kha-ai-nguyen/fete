import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'
import { ExtractedSpace } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()

  try {
    const body = await req.json()
    const { venue_update, spaces } = body as {
      venue_update: {
        name?: string
        description?: string
        contact_email?: string
        contact_phone?: string
      }
      spaces: ExtractedSpace[]
    }

    // Look up venue by slug
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('slug', slug)
      .single()

    if (venueError || !venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Update venue fields if provided
    if (venue_update && (venue_update.name || venue_update.description)) {
      const updates: Record<string, string> = {}
      if (venue_update.name) updates.name = venue_update.name
      if (venue_update.description) updates.description = venue_update.description

      await supabase.from('venues').update(updates).eq('id', venue.id)
    }

    // Insert each space
    const spacesToInsert = spaces
      .filter((s) => s.name?.trim())
      .map((s: ExtractedSpace) => ({
        venue_id: venue.id,
        name: s.name,
        capacity: s.capacity ?? 0,
        base_price: s.base_price ?? 0,
        photos: s.photos ?? [],
        payment_deposit_pct: s.payment_deposit_pct ?? null,
        payment_min_spend: s.min_spend ?? null,
        payment_pay_ahead: s.payment_pay_ahead ?? false,
      }))

    const { data: savedSpaces, error: spacesError } = await supabase
      .from('spaces')
      .insert(spacesToInsert)
      .select()

    if (spacesError) {
      console.error('update-spaces insert error:', spacesError)
      return NextResponse.json({ error: 'Failed to save spaces' }, { status: 500 })
    }

    return NextResponse.json({ success: true, spaces: savedSpaces })
  } catch (err) {
    console.error('update-spaces error:', err)
    return NextResponse.json({ error: 'Failed to save spaces' }, { status: 500 })
  }
}
