'use client'

import { useState } from 'react'
import type { BookerEvent } from '@/types'

export type SortKey = 'distance' | 'price_asc' | 'price_desc' | 'alpha'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'alpha', label: 'A–Z' },
]

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  event: BookerEvent
  sort: SortKey
  onSortChange: (key: SortKey) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onApplyDates: () => void
  totalCount: number
  availableCount: number
  unavailableCount: number
}

export default function ResultsToolbar({
  event,
  sort,
  onSortChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyDates,
  totalCount,
  availableCount,
  unavailableCount,
}: Props) {
  const [datesExpanded, setDatesExpanded] = useState(false)

  const effectiveFrom = dateFrom || event.date_from
  const effectiveTo = dateTo || event.date_to
  const dateLabel =
    effectiveFrom && effectiveTo
      ? `${formatDate(effectiveFrom)} – ${formatDate(effectiveTo)}`
      : effectiveFrom
        ? formatDate(effectiveFrom)
        : 'Flexible'

  return (
    <div className="sticky top-14 z-30 mb-6">
      {/* Event summary bar */}
      <div className="bg-dark rounded-t-2xl border-2 border-dark px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="font-display font-extrabold uppercase text-primary text-sm tracking-widest">
          {event.event_type}
        </span>
        <span className="text-white/70 text-sm">{event.headcount} guests</span>
        {event.budget_per_head_max && (
          <span className="text-white/70 text-sm">£{event.budget_per_head_max}/head</span>
        )}
        {event.postcode && (
          <span className="text-white/70 text-sm font-mono">
            {event.postcode} · {event.radius_km}km
          </span>
        )}
        {/* Results count badge */}
        <span className="ml-auto flex items-center gap-3">
          <span className="text-white/40 text-[10px] uppercase tracking-widest hidden sm:inline">
            Tick spaces to compare
          </span>
          <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
            {totalCount} spaces
          </span>
        </span>
      </div>

      {/* Controls row */}
      <div className="bg-white border-2 border-t-0 border-dark rounded-b-2xl shadow-[4px_4px_0_#1A1A1A] px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onSortChange(key)}
                className={`shrink-0 px-3 py-1.5 rounded-full border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  sort === key
                    ? 'bg-primary border-dark text-dark shadow-[2px_2px_0_#1A1A1A]'
                    : 'bg-white border-dark/30 text-dark hover:border-dark hover:bg-base'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Date pill */}
          <button
            onClick={() => setDatesExpanded(!datesExpanded)}
            className="shrink-0 px-3 py-1.5 rounded-full border-2 border-dark/30 text-[10px] font-bold uppercase tracking-widest text-dark hover:border-dark hover:bg-base transition-all"
          >
            {dateLabel}
          </button>

          {/* Availability count */}
          {unavailableCount > 0 && (
            <span className="text-[10px] text-secondary font-bold">
              {unavailableCount} unavail.
            </span>
          )}
        </div>

        {/* Expanded date picker */}
        {datesExpanded && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark/10">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="border-2 border-dark rounded-lg px-2 py-1.5 text-xs font-mono text-dark bg-white focus:outline-none focus:border-primary"
            />
            <span className="text-text-muted text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="border-2 border-dark rounded-lg px-2 py-1.5 text-xs font-mono text-dark bg-white focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => { onApplyDates(); setDatesExpanded(false) }}
              className="bg-dark text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-secondary hover:text-white transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
