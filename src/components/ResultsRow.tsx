'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PhotoCarousel from './PhotoCarousel'
import type { Space, Venue } from '@/types'

const PLACEHOLDER_PHOTOS = [
  'https://picsum.photos/seed/space1/600/400',
  'https://picsum.photos/seed/space2/600/400',
  'https://picsum.photos/seed/space3/600/400',
]

export type ResultSpace = Space & {
  venue: Pick<Venue, 'id' | 'name' | 'neighbourhood'>
  available: boolean
  distance_km: number
  total_price: number
}

interface Props {
  space: ResultSpace
  eventId: string
  unavailableReason?: string
}

export default function ResultsRow({ space, eventId, unavailableReason }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const photos = space.photos?.length > 0 ? space.photos : PLACEHOLDER_PHOTOS
  const isAvailable = space.available && !unavailableReason

  async function handleRequestProposal() {
    if (!isAvailable || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          space_id: space.id,
          venue_id: space.venue_id,
        }),
      })
      const data = await res.json()
      if (data.conversation_id) {
        router.push(`/conversations/${data.conversation_id}`)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div
      className={`bg-white border-2 border-dark rounded-2xl overflow-hidden transition-all ${
        isAvailable ? 'hover:shadow-[4px_4px_0_#1A1A1A] hover:-translate-y-0.5' : 'opacity-50'
      }`}
    >
      {/* Mobile: stack vertically; Desktop: side by side */}
      <div className="flex flex-col md:flex-row">
        {/* Info panel — mobile: top, desktop: left fixed width */}
        <div className="md:w-[220px] md:shrink-0 p-5 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-dark">
          <div className="space-y-1">
            <p className="font-display font-extrabold text-lg uppercase tracking-widest text-dark leading-tight">
              {space.venue.name}
            </p>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">
              {space.venue.neighbourhood} · {space.distance_km.toFixed(1)}km
            </p>
            <p className="text-sm text-text-muted mt-1">{space.name}</p>
            <p className="text-xs text-text-muted">Up to {space.capacity} guests</p>
          </div>

          <div className="mt-4 space-y-3">
            {/* Price — acid yellow highlight */}
            <div className="inline-block bg-dark/5 border border-dark/10 rounded-lg px-3 py-2">
              <span className="font-display font-extrabold text-2xl text-primary">
                £{space.total_price.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted ml-1">est. total</span>
              <p className="text-[10px] text-text-muted mt-0.5">
                £{space.base_price}/head
                {space.payment_min_spend ? ` + £${space.payment_min_spend.toLocaleString()} min spend` : ''}
              </p>
            </div>

            {/* CTA */}
            {isAvailable ? (
              <button
                onClick={handleRequestProposal}
                disabled={loading}
                className="w-full bg-primary border-2 border-dark text-dark font-bold uppercase text-xs tracking-widest py-2.5 px-4 rounded-xl hover:bg-secondary hover:text-white transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Request proposal'}
              </button>
            ) : (
              <div className="text-xs font-semibold text-secondary uppercase tracking-wide py-2">
                {unavailableReason ?? 'Not available'}
              </div>
            )}
          </div>
        </div>

        {/* Photo carousel */}
        <div className="flex-1 min-w-0 p-3">
          <PhotoCarousel photos={photos} height={200} />
        </div>
      </div>
    </div>
  )
}
