import { NextRequest, NextResponse } from 'next/server'
import { createSpace } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  let body: {
    venue_id?: string
    name?: string
    capacity?: number
    base_price?: number
    photos?: string[]
    payment_deposit_pct?: number | null
    payment_min_spend?: number | null
    payment_pay_ahead?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.venue_id || !body.name || !body.capacity || !body.base_price) {
    return NextResponse.json({ error: 'venue_id, name, capacity, base_price required' }, { status: 400 })
  }

  try {
    const space = await createSpace({
      venue_id: body.venue_id,
      name: body.name,
      capacity: body.capacity,
      base_price: body.base_price,
      photos: body.photos ?? [],
      payment_deposit_pct: body.payment_deposit_pct ?? null,
      payment_min_spend: body.payment_min_spend ?? null,
      payment_pay_ahead: body.payment_pay_ahead ?? false,
    })
    return NextResponse.json(space)
  } catch (err) {
    console.error('create space error:', err)
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 })
  }
}
