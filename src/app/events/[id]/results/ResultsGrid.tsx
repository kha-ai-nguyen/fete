'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import SpaceRow from '@/components/SpaceRow'
import ComparisonBar from '@/components/ComparisonBar'
import ComparisonPanel from '@/components/ComparisonPanel'
import ResultsToolbar, { type SortKey } from './ResultsToolbar'
import type { ResultSpace } from './mockSpaces'
import type { BookerEvent } from '@/types'

function sortSpaces(spaces: ResultSpace[], key: SortKey): ResultSpace[] {
  return [...spaces].sort((a, b) => {
    if (key === 'distance') return a.distance_km - b.distance_km
    if (key === 'price_asc') return a.total_price - b.total_price
    if (key === 'price_desc') return b.total_price - a.total_price
    return a.venue.name.localeCompare(b.venue.name)
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

  // Comparison state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showComparison, setShowComparison] = useState(false)

  // Scroll-active row detection
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())

  const sorted = sortSpaces(spaces, sort)
  const available = sorted.filter((s) => s.available)
  const unavailable = sorted.filter((s) => !s.available)
  const allSorted = [...available, ...unavailable]

  // Setup IntersectionObserver for scroll-active detection (desktop only)
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    if (isTouch) return

    const callback: IntersectionObserverCallback = (entries) => {
      let bestEntry: IntersectionObserverEntry | null = null
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry
          }
        }
      }
      if (bestEntry) {
        const id = bestEntry.target.getAttribute('data-space-id')
        if (id) setActiveId(id)
      }
    }

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '-30% 0px -30% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    })

    // Observe all currently registered rows
    rowRefs.current.forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [allSorted.length])

  // Ref callback for each row
  const registerRow = useCallback((el: HTMLDivElement | null, spaceId: string) => {
    if (el) {
      rowRefs.current.set(spaceId, el)
      observerRef.current?.observe(el)
    } else {
      const prev = rowRefs.current.get(spaceId)
      if (prev) observerRef.current?.unobserve(prev)
      rowRefs.current.delete(spaceId)
    }
  }, [])

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }

  function applyDates() {
    const params = new URLSearchParams()
    if (localDateFrom) params.set('dateFrom', localDateFrom)
    if (localDateTo) params.set('dateTo', localDateTo)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div>
      <ResultsToolbar
        event={event}
        sort={sort}
        onSortChange={setSort}
        dateFrom={localDateFrom}
        dateTo={localDateTo}
        onDateFromChange={setLocalDateFrom}
        onDateToChange={setLocalDateTo}
        onApplyDates={applyDates}
        totalCount={spaces.length}
        availableCount={available.length}
        unavailableCount={unavailable.length}
      />

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

      {/* Space rows */}
      <div className="space-y-6">
        {allSorted.map((space, i) => (
          <SpaceRow
            key={space.id}
            ref={(el) => registerRow(el, space.id)}
            space={space}
            eventId={event.id}
            isActive={activeId === space.id}
            isSelected={selectedIds.has(space.id)}
            onToggleSelect={handleToggleSelect}
            index={i}
          />
        ))}
      </div>

      {/* Comparison bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <ComparisonBar
            count={selectedIds.size}
            onCompare={() => setShowComparison(true)}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
      </AnimatePresence>

      {/* Comparison panel */}
      <AnimatePresence>
        {showComparison && (
          <ComparisonPanel
            spaces={allSorted.filter((s) => selectedIds.has(s.id))}
            onClose={() => setShowComparison(false)}
            eventId={event.id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
