'use client'

import { BadgeCheck } from 'lucide-react'
import type { Venue } from '@/types'

interface VenueCardProps {
  venue: Venue
  isFlipped: boolean
  onFlip: () => void
}

function formatPrice(venue: Venue): { label: string; verified: boolean } {
  if (venue.price_per_head != null) {
    return { label: `£${Math.round(venue.price_per_head)}/head`, verified: true }
  }
  return { label: venue.price_estimate ?? '—', verified: false }
}

function formatCapacity(venue: Venue): string {
  if (venue.capacity_min && venue.capacity_max) {
    return `${venue.capacity_min}–${venue.capacity_max}`
  }
  if (venue.capacity_max) return `Up to ${venue.capacity_max}`
  if (venue.capacity_min) return `${venue.capacity_min}+`
  return '—'
}

export default function VenueCard({ venue, isFlipped, onFlip }: VenueCardProps) {
  const photo = venue.photos?.[0] ?? ''
  const primaryEventType = venue.event_types?.[0] ?? ''

  return (
    <div
      className="cursor-pointer [perspective:1000px]"
      onClick={onFlip}
    >
      <div
        className={`relative w-full transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ minHeight: '420px' }}
      >
        {/* Front face */}
        <div className="absolute inset-0 backface-hidden bg-card border-2 border-dark rounded-md overflow-hidden">
          <div className="relative h-[60%] min-h-[250px]">
            <img
              src={photo}
              alt={venue.name}
              className="w-full h-full object-cover border-b-2 border-dark"
            />
          </div>
          <div className="bg-dark text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 border-b-2 border-dark">
            {primaryEventType}
          </div>
          <div className="p-4">
            <h3 className="font-display font-extrabold text-2xl uppercase text-dark leading-tight">
              {venue.name}
            </h3>
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">
              {venue.neighbourhood}
            </p>
          </div>
        </div>

        {/* Back face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border-2 border-dark rounded-md overflow-hidden p-5 flex flex-col gap-3">
          <div className="border-2 border-dark rounded-sm bg-white p-3 flex justify-between">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
                Capacity
              </span>
              <span className="text-sm font-bold uppercase text-dark">
                {formatCapacity(venue)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
                Price
              </span>
              <span className="text-sm font-bold uppercase text-dark flex items-center gap-1 justify-end">
                {formatPrice(venue).label}
                {formatPrice(venue).verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-primary inline-block" />
                )}
              </span>
            </div>
          </div>
          <p className="text-sm text-text-muted font-medium leading-relaxed flex-1">
            {venue.description}
          </p>
          <button className="w-full bg-primary border-2 border-dark text-dark font-bold uppercase tracking-widest py-3.5 rounded-md hover:bg-secondary hover:text-white transition-colors">
            View Venue →
          </button>
        </div>
      </div>
    </div>
  )
}
