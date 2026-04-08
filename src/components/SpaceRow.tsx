'use client'

import { useState, useCallback, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import PhotoMosaic from './PhotoMosaic'
import type { ResultSpace } from '@/app/events/[id]/results/mockSpaces'

interface Props {
  space: ResultSpace
  eventId: string
  isActive: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  index: number
}

const SpaceRow = forwardRef<HTMLDivElement, Props>(function SpaceRow(
  { space, eventId, isActive, isSelected, onToggleSelect, index },
  ref
) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)

  const showDetails = hovered || isActive

  const handleRequestProposal = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!space.available || loading) return
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
  }, [space.available, space.id, space.venue_id, eventId, loading, router])

  return (
    <motion.div
      ref={ref}
      data-space-id={space.id}
      className={`relative ${!space.available ? 'opacity-60' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.3) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Desktop layout: photo mosaic with overlaid details */}
      <div className="hidden md:block relative">
        <PhotoMosaic
          photos={space.photos}
          venueName={space.venue.name}
          spaceName={space.name}
        />

        {/* Checkbox — top left, always visible */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(space.id) }}
          className={`absolute top-4 left-4 z-20 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-primary border-2 border-dark shadow-[2px_2px_0_#1A1A1A]'
              : 'bg-white/80 border-2 border-dark/30 hover:border-dark backdrop-blur-sm'
          }`}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Unavailable badge */}
        {!space.available && (
          <div className="absolute top-4 right-4 z-20 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
            Unavailable
          </div>
        )}

        {/* Default overlay — venue name at bottom left */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark/70 via-dark/30 to-transparent pt-20 pb-5 px-6 z-10">
          <h3 className="font-display font-extrabold text-white uppercase text-xl tracking-wide leading-tight">
            {space.venue.name}
          </h3>
          <p className="text-white/60 text-xs uppercase tracking-wide mt-1">
            {space.venue.neighbourhood} · {space.distance_km.toFixed(1)}km · {space.name}
          </p>
        </div>

        {/* Hover/Active detail panel — slides in from left */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              className="absolute inset-y-0 left-0 w-[340px] bg-dark/90 backdrop-blur-sm z-20 p-6 flex flex-col justify-end"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-display font-extrabold text-white uppercase text-xl tracking-wide leading-tight">
                    {space.venue.name}
                  </h3>
                  <p className="text-white/50 text-xs uppercase tracking-wide mt-1">
                    {space.venue.neighbourhood} · {space.distance_km.toFixed(1)}km
                  </p>
                </div>

                <div>
                  <p className="text-white/80 text-sm font-medium">{space.name}</p>
                  <p className="text-white/50 text-xs mt-0.5">Up to {space.capacity} guests</p>
                </div>

                {/* Price */}
                <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                  <span className="font-display font-extrabold text-2xl text-primary">
                    £{space.total_price.toLocaleString()}
                  </span>
                  <span className="text-white/50 text-xs ml-1">est. total</span>
                  <p className="text-white/40 text-[10px] mt-0.5">
                    £{space.base_price}/head
                    {space.payment_min_spend
                      ? ` + £${space.payment_min_spend.toLocaleString()} min spend`
                      : ''}
                  </p>
                </div>

                {/* Payment terms */}
                <div className="flex flex-wrap gap-1.5">
                  {space.payment_deposit_pct && (
                    <span className="text-[10px] text-white/50 border border-white/20 rounded-full px-2.5 py-0.5">
                      {space.payment_deposit_pct}% deposit
                    </span>
                  )}
                  {space.payment_min_spend && (
                    <span className="text-[10px] text-white/50 border border-white/20 rounded-full px-2.5 py-0.5">
                      £{space.payment_min_spend.toLocaleString()} min
                    </span>
                  )}
                  {space.payment_pay_ahead && (
                    <span className="text-[10px] text-white/50 border border-white/20 rounded-full px-2.5 py-0.5">
                      Pay in advance
                    </span>
                  )}
                </div>

                {/* CTA */}
                {space.available ? (
                  <button
                    onClick={handleRequestProposal}
                    disabled={loading}
                    className="w-full bg-primary border-2 border-dark text-dark font-bold uppercase text-xs tracking-widest py-3 px-4 rounded-xl hover:bg-secondary hover:text-white transition-colors disabled:opacity-60"
                    style={{ minHeight: 44 }}
                  >
                    {loading ? 'Sending...' : 'Request proposal →'}
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-secondary uppercase tracking-wide py-2">
                    Not available on these dates
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile layout: photo on top, details always visible below */}
      <div className="block md:hidden">
        <div className="relative">
          <PhotoMosaic
            photos={space.photos}
            venueName={space.venue.name}
            spaceName={space.name}
          />
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(space.id) }}
            className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary border-2 border-dark'
                : 'bg-white/80 border-2 border-dark/30'
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          {!space.available && (
            <div className="absolute top-3 right-3 z-20 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg">
              Unavailable
            </div>
          )}
        </div>

        {/* Details below photo */}
        <div className="px-1 py-3 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-extrabold text-dark uppercase text-lg tracking-wide leading-tight">
                {space.venue.name}
              </h3>
              <p className="text-text-muted text-[11px] uppercase tracking-wide mt-0.5">
                {space.venue.neighbourhood} · {space.distance_km.toFixed(1)}km · {space.name}
              </p>
              <p className="text-text-muted text-xs mt-0.5">Up to {space.capacity} guests</p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-display font-extrabold text-xl text-dark">
                £{space.total_price.toLocaleString()}
              </span>
              <p className="text-text-muted text-[10px]">est. total</p>
            </div>
          </div>

          {space.available ? (
            <button
              onClick={handleRequestProposal}
              disabled={loading}
              className="w-full bg-primary border-2 border-dark text-dark font-bold uppercase text-xs tracking-widest py-2.5 px-4 rounded-xl hover:bg-secondary hover:text-white transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Request proposal →'}
            </button>
          ) : (
            <div className="text-xs font-semibold text-secondary uppercase tracking-wide py-1">
              Not available on these dates
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})

export default SpaceRow
