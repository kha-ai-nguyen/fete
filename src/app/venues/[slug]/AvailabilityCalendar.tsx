'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  blockedDates: string[] // ['2026-04-15', '2026-04-20']
  editable?: boolean
  venueId?: string
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function AvailabilityCalendar({ blockedDates, editable = false, venueId }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  // Inline form state for editable mode
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [blocked, setBlocked] = useState<Set<string>>(new Set(blockedDates))

  const todayYMD = toYMD(now)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Monday-first: getDay() returns 0=Sun...6=Sat, convert to 0=Mon...6=Sun
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // 0=Mon

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  async function handleDayClick(dayNum: number) {
    if (!editable) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const isPast = dateStr < todayYMD
    if (isPast) return

    if (blocked.has(dateStr)) {
      // DELETE block
      try {
        await fetch('/api/availability', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ venueId, date: dateStr }),
        })
        setBlocked(prev => { const next = new Set(prev); next.delete(dateStr); return next })
      } catch (err) {
        console.error('Failed to delete block', err)
      }
    } else {
      // Show inline note form
      setPendingDate(dateStr)
      setNoteValue('')
    }
  }

  async function confirmBlock() {
    if (!pendingDate) return
    try {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, date: pendingDate, note: noteValue }),
      })
      setBlocked(prev => new Set([...prev, pendingDate]))
    } catch (err) {
      console.error('Failed to add block', err)
    }
    setPendingDate(null)
    setNoteValue('')
  }

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="border-2 border-[#1A1A1A] w-8 h-8 flex items-center justify-center hover:bg-[#CDEA2D] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display font-extrabold uppercase text-sm text-[#1A1A1A]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="border-2 border-[#1A1A1A] w-8 h-8 flex items-center justify-center hover:bg-[#CDEA2D] transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase text-[#6B5068]">
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`blank-${i}`} />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const isBlocked = blocked.has(dateStr)
          const isToday = dateStr === todayYMD
          const isPast = dateStr < todayYMD

          let cellClass = 'w-full aspect-square flex items-center justify-center text-xs rounded-sm border transition-colors '

          if (isBlocked) {
            cellClass += 'bg-[#FF2D9B] text-white border-[#FF2D9B] '
          } else if (isToday) {
            cellClass += 'bg-white border-gray-200 ring-2 ring-[#CDEA2D] font-bold '
          } else {
            cellClass += 'bg-white border-gray-200 '
          }

          if (isPast) cellClass += 'opacity-40 cursor-default '
          else if (editable && !isBlocked) cellClass += 'cursor-pointer hover:bg-[#CDEA2D]/20 '
          else if (editable && isBlocked) cellClass += 'cursor-pointer hover:opacity-80 '

          return (
            <button
              key={dateStr}
              className={cellClass}
              onClick={() => handleDayClick(dayNum)}
              disabled={!editable || isPast}
              aria-label={dateStr}
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      {/* Inline note form for editable mode */}
      {editable && pendingDate && (
        <div className="border-2 border-[#1A1A1A] bg-white p-3 space-y-2 mt-2">
          <p className="text-xs font-bold uppercase text-[#1A1A1A]">
            Block {pendingDate}
          </p>
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={noteValue}
            onChange={e => setNoteValue(e.target.value)}
            className="w-full border-2 border-[#1A1A1A] px-2 py-1 text-sm outline-none focus:border-[#CDEA2D]"
          />
          <div className="flex gap-2">
            <button
              onClick={confirmBlock}
              className="bg-[#CDEA2D] border-2 border-[#1A1A1A] px-3 py-1 text-xs font-bold uppercase hover:opacity-90 transition-opacity"
            >
              Block date
            </button>
            <button
              onClick={() => setPendingDate(null)}
              className="border-2 border-[#1A1A1A] px-3 py-1 text-xs font-bold uppercase hover:bg-[#CDEA2D]/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
