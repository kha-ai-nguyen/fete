'use client'

import { useState } from 'react'
import type { Space } from '@/types'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export default function CalendarClient({ spaces }: { spaces: Space[] }) {
  const today = new Date()
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaces[0]?.id ?? '')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [loadingDate, setLoadingDate] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  async function toggleDate(day: number) {
    if (!selectedSpaceId) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setLoadingDate(dateStr)

    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ space_id: selectedSpaceId, date: dateStr }),
    })
    const json = await res.json()

    setBlocked((prev) => {
      const next = new Set(prev)
      if (json.blocked) next.add(dateStr)
      else next.delete(dateStr)
      return next
    })
    setLoadingDate(null)
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  if (spaces.length === 0) {
    return (
      <div className="bg-white border-2 border-dark rounded-2xl p-8 text-center">
        <p className="font-display font-bold text-xl uppercase text-dark mb-2">No spaces yet</p>
        <p className="text-text-muted text-sm">Add spaces first, then manage their availability here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Space selector */}
      {spaces.length > 1 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
            Space
          </label>
          <select
            value={selectedSpaceId}
            onChange={(e) => { setSelectedSpaceId(e.target.value); setBlocked(new Set()) }}
            className="border-2 border-dark rounded-xl px-4 py-2.5 bg-white text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white border-2 border-dark rounded-2xl p-6">
        {/* Month nav */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 border-2 border-dark rounded-lg font-bold hover:bg-base-deep transition-colors"
          >
            ‹
          </button>
          <span className="font-display font-bold text-lg uppercase flex-1 text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 border-2 border-dark rounded-lg font-bold hover:bg-base-deep transition-colors"
          >
            ›
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-text-muted py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isBlocked = blocked.has(dateStr)
            const isLoading = loadingDate === dateStr
            const isPast = new Date(dateStr) < new Date(today.toDateString())

            return (
              <button
                key={day}
                onClick={() => !isPast && toggleDate(day)}
                disabled={isPast || isLoading}
                className={`aspect-square rounded-lg border-2 text-sm font-medium transition-colors ${
                  isLoading
                    ? 'border-dark/30 bg-base-deep animate-pulse'
                    : isBlocked
                    ? 'border-dark bg-dark text-white hover:bg-secondary hover:border-secondary'
                    : isPast
                    ? 'border-dark/20 text-dark/30 cursor-not-allowed'
                    : 'border-dark/30 bg-white hover:bg-primary hover:border-primary'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-text-muted mt-4">
          Dark = blocked. Click to toggle. Changes save immediately.
        </p>
      </div>

      {/* Google Calendar CTA (placeholder) */}
      <div className="bg-white border-2 border-dark/30 rounded-2xl p-5 flex items-center gap-3 opacity-60">
        <span className="text-2xl">📅</span>
        <div>
          <p className="font-semibold text-sm text-dark">Sync Google Calendar</p>
          <p className="text-xs text-text-muted">Connect your calendar to auto-block busy dates. Coming in Phase 2.</p>
        </div>
        <span className="ml-auto text-xs font-bold uppercase tracking-widest text-text-muted bg-base px-3 py-1.5 rounded-lg border border-dark/20">
          Soon
        </span>
      </div>
    </div>
  )
}
