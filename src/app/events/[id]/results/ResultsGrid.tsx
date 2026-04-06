'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ResultsRow, { type ResultSpace } from '@/components/ResultsRow'
import type { BookerEvent } from '@/types'

type SortKey = 'distance' | 'price_asc' | 'price_desc' | 'alpha'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'alpha', label: 'A–Z' },
]

function sortSpaces(spaces: ResultSpace[], key: SortKey): ResultSpace[] {
  return [...spaces].sort((a, b) => {
    if (key === 'distance') return a.distance_km - b.distance_km
    if (key === 'price_asc') return a.total_price - b.total_price
    if (key === 'price_desc') return b.total_price - a.total_price
    return a.venue.name.localeCompare(b.venue.name)
  })
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  spaces: ResultSpace[]
  event: BookerEvent
  dateFrom: string | null
  dateTo: string | null
}

export default function ResultsGrid({ spaces, event, dateFrom, dateTo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [sort, setSort] = useState<SortKey>('distance')
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom ?? event.date_from ?? '')
  const [localDateTo, setLocalDateTo] = useState(dateTo ?? event.date_to ?? '')
  const [, startTransition] = useTransition()

  const sorted = sortSpaces(spaces, sort)
  const available = sorted.filter((s) => s.available)
  const unavailable = sorted.filter((s) => !s.available)

  function applyDates() {
    const params = new URLSearchParams()
    if (localDateFrom) params.set('dateFrom', localDateFrom)
    if (localDateTo) params.set('dateTo', localDateTo)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const effectiveFrom = dateFrom ?? event.date_from
  const effectiveTo = dateTo ?? event.date_to

  const dateLabel =
    effectiveFrom && effectiveTo
      ? `${formatDate(effectiveFrom)} – ${formatDate(effectiveTo)}`
      : effectiveFrom
      ? formatDate(effectiveFrom)
      : 'Flexible dates'

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-14 z-30 bg-white border-2 border-dark rounded-2xl shadow-[4px_4px_0_#1A1A1A] mb-8 overflow-hidden">
        {/* Event summary bar */}
        <div className="px-5 py-3 border-b-2 border-dark flex items-center gap-4 flex-wrap bg-dark">
          <span className="font-display font-extrabold uppercase text-primary text-sm tracking-widest">
            {event.event_type}
          </span>
          <span className="text-white/70 text-sm">{event.headcount} guests</span>
          {event.budget_per_head_max && (
            <span className="text-white/70 text-sm">£{event.budget_per_head_max}/head budget</span>
          )}
          {event.postcode && (
            <span className="text-white/70 text-sm font-mono">{event.postcode} · {event.radius_km}km</span>
          )}
          <span className="text-white/70 text-sm">{dateLabel}</span>
        </div>

        {/* Controls row */}
        <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mr-1">Sort:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  sort === key
                    ? 'bg-primary border-dark text-dark'
                    : 'bg-white border-dark text-dark hover:bg-base-deep'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date change */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Dates:</span>
            <input
              type="date"
              value={localDateFrom}
              onChange={(e) => setLocalDateFrom(e.target.value)}
              className="border-2 border-dark rounded-lg px-2 py-1 text-xs font-mono text-dark bg-white focus:outline-none focus:border-primary"
            />
            <span className="text-text-muted text-xs">–</span>
            <input
              type="date"
              value={localDateTo}
              onChange={(e) => setLocalDateTo(e.target.value)}
              className="border-2 border-dark rounded-lg px-2 py-1 text-xs font-mono text-dark bg-white focus:outline-none focus:border-primary"
            />
            <button
              onClick={applyDates}
              className="bg-dark text-primary text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-secondary hover:text-white transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-5">
        <p className="text-sm text-text-muted">
          <strong className="text-dark">{available.length}</strong> space{available.length !== 1 ? 's' : ''} available
          {unavailable.length > 0 && (
            <span> · <span className="text-secondary">{unavailable.length} unavailable</span></span>
          )}
        </p>
      </div>

      {/* No results */}
      {spaces.length === 0 && (
        <div className="text-center py-24 border-2 border-dark border-dashed rounded-2xl">
          <p className="font-display font-bold text-2xl uppercase text-dark mb-3">
            No spaces match your criteria
          </p>
          <p className="text-text-muted text-sm mb-6">
            Try expanding your radius or changing your dates.
          </p>
          <a
            href={`/events/${event.id}`}
            className="inline-block bg-primary border-2 border-dark text-dark font-bold uppercase text-sm px-6 py-3 rounded-xl hover:bg-dark hover:text-primary transition-colors"
          >
            ← Back to event
          </a>
        </div>
      )}

      {/* Available spaces */}
      <div className="space-y-6">
        {available.map((space) => (
          <ResultsRow key={space.id} space={space} eventId={event.id} />
        ))}
      </div>

      {/* Unavailable spaces */}
      {unavailable.length > 0 && (
        <>
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 border-t-2 border-dark/20" />
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Not available on these dates
            </span>
            <div className="flex-1 border-t-2 border-dark/20" />
          </div>
          <div className="space-y-6">
            {unavailable.map((space) => (
              <ResultsRow
                key={space.id}
                space={space}
                eventId={event.id}
                unavailableReason="Not available on these dates"
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
