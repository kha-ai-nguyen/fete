import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Proposal } from '@/types'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.json()

  const { venue_id, enquiry_id, price_per_head } = body as {
    venue_id: string
    enquiry_id?: string
    price_per_head: number
  }

  if (!venue_id || typeof price_per_head !== 'number' || price_per_head <= 0) {
    return NextResponse.json(
      { error: 'venue_id (uuid) and price_per_head (positive number) are required' },
      { status: 400 }
    )
  }

  if (price_per_head > 10000) {
    return NextResponse.json(
      { error: 'price_per_head must not exceed 10 000' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      venue_id,
      enquiry_id: enquiry_id ?? null,
      price_per_head,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/price-proposals error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data as Proposal, { status: 201 })
}
