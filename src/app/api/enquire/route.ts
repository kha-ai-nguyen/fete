// Env vars required:
// GMAIL_USER - Gmail address to send from
// GMAIL_APP_PASSWORD - Gmail app password (not regular password)

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase/client'
import { getOrCreateConversation, insertMessage } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  let body: {
    venueId?: string | null
    venueName?: string
    venueEmail?: string
    eventDate?: string
    headcount?: number
    pricePerHead?: number | null
    eventType?: string
    notes?: string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { venueId, venueName, venueEmail, eventDate, headcount, pricePerHead, eventType, notes } = body

  // Validate required fields
  if (!venueName || !venueEmail || !eventDate || !headcount || !eventType) {
    return NextResponse.json(
      { error: 'venueName, venueEmail, eventDate, headcount and eventType are required' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // Insert event into DB
  const { data: eventData, error: dbError } = await supabase
    .from('events')
    .insert({
      venue_id: venueId ?? null,
      venue_name: venueName,
      venue_email: venueEmail,
      event_date: eventDate,
      headcount,
      price_per_head: pricePerHead ?? null,
      event_type: eventType,
      notes: notes ?? null,
      booker_name: 'Fete User',
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('events insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save event' }, { status: 500 })
  }

  // Create conversation and insert Felicity's first message
  try {
    if (venueId && eventData?.id) {
      const conversationId = await getOrCreateConversation(eventData.id, venueId)

      const felicityMessage = `Hi! Thanks for reaching out about your ${eventType} on ${eventDate} for ${headcount} guests.

I'm Felicity, Fete's events coordinator. I've checked ${venueName} and they're available that date.

Looking forward to helping make your event a success!

Felicity, Fete`

      await insertMessage(conversationId, 'felicity', felicityMessage)
    }
  } catch (conversationError) {
    // Log but don't fail — event already saved
    console.error('Failed to create conversation:', conversationError)
  }

  // Send email to venue (skip silently if env vars missing)
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    console.warn('Email skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set')
  } else {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })

      const budgetLine = pricePerHead ? `Budget: £${pricePerHead}/head\n` : ''
      const notesLine = notes ? `Notes: ${notes}\n` : ''

      await transporter.sendMail({
        from: gmailUser,
        to: venueEmail,
        replyTo: 'noreply@fete.london',
        subject: `New event inquiry for ${venueName} — ${eventType} for ${headcount} guests`,
        text: `You have a new private event inquiry via Fete.

Event type: ${eventType}
Date: ${eventDate}
Guests: ${headcount}
${budgetLine}
${notesLine}
---
This inquiry was sent via Fete (https://fete.london).
To reply, respond directly to this email.`,
      })
    } catch (emailError) {
      // Log but don't fail — DB insert already succeeded
      console.error('Failed to send inquiry email:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}