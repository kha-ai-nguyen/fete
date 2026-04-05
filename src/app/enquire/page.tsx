'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const EVENT_TYPES = ['Workshop', 'Wedding', 'Corporate', 'Party', 'Exhibition'] as const

interface VenueBasic {
  id: string
  name: string
  slug: string
  neighbourhood: string
}

function EnquireForm() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('venue')

  const [venue, setVenue] = useState<VenueBasic | null>(null)
  const [venueLoading, setVenueLoading] = useState(!!slug)

  // Form state
  const [venueName, setVenueName] = useState('')
  const [venueEmail, setVenueEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [headcount, setHeadcount] = useState('')
  const [pricePerHead, setPricePerHead] = useState('')
  const [eventType, setEventType] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Today's date as YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split('T')[0]

  // Fetch venue by slug if provided
  useEffect(() => {
    if (!slug) return
    setVenueLoading(true)
    fetch(`/api/venue-by-slug?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VenueBasic | null) => {
        if (data) {
          setVenue(data)
          setVenueName(data.name)
        }
      })
      .catch(() => null)
      .finally(() => setVenueLoading(false))
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: venue?.id ?? null,
          venueName,
          venueEmail,
          eventDate,
          headcount: parseInt(headcount),
          pricePerHead: pricePerHead ? parseInt(pricePerHead) : null,
          eventType,
          notes: notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setConversationId(data.conversationId ?? null)
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border-2 border-dark p-8 shadow-[4px_4px_0_#1A1A1A] text-center">
        <div className="w-12 h-12 bg-primary border-2 border-dark rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-2">
          Enquiry sent!
        </h2>
        <p className="text-text-muted font-medium mb-6">
          Your enquiry has been sent to{' '}
          <span className="text-dark font-semibold">{venueName}</span>.
          They&apos;ll be in touch directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {conversationId && (
            <Link
              href={`/conversations/${conversationId}`}
              className="inline-block px-6 py-3 bg-primary border-2 border-dark font-bold uppercase text-[10px] tracking-widest text-dark shadow-[2px_2px_0_#1A1A1A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              View conversation →
            </Link>
          )}
          {slug && (
            <Link
              href={`/venues/${slug}`}
              className="inline-block px-6 py-3 bg-white border-2 border-dark font-bold uppercase text-[10px] tracking-widest text-dark shadow-[2px_2px_0_#1A1A1A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              View venue
            </Link>
          )}
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full bg-white border-2 border-dark rounded-md px-4 py-3 text-dark font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-shadow'
  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-dark mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Venue name */}
      <div>
        <label className={labelClass}>Venue name <span className="text-secondary">*</span></label>
        <input
          type="text"
          required
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          disabled={venueLoading}
          placeholder="e.g. The Curtain Hotel"
          className={inputClass}
        />
      </div>

      {/* Venue email */}
      <div>
        <label className={labelClass}>Venue contact email <span className="text-secondary">*</span></label>
        <input
          type="email"
          required
          value={venueEmail}
          onChange={(e) => setVenueEmail(e.target.value)}
          placeholder="events@venue.co.uk"
          className={inputClass}
        />
      </div>

      {/* Event date */}
      <div>
        <label className={labelClass}>Event date <span className="text-secondary">*</span></label>
        <input
          type="date"
          required
          min={today}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Headcount + price side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Number of guests <span className="text-secondary">*</span></label>
          <input
            type="number"
            required
            min={1}
            value={headcount}
            onChange={(e) => setHeadcount(e.target.value)}
            placeholder="50"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Budget per person</label>
          <input
            type="number"
            min={1}
            value={pricePerHead}
            onChange={(e) => setPricePerHead(e.target.value)}
            placeholder="£ per person"
            className={inputClass}
          />
        </div>
      </div>

      {/* Event type */}
      <div>
        <label className={labelClass}>Event type <span className="text-secondary">*</span></label>
        <div className="relative">
          <select
            required
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={`${inputClass} appearance-none pr-10 cursor-pointer`}
          >
            <option value="">Select event type…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requirements, dietary needs..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-secondary font-semibold text-sm border-2 border-secondary bg-white px-4 py-3 rounded-md">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary border-2 border-dark font-bold uppercase tracking-widest text-[11px] text-dark py-4 shadow-[4px_4px_0_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_#1A1A1A]"
      >
        {submitting ? 'Sending…' : 'Send enquiry →'}
      </button>
    </form>
  )
}

export default function EnquirePage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-dark hover:text-secondary transition-colors mb-8"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M7 3L4 6L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase text-dark leading-none mb-2">
            Send an enquiry
          </h1>
          <p className="text-text-muted font-medium">
            Your message will be sent directly to the venue.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-dark p-6 shadow-[4px_4px_0_#1A1A1A]">
          <Suspense fallback={
            <div className="space-y-5 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-base rounded-md" />
              ))}
            </div>
          }>
            <EnquireForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
