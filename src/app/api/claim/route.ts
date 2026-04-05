// Env vars required:
// FOUNDER_EMAIL - destination for claim notifications
// GMAIL_USER - Gmail address to send from
// GMAIL_APP_PASSWORD - Gmail app password (not regular password)
// NEXT_PUBLIC_APP_URL - optional, defaults to https://fete.london

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  let body: { venueId?: string; venueName?: string; name?: string; email?: string; role?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { venueId, venueName, name, email, role } = body

  if (!venueId || !venueName || !name || !email || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Insert claim request into DB
  const { error: dbError } = await supabase
    .from('claim_requests')
    .insert({ venue_id: venueId, venue_name: venueName, name, email, role })

  if (dbError) {
    console.error('claim_requests insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save claim request' }, { status: 500 })
  }

  // Fetch venue slug for the notification email
  const { data: venue } = await supabase
    .from('venues')
    .select('slug')
    .eq('id', venueId)
    .single()

  const venueSlug = venue?.slug ?? venueId
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fete.london'

  // Send email notification (skip silently if env vars missing)
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const founderEmail = process.env.FOUNDER_EMAIL

  if (!gmailUser || !gmailPass) {
    console.warn('Email skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set')
  } else if (!founderEmail) {
    console.warn('Email skipped: FOUNDER_EMAIL not set')
  } else {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })

      await transporter.sendMail({
        from: gmailUser,
        to: founderEmail,
        subject: `New claim request – ${venueName}`,
        text: `New venue claim request on Fete.

Venue: ${venueName}

Name: ${name}
Email: ${email}
Role: ${role}

View venue: ${appUrl}/venues/${venueSlug}

Approve by setting claimed = true in Supabase for venue ID: ${venueId}`,
      })
    } catch (emailError) {
      // Log but don't fail the request — DB insert already succeeded
      console.error('Failed to send claim notification email:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
