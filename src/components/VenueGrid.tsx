'use client'

import { useState } from 'react'
import type { EventType, Venue } from '@/types'
import FilterBar from '@/components/FilterBar'
import VenueCard from '@/components/VenueCard'

// Derives a tier label from a numeric price or a legacy price_estimate string
function getPriceTier(venue: Venue): string {
  // Prefer the verified rolling-average price when available
  if (venue.price_per_head != null) {
    const price = venue.price_per_head
    if (price < 50) return '£'
    if (price < 80) return '££'
    if (price < 120) return '£££'
    return '££££'
  }

  // Fall back to the legacy text estimate
  const estimate = venue.price_estimate
  if (!estimate) return ''
  const match = estimate.match(/£(\d+)/)
  if (!match) return estimate // already a tier string like "££"
  const price = parseInt(match[1])
  if (price < 50) return '£'
  if (price < 80) return '££'
  if (price < 120) return '£££'
  return '££££'
}

// Maps capacity_max to a filter label bucket
function getCapacityLabel(venue: Venue): string {
  const max = venue.capacity_max ?? venue.capacity_min ?? 0
  if (max <= 50) return 'Up to 50'
  if (max <= 150) return '50–150'
  if (max <= 300) return '150–300'
  return '300+'
}

export default function VenueGrid({ venues }: { venues: Venue[] }) {
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)

  const filtered = venues.filter((v) => {
    if (selectedType && !v.event_types.includes(selectedType)) return false
    if (selectedCapacity && getCapacityLabel(v) !== selectedCapacity) return false
    if (selectedPrice && getPriceTier(v) !== selectedPrice) return false
    return true
  })

  function handleFlip(id: string) {
    setFlippedCardId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <p className="text-text-muted font-medium mb-8">
        {filtered.length} {filtered.length === 1 ? 'venue' : 'venues'} in London
      </p>

      <FilterBar
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        selectedCapacity={selectedCapacity}
        onCapacitySelect={setSelectedCapacity}
        selectedPrice={selectedPrice}
        onPriceSelect={setSelectedPrice}
      />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isFlipped={flippedCardId === venue.id}
              onFlip={() => handleFlip(venue.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="font-display font-extrabold text-2xl uppercase text-dark mb-2">
            No venues yet
          </p>
          <p className="text-text-muted font-medium">
            Check back soon — we're adding London venues daily.
          </p>
        </div>
      )}
    </>
  )
}
