'use client'

import type { Venue } from '@/types'
import { Sparkles, Diamond, BadgeCheck } from 'lucide-react'

interface VenueDetailProps {
  venue: Venue
}

export default function VenueDetail({ venue }: VenueDetailProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="flex-1">
          {/* Photo gallery */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            <div className="col-span-2 aspect-[16/9] overflow-hidden border-2 border-dark rounded-md">
              <img
                src={venue.photos?.[0] ?? ''}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Venue name */}
          <h1 className="font-display font-extrabold text-4xl uppercase text-dark mb-4">
            {venue.name}
          </h1>

          {/* Guest Favourite badge */}
          <div className="border-2 border-dark rounded-lg p-4 flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-secondary flex-shrink-0" />
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                Guest Favourite
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-lg leading-relaxed text-dark">
              {venue.description}
            </p>
          </div>
        </div>

        {/* Right sidebar (sticky) */}
        <div className="w-full lg:w-96">
          <div className="lg:sticky lg:top-8 space-y-4">
            {/* Rare find callout */}
            <div className="border-2 border-dark rounded-lg p-4 flex items-center gap-3">
              <Diamond className="w-5 h-5 text-secondary flex-shrink-0" />
              <span className="text-sm font-bold text-dark">
                Rare find — this venue is usually booked
              </span>
            </div>

            {/* Pricing card */}
            <div className="border-2 border-dark rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-extrabold text-2xl text-dark">
                  {venue.price_per_head != null
                    ? `£${Math.round(venue.price_per_head)}`
                    : (venue.price_estimate ?? '—')}
                </span>
                <span className="text-text-muted text-sm font-medium">/ head</span>
                {venue.price_per_head != null && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-dark ml-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Verified
                  </span>
                )}
              </div>

              {/* Date / Guest inputs */}
              <div className="border-2 border-dark rounded-md mb-4 overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r-2 border-dark">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm font-medium text-dark bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold block mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      placeholder="Add guests"
                      className="w-full text-sm font-medium text-dark bg-transparent focus:outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Reserve CTA */}
              <button className="w-full bg-primary border-2 border-dark font-display font-extrabold text-lg uppercase py-3.5 rounded-md hover:bg-secondary hover:text-white transition-colors">
                Reserve
              </button>
              <p className="text-center text-sm font-bold text-text-muted mt-3">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
