'use client'

import type { Enquiry } from '@/types'

interface Props {
  enquiries: Enquiry[]
}

function statLabel(label: string, value: string | number) {
  return (
    <div className="flex-1 border-2 border-[#1A1A1A] bg-white p-4">
      <p className="text-xs font-bold uppercase text-[#6B5068] mb-1">{label}</p>
      <p className="font-display font-extrabold text-2xl text-[#1A1A1A]">{value}</p>
    </div>
  )
}

function getMostCommonEventType(enquiries: Enquiry[]): string {
  if (enquiries.length === 0) return '—'
  const counts: Record<string, number> = {}
  for (const e of enquiries) {
    counts[e.event_type] = (counts[e.event_type] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function thisMonthCount(enquiries: Enquiry[]): number {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  return enquiries.filter(e => e.sent_at >= startOfMonth).length
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const EVENT_TYPE_COLOURS: Record<string, string> = {
  Workshop: 'bg-blue-100 text-blue-800',
  Wedding: 'bg-pink-100 text-pink-800',
  Corporate: 'bg-gray-100 text-gray-800',
  Party: 'bg-yellow-100 text-yellow-800',
  Exhibition: 'bg-purple-100 text-purple-800',
}

export default function DashboardEnquiries({ enquiries }: Props) {
  const total = enquiries.length
  const monthly = thisMonthCount(enquiries)
  const topType = getMostCommonEventType(enquiries)

  return (
    <div>
      <h2 className="font-display font-extrabold uppercase text-xl text-[#1A1A1A] mb-6">
        Enquiries
      </h2>

      {/* Stats bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {statLabel('Total enquiries', total)}
        {statLabel('This month', monthly)}
        {statLabel('Top event type', topType)}
      </div>

      {/* Enquiry list */}
      {enquiries.length === 0 ? (
        <div className="border-2 border-[#1A1A1A] bg-white p-8 text-center">
          <p className="text-[#6B5068] text-sm">No enquiries yet.</p>
        </div>
      ) : (
        <div className="border-2 border-[#1A1A1A] bg-white divide-y-2 divide-[#1A1A1A]">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1fr_80px_120px_120px_1fr] gap-3 px-4 py-2 bg-[#E0C5DA]">
            <span className="text-xs font-bold uppercase text-[#6B5068]">Event type</span>
            <span className="text-xs font-bold uppercase text-[#6B5068]">Guests</span>
            <span className="text-xs font-bold uppercase text-[#6B5068]">Event date</span>
            <span className="text-xs font-bold uppercase text-[#6B5068]">Sent</span>
            <span className="text-xs font-bold uppercase text-[#6B5068]">Notes</span>
          </div>

          {enquiries.map(enquiry => (
            <div
              key={enquiry.id}
              className="px-4 py-3 flex flex-col md:grid md:grid-cols-[1fr_80px_120px_120px_1fr] gap-2 md:gap-3 md:items-center"
            >
              {/* Event type badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-sm w-fit ${
                  EVENT_TYPE_COLOURS[enquiry.event_type] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {enquiry.event_type}
              </span>

              {/* Headcount */}
              <span className="text-sm text-[#1A1A1A]">
                <span className="md:hidden text-[#6B5068] text-xs font-bold uppercase mr-1">Guests:</span>
                {enquiry.headcount}
              </span>

              {/* Event date */}
              <span className="text-sm text-[#1A1A1A]">
                <span className="md:hidden text-[#6B5068] text-xs font-bold uppercase mr-1">Date:</span>
                {formatDate(enquiry.event_date)}
              </span>

              {/* Sent at */}
              <span className="text-sm text-[#6B5068]">
                <span className="md:hidden text-[#6B5068] text-xs font-bold uppercase mr-1">Sent:</span>
                {formatDate(enquiry.sent_at)}
              </span>

              {/* Notes */}
              <span className="text-sm text-[#6B5068] truncate">
                {enquiry.notes ?? <span className="italic text-[#6B5068]/60">—</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
