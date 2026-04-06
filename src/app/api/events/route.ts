import { NextRequest, NextResponse } from 'next/server'
import { createBookerEvent, getBookerEvent } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  let body: {
    event_type?: string
    headcount?: number
    budget_per_head_max?: number | null
    date_from?: string | null
    date_to?: string | null
    postcode?: string | null
    radius_km?: number
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.event_type || !body.headcount) {
    return NextResponse.json({ error: 'event_type and headcount are required' }, { status: 400 })
  }

  try {
    const event = await createBookerEvent({
      event_type: body.event_type,
      headcount: body.headcount,
      budget_per_head_max: body.budget_per_head_max ?? null,
      date_from: body.date_from ?? null,
      date_to: body.date_to ?? null,
      postcode: body.postcode ?? null,
      radius_km: body.radius_km ?? 5,
    })

    return NextResponse.json({ id: event.id })
  } catch (err) {
    console.error('create event error:', err)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const event = await getBookerEvent(id)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(event)
}
