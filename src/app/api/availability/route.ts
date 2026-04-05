import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { venueId, date, note } = body as {
      venueId?: string
      date?: string
      note?: string
    }

    if (!venueId || !date) {
      return NextResponse.json({ error: 'venueId and date are required' }, { status: 400 })
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('availability_blocks')
      .upsert(
        { venue_id: venueId, blocked_date: date, note: note ?? null },
        { onConflict: 'venue_id,blocked_date' }
      )

    if (error) {
      console.error('availability POST error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('availability POST exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { venueId, date } = body as { venueId?: string; date?: string }

    if (!venueId || !date) {
      return NextResponse.json({ error: 'venueId and date are required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('availability_blocks')
      .delete()
      .eq('venue_id', venueId)
      .eq('blocked_date', date)

    if (error) {
      console.error('availability DELETE error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('availability DELETE exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
