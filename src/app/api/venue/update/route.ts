import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { venueId, description, price_estimate, capacity_max, neighbourhood } = body as {
      venueId?: string
      description?: string
      price_estimate?: string
      capacity_max?: number
      neighbourhood?: string
    }

    if (!venueId) {
      return NextResponse.json({ error: 'venueId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('venues')
      .update({
        description: description ?? null,
        price_estimate: price_estimate ?? null,
        capacity_max: capacity_max ?? null,
        neighbourhood: neighbourhood ?? null,
      })
      .eq('id', venueId)

    if (error) {
      console.error('venue update error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('venue update exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
