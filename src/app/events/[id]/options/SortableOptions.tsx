'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Conversation, BookerEvent } from '@/types'

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
]

type SortKey = 'price_asc' | 'price_desc' | 'alpha'

function sortConversations(convs: Conversation[], key: SortKey): Conversation[] {
  return [...convs].sort((a, b) => {
    const spA = a.space as { name: string; base_price: number } | undefined
    const spB = b.space as { name: string; base_price: number } | undefined
    if (key === 'price_asc') return (spA?.base_price ?? 0) - (spB?.base_price ?? 0)
    if (key === 'price_desc') return (spB?.base_price ?? 0) - (spA?.base_price ?? 0)
    return (spA?.name ?? '').localeCompare(spB?.name ?? '')
  })
}

export default function SortableOptions({
  conversations,
  event,
}: {
  conversations: Conversation[]
  event: BookerEvent
}) {
  const [sort, setSort] = useState<SortKey>('price_asc')
  const sorted = sortConversations(conversations, sort)

  return (
    <div>
      {/* Sort bar */}
      <div className="flex gap-2 mb-6 flex-wrap mt-4">
        {[
          { key: 'price_asc' as SortKey, label: 'Price ↑' },
          { key: 'price_desc' as SortKey, label: 'Price ↓' },
          { key: 'alpha' as SortKey, label: 'A–Z' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`px-4 py-2 rounded-xl border-2 border-dark text-sm font-semibold transition-colors ${
              sort === key
                ? 'bg-dark text-white'
                : 'bg-white text-dark hover:bg-base-deep'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Space rows */}
      <div className="space-y-4">
        {sorted.map((conv) => {
          const space = conv.space as {
            id: string
            name: string
            capacity: number
            base_price: number
            photos: string[]
            payment_min_spend: number | null
          } | undefined

          const venue = conv.venue as { name: string; neighbourhood: string } | undefined
          const photos =
            space?.photos && space.photos.length > 0 ? space.photos : PLACEHOLDER_PHOTOS
          const totalPrice = space
            ? space.base_price * event.headcount + (space.payment_min_spend ?? 0)
            : null

          return (
            <Link
              key={conv.id}
              href={`/conversations/${conv.id}`}
              className="block bg-white border-2 border-dark rounded-2xl overflow-hidden hover:border-secondary transition-colors group"
            >
              <div className="flex">
                {/* Photo strip — horizontal scroll */}
                <div
                  className="flex gap-1 overflow-x-auto shrink-0 w-64"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {photos.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-40 h-32 bg-base-deep bg-cover bg-center"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted font-medium truncate">
                      {venue?.name ?? 'Venue'} · {venue?.neighbourhood ?? ''}
                    </p>
                    <h3 className="font-display font-bold text-xl uppercase text-dark group-hover:text-secondary transition-colors">
                      {space?.name ?? 'Space'}
                    </h3>
                  </div>

                  <div className="flex gap-4 text-sm text-text-muted mt-2">
                    <span>
                      <strong className="text-dark">£{space?.base_price ?? '—'}</strong>/head
                    </span>
                    {totalPrice && (
                      <span>
                        ≈ <strong className="text-dark">£{totalPrice.toLocaleString()}</strong> total
                      </span>
                    )}
                    <span>Up to <strong className="text-dark">{space?.capacity ?? '—'}</strong></span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pr-4">
                  <span className="text-2xl text-text-muted group-hover:text-secondary transition-colors">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
