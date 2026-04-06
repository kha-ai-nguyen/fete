'use client'

import { useState } from 'react'
import { ExtractedVenueData, ExtractedSpace } from '@/types'

type Props = {
  data: ExtractedVenueData
  slug: string
  onSaved: () => void
  onReset: () => void
}

function emptySpace(): ExtractedSpace {
  return {
    name: '',
    capacity: null,
    base_price: null,
    min_spend: null,
    payment_deposit_pct: null,
    payment_pay_ahead: false,
    photos: [],
    description: null,
  }
}

export default function ExtractedDataReview({ data, slug, onSaved, onReset }: Props) {
  const [venueFields, setVenueFields] = useState({
    venue_name: data.venue_name ?? '',
    venue_description: data.venue_description ?? '',
    contact_email: data.contact_email ?? '',
    contact_phone: data.contact_phone ?? '',
  })
  const [spaces, setSpaces] = useState<ExtractedSpace[]>(
    data.spaces?.length ? data.spaces : [emptySpace()]
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateVenue(field: string, value: string) {
    setVenueFields((prev) => ({ ...prev, [field]: value }))
  }

  function updateSpace(index: number, field: keyof ExtractedSpace, value: unknown) {
    setSpaces((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  function deleteSpace(index: number) {
    setSpaces((prev) => prev.filter((_, i) => i !== index))
  }

  function addSpace() {
    setSpaces((prev) => [...prev, emptySpace()])
  }

  async function handleSave() {
    setError(null)
    setIsSaving(true)
    try {
      const res = await fetch(`/api/venues/${slug}/update-spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_update: {
            name: venueFields.venue_name || undefined,
            description: venueFields.venue_description || undefined,
          },
          spaces,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Failed to save. Please try again.')
        return
      }
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Venue-level fields */}
      <div className="bg-white border-2 border-dark rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg uppercase text-dark">Venue details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
              Venue name
            </label>
            <input
              type="text"
              value={venueFields.venue_name}
              onChange={(e) => updateVenue('venue_name', e.target.value)}
              className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
              Contact email
            </label>
            <input
              type="email"
              value={venueFields.contact_email}
              onChange={(e) => updateVenue('contact_email', e.target.value)}
              className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
              Contact phone
            </label>
            <input
              type="text"
              value={venueFields.contact_phone}
              onChange={(e) => updateVenue('contact_phone', e.target.value)}
              className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
              Description
            </label>
            <textarea
              value={venueFields.venue_description}
              onChange={(e) => updateVenue('venue_description', e.target.value)}
              rows={3}
              className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Spaces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg uppercase text-dark">
            Spaces ({spaces.length})
          </h2>
          <button
            onClick={addSpace}
            className="text-xs font-bold uppercase tracking-widest text-dark border-2 border-dark rounded-lg px-3 py-1.5 hover:bg-base-deep transition-colors"
          >
            + Add space
          </button>
        </div>

        {spaces.map((space, i) => (
          <div key={i} className="bg-white border-2 border-dark rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-dark text-sm uppercase tracking-widest">
                Space {i + 1}
              </h3>
              <button
                onClick={() => deleteSpace(i)}
                className="text-text-muted hover:text-secondary transition-colors"
                aria-label="Delete space"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Space name
                </label>
                <input
                  type="text"
                  value={space.name}
                  onChange={(e) => updateSpace(i, 'name', e.target.value)}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Capacity (guests)
                </label>
                <input
                  type="number"
                  value={space.capacity ?? ''}
                  onChange={(e) => updateSpace(i, 'capacity', e.target.value ? Number(e.target.value) : null)}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Price per head (£)
                </label>
                <input
                  type="number"
                  value={space.base_price ?? ''}
                  onChange={(e) => updateSpace(i, 'base_price', e.target.value ? Number(e.target.value) : null)}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Min spend (£)
                </label>
                <input
                  type="number"
                  value={space.min_spend ?? ''}
                  onChange={(e) => updateSpace(i, 'min_spend', e.target.value ? Number(e.target.value) : null)}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Deposit (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={space.payment_deposit_pct ?? ''}
                  onChange={(e) => updateSpace(i, 'payment_deposit_pct', e.target.value ? Number(e.target.value) : null)}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  id={`pay-ahead-${i}`}
                  type="checkbox"
                  checked={space.payment_pay_ahead}
                  onChange={(e) => updateSpace(i, 'payment_pay_ahead', e.target.checked)}
                  className="w-4 h-4 border-2 border-dark rounded accent-primary"
                />
                <label htmlFor={`pay-ahead-${i}`} className="text-xs font-bold uppercase tracking-widest text-text-muted cursor-pointer">
                  Pay in advance
                </label>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                  Description
                </label>
                <textarea
                  value={space.description ?? ''}
                  onChange={(e) => updateSpace(i, 'description', e.target.value || null)}
                  rows={2}
                  className="w-full border-2 border-dark rounded-xl px-3 py-2 text-sm bg-base/30 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-white border-2 border-secondary rounded-xl px-4 py-3 text-sm text-dark">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-primary border-2 border-dark rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-dark hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : 'Confirm & save'}
        </button>
        <button
          onClick={onReset}
          disabled={isSaving}
          className="border-2 border-dark rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-dark hover:bg-base-deep transition-colors disabled:opacity-50"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
