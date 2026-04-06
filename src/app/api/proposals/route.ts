import { NextRequest, NextResponse } from 'next/server'
import {
  getOrCreateConversation,
  insertMessage,
  getBookerEvent,
  getSpace,
} from '@/lib/supabase/queries'
import { createServiceClient } from '@/lib/supabase/client'

function buildFelicityListing(params: {
  spaceName: string
  venueName: string
  neighbourhood: string
  capacity: number
  basePricePerHead: number
  headcount: number
  eventType: string
  dateFrom: string | null
  depositPct: number | null
  minSpend: number | null
  payAhead: boolean
}): string {
  const {
    spaceName,
    venueName,
    neighbourhood,
    capacity,
    basePricePerHead,
    headcount,
    eventType,
    dateFrom,
    depositPct,
    minSpend,
    payAhead,
  } = params

  const totalBase = basePricePerHead * headcount
  const dateLabel = dateFrom
    ? new Date(dateFrom).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'your event date'

  const paymentLines: string[] = []
  if (depositPct) paymentLines.push(`${depositPct}% deposit to confirm`)
  if (minSpend) paymentLines.push(`£${minSpend.toLocaleString()} minimum spend`)
  if (payAhead) paymentLines.push('full payment required in advance')

  const paymentSection =
    paymentLines.length > 0
      ? `Payment terms: ${paymentLines.join(' · ')}.`
      : 'Payment terms: to be confirmed with the venue.'

  return `Hi there! I'm Felicity, your Fete events coordinator.

Here's a proposal for your ${eventType} on ${dateLabel}:

📍 ${spaceName} at ${venueName}
${neighbourhood}

• Capacity: up to ${capacity} guests
• Price: £${basePricePerHead}/head · estimated total £${totalBase.toLocaleString()} for ${headcount} guests
• ${paymentSection}

I'll follow up directly with the venue on your behalf. In the meantime, feel free to ask any questions below — I'm here to help.

Felicity, Fete`
}

export async function POST(req: NextRequest) {
  let body: {
    event_id?: string
    space_id?: string
    venue_id?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { event_id, space_id, venue_id } = body

  if (!event_id || !space_id || !venue_id) {
    return NextResponse.json(
      { error: 'event_id, space_id, venue_id are required' },
      { status: 400 }
    )
  }

  // Fetch event + space in parallel
  const [event, space] = await Promise.all([
    getBookerEvent(event_id),
    getSpace(space_id),
  ])

  if (!event || !space) {
    return NextResponse.json({ error: 'Event or space not found' }, { status: 404 })
  }

  // Get venue name
  const supabase = createServiceClient()
  const { data: venue } = await supabase
    .from('venues')
    .select('name, neighbourhood')
    .eq('id', venue_id)
    .single()

  try {
    const conversationId = await getOrCreateConversation(event_id, venue_id, space_id)

    const listing = buildFelicityListing({
      spaceName: space.name,
      venueName: venue?.name ?? 'the venue',
      neighbourhood: venue?.neighbourhood ?? '',
      capacity: space.capacity,
      basePricePerHead: space.base_price,
      headcount: event.headcount,
      eventType: event.event_type,
      dateFrom: event.date_from ?? null,
      depositPct: space.payment_deposit_pct ?? null,
      minSpend: space.payment_min_spend ?? null,
      payAhead: space.payment_pay_ahead,
    })

    await insertMessage(conversationId, 'felicity', listing)

    return NextResponse.json({ conversation_id: conversationId })
  } catch (err) {
    console.error('proposals POST error:', err)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}
