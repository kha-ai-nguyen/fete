import { NextRequest, NextResponse } from 'next/server'
import { insertMessage } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  let body: {
    conversation_id?: string
    from_type?: 'booker' | 'venue' | 'felicity'
    message_text?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { conversation_id, from_type, message_text } = body

  if (!conversation_id || !from_type || !message_text) {
    return NextResponse.json(
      { error: 'conversation_id, from_type, message_text required' },
      { status: 400 }
    )
  }

  try {
    const message = await insertMessage(conversation_id, from_type, message_text)
    return NextResponse.json(message)
  } catch (err) {
    console.error('messages POST error:', err)
    return NextResponse.json({ error: 'Failed to insert message' }, { status: 500 })
  }
}
