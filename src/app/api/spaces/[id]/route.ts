import { NextRequest, NextResponse } from 'next/server'
import { updateSpace, deleteSpace } from '@/lib/supabase/queries'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    const space = await updateSpace(id, body)
    return NextResponse.json(space)
  } catch (err) {
    console.error('update space error:', err)
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await deleteSpace(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('delete space error:', err)
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })
  }
}
