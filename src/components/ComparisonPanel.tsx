'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ResultSpace } from '@/app/events/[id]/results/mockSpaces'

interface Props {
  spaces: ResultSpace[]
  onClose: () => void
  eventId: string
}

export default function ComparisonPanel({ spaces, onClose, eventId }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRequestProposal = useCallback(async (space: ResultSpace) => {
    if (!space.available || loadingId) return
    setLoadingId(space.id)
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
      setLoadingId(null)
    }
  }, [eventId, loadingId, router])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/60" onClick={onClose} />

      {/* Panel */}
      <motion.div
        className="relative bg-white rounded-2xl border-2 border-dark shadow-[6px_6px_0_#1A1A1A] w-full max-w-4xl max-h-[85vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-dark px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-extrabold text-xl uppercase text-dark tracking-wide">
            Compare spaces
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-dark/30 hover:border-dark hover:bg-base transition-colors text-dark"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison grid */}
        <div className="p-6">
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${spaces.length}, 1fr)` }}
          >
            {/* Photos */}
            {spaces.map((s) => (
              <div key={`photo-${s.id}`} className="rounded-xl overflow-hidden h-[140px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photos[0]}
                  alt={`${s.venue.name} – ${s.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Venue + Space name */}
            {spaces.map((s) => (
              <div key={`name-${s.id}`}>
                <h3 className="font-display font-extrabold text-dark uppercase text-sm tracking-wide">
                  {s.venue.name}
                </h3>
                <p className="text-text-muted text-xs mt-0.5">{s.name}</p>
              </div>
            ))}

            {/* Location */}
            {spaces.map((s) => (
              <div key={`loc-${s.id}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Location</p>
                <p className="text-sm text-dark">{s.venue.neighbourhood} · {s.distance_km.toFixed(1)}km</p>
              </div>
            ))}

            {/* Capacity */}
            {spaces.map((s) => (
              <div key={`cap-${s.id}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Capacity</p>
                <p className="text-sm text-dark">Up to {s.capacity} guests</p>
              </div>
            ))}

            {/* Price */}
            {spaces.map((s) => (
              <div key={`price-${s.id}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Est. total</p>
                <p className="font-display font-extrabold text-lg text-dark">
                  £{s.total_price.toLocaleString()}
                </p>
                <p className="text-text-muted text-[10px]">
                  £{s.base_price}/head
                  {s.payment_min_spend ? ` + £${s.payment_min_spend.toLocaleString()} min` : ''}
                </p>
              </div>
            ))}

            {/* Payment terms */}
            {spaces.map((s) => (
              <div key={`terms-${s.id}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Payment</p>
                <div className="flex flex-wrap gap-1">
                  {s.payment_deposit_pct && (
                    <span className="text-[10px] text-text-muted border border-dark/20 rounded-full px-2 py-0.5">
                      {s.payment_deposit_pct}% deposit
                    </span>
                  )}
                  {s.payment_min_spend && (
                    <span className="text-[10px] text-text-muted border border-dark/20 rounded-full px-2 py-0.5">
                      £{s.payment_min_spend.toLocaleString()} min
                    </span>
                  )}
                  {s.payment_pay_ahead && (
                    <span className="text-[10px] text-text-muted border border-dark/20 rounded-full px-2 py-0.5">
                      Pay ahead
                    </span>
                  )}
                  {!s.payment_deposit_pct && !s.payment_min_spend && !s.payment_pay_ahead && (
                    <span className="text-[10px] text-text-muted">TBC</span>
                  )}
                </div>
              </div>
            ))}

            {/* CTA */}
            {spaces.map((s) => (
              <div key={`cta-${s.id}`}>
                {s.available ? (
                  <button
                    onClick={() => handleRequestProposal(s)}
                    disabled={loadingId === s.id}
                    className="w-full bg-primary border-2 border-dark text-dark font-bold uppercase text-[10px] tracking-widest py-2.5 rounded-xl hover:bg-secondary hover:text-white transition-colors disabled:opacity-60"
                  >
                    {loadingId === s.id ? 'Sending...' : 'Request proposal →'}
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-secondary uppercase tracking-wide">
                    Not available
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
