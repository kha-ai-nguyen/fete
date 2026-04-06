'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestProposalButton({
  spaceId,
  venueId,
  eventId,
}: {
  spaceId: string
  venueId: string
  eventId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, space_id: spaceId, venue_id: venueId }),
    })
    const json = await res.json()
    if (json.conversation_id) {
      setDone(true)
      router.push(`/conversations/${json.conversation_id}`)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="w-full bg-primary text-dark font-semibold text-sm text-center py-3 rounded-xl border-2 border-dark">
        Proposal requested ✓
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-secondary text-white font-semibold text-sm py-3 rounded-xl border-2 border-dark hover:bg-dark transition-colors disabled:opacity-50"
    >
      {loading ? 'Requesting…' : 'Request proposal →'}
    </button>
  )
}
