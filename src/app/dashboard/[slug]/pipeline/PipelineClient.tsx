'use client'

import { useState } from 'react'
import Link from 'next/link'

export type Stage = 'incoming' | 'awaiting_response' | 'in_negotiation' | 'confirmed' | 'declined'
export type EventType = 'Wedding' | 'Corporate' | 'Workshop' | 'Party' | 'Alumni dinner' | 'Birthday' | 'Exhibition' | 'Other'
type TimeView = '7' | '30' | '90'

export interface PipelineCard {
  conversation_id: string
  space_name: string
  event_date: string
  event_type: EventType
  headcount: number
  booker_budget_per_head: number
  booker_name: string
  status: Stage
  last_message_at: string
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  Wedding: '#FF2D9B',
  Corporate: '#CDEA2D',
  Workshop: '#60A5FA',
  Party: '#A78BFA',
  'Alumni dinner': '#34D399',
  Birthday: '#FB923C',
  Exhibition: '#F59E0B',
  Other: '#1A1A1A',
}

const STAGE_LABELS: Record<Stage, string> = {
  incoming: 'Incoming',
  awaiting_response: 'Awaiting Response',
  in_negotiation: 'In Negotiation',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

function getUrgencyColor(hoursWaiting: number): string {
  if (hoursWaiting >= 24) return '#FF6B6B'
  if (hoursWaiting >= 4) return '#FFD93D'
  return '#1A1A1A'
}

function getUrgencyLabel(hoursWaiting: number): string {
  if (hoursWaiting >= 48) return `${Math.floor(hoursWaiting / 24)} days`
  if (hoursWaiting >= 24) return '1 day'
  return `${Math.floor(hoursWaiting)} hours`
}

function formatEventDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function addDays(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

// ── Status update ────────────────────────────────────────────────────────────

async function updateStatus(conversationId: string, status: Stage) {
  await fetch(`/api/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

// ── Card ────────────────────────────────────────────────────────────────────

function Card({
  card,
  onStatusChange,
}: {
  card: PipelineCard
  onStatusChange: (id: string, status: Stage) => void
}) {
  const hoursWaiting = (Date.now() - new Date(card.last_message_at).getTime()) / 3600000
  const isIncoming = card.status === 'incoming'
  const accentColor = EVENT_TYPE_COLORS[card.event_type] ?? '#1A1A1A'
  const urgencyColor = isIncoming ? getUrgencyColor(hoursWaiting) : '#1A1A1A'
  const [moving, setMoving] = useState(false)

  const STAGES = Object.keys(STAGE_LABELS) as Stage[]

  async function handleMove(newStatus: Stage) {
    setMoving(true)
    onStatusChange(card.conversation_id, newStatus)
    await updateStatus(card.conversation_id, newStatus)
    setMoving(false)
  }

  return (
    <div
      className="bg-white border-2 border-dark rounded-xl p-4 relative overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 4 }}
    >
      {/* Booker name */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
        {card.booker_name}
      </p>

      {/* Event date */}
      <p className="font-display font-extrabold text-lg text-dark leading-none mb-1">
        {formatEventDate(card.event_date)}
      </p>

      {/* Headcount + event type */}
      <p className="text-sm font-semibold text-dark">
        {card.headcount} guests · {card.event_type}
      </p>

      {/* Space name */}
      <p className="text-xs text-text-muted mt-0.5">{card.space_name}</p>

      {/* Budget */}
      {card.booker_budget_per_head > 0 && (
        <p className="text-xs text-text-muted mt-0.5">
          £{card.booker_budget_per_head}/head budget
        </p>
      )}

      {/* Time waiting — incoming only */}
      {isIncoming && (
        <div className="flex items-center gap-1 mt-2">
          <span style={{ color: urgencyColor }} className="text-sm">⏰</span>
          <span className="text-[11px] font-bold" style={{ color: urgencyColor }}>
            {getUrgencyLabel(hoursWaiting)}
          </span>
        </div>
      )}

      {/* Actions row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href={`/conversations/${card.conversation_id}`}
          className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-secondary transition-colors"
        >
          View thread →
        </Link>

        {/* Move to next/prev stage */}
        <div className="flex gap-1">
          {card.status !== 'incoming' && card.status !== 'declined' && (
            <button
              disabled={moving}
              onClick={() => {
                const idx = STAGES.indexOf(card.status)
                if (idx > 0) handleMove(STAGES[idx - 1])
              }}
              className="text-[10px] px-1.5 py-0.5 border border-dark/30 rounded hover:border-dark transition-colors text-text-muted"
              title="Move back"
            >
              ←
            </button>
          )}
          {card.status !== 'confirmed' && card.status !== 'declined' && (
            <button
              disabled={moving}
              onClick={() => {
                const idx = STAGES.indexOf(card.status)
                if (idx < STAGES.length - 2) handleMove(STAGES[idx + 1])
              }}
              className="text-[10px] px-1.5 py-0.5 border border-dark/30 rounded hover:border-primary hover:bg-primary/20 transition-colors text-text-muted"
              title="Advance stage"
            >
              →
            </button>
          )}
          {card.status !== 'declined' && card.status !== 'confirmed' && (
            <button
              disabled={moving}
              onClick={() => handleMove('declined')}
              className="text-[10px] px-1.5 py-0.5 border border-dark/30 rounded hover:border-secondary hover:text-secondary transition-colors text-text-muted"
              title="Decline"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Column ───────────────────────────────────────────────────────────────────

function Column({
  stage,
  cards,
  onStatusChange,
}: {
  stage: Stage
  cards: PipelineCard[]
  onStatusChange: (id: string, status: Stage) => void
}) {
  const sorted = [...cards].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )

  let lastMonth = ''

  return (
    <div className="shrink-0 w-[300px] md:w-[320px]">
      <div className="bg-base border-2 border-dark rounded-t-xl px-4 py-3 flex items-center justify-between">
        <span className="font-display font-extrabold text-sm uppercase tracking-widest text-dark">
          {STAGE_LABELS[stage]}
        </span>
        <span className="bg-dark text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
          {cards.length}
        </span>
      </div>

      <div className="border-l-2 border-r-2 border-b-2 border-dark rounded-b-xl p-3 space-y-3 min-h-[200px] bg-base/30">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-xs font-medium uppercase tracking-wide">
            No requests
          </div>
        ) : (
          sorted.map((card) => {
            const month = new Date(card.event_date).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })
            const showSeparator = month !== lastMonth
            lastMonth = month

            return (
              <div key={card.conversation_id}>
                {showSeparator && (
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="flex-1 border-t border-dark/20" />
                    <span className="text-[10px] text-text-muted font-medium shrink-0">{month}</span>
                    <div className="flex-1 border-t border-dark/20" />
                  </div>
                )}
                <Card card={card} onStatusChange={onStatusChange} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  venueName: string
  slug: string
  cards: PipelineCard[]
  spaceNames: string[]
}

export default function PipelineClient({ venueName, slug, cards: initialCards, spaceNames }: Props) {
  const [cards, setCards] = useState<PipelineCard[]>(initialCards)
  const [spaceFilter, setSpaceFilter] = useState('All spaces')
  const [timeView, setTimeView] = useState<TimeView>('90')

  function handleStatusChange(conversationId: string, newStatus: Stage) {
    setCards((prev) =>
      prev.map((c) =>
        c.conversation_id === conversationId ? { ...c, status: newStatus } : c
      )
    )
  }

  const cutoff = addDays(parseInt(timeView))

  const filtered = cards.filter((c) => {
    const matchSpace = spaceFilter === 'All spaces' || c.space_name === spaceFilter
    const eventDate = new Date(c.event_date)
    const matchTime =
      c.status === 'declined' ||
      c.status === 'confirmed' ||
      eventDate <= cutoff
    return matchSpace && matchTime
  })

  const byStage = (stage: Stage) => filtered.filter((c) => c.status === stage)

  const stats = {
    incoming: byStage('incoming').length,
    in_negotiation: byStage('in_negotiation').length,
    confirmed: byStage('confirmed').length,
    declined: byStage('declined').length,
  }

  const allSpaces = ['All spaces', ...spaceNames]

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Pipeline</p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">{venueName}</h1>

        <div className="flex gap-4 mt-3 flex-wrap text-sm">
          <span><strong className="text-dark">{stats.incoming}</strong> <span className="text-text-muted">incoming</span></span>
          <span><strong className="text-dark">{stats.in_negotiation}</strong> <span className="text-text-muted">negotiating</span></span>
          <span><strong className="text-dark">{stats.confirmed}</strong> <span className="text-text-muted">confirmed</span></span>
          <span><strong className="text-secondary">{stats.declined}</strong> <span className="text-text-muted">declined</span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Space:</span>
          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="border-2 border-dark rounded-lg px-3 py-1.5 text-xs font-semibold text-dark bg-white focus:outline-none focus:border-primary appearance-none pr-8"
          >
            {allSpaces.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mr-1">Period:</span>
          {(['7', '30', '90'] as TimeView[]).map((v) => (
            <button
              key={v}
              onClick={() => setTimeView(v)}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-colors ${
                timeView === v
                  ? 'bg-primary border-dark text-dark'
                  : 'bg-white border-dark text-dark hover:bg-base-deep'
              }`}
            >
              {v === '7' ? '7 days' : v === '30' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-6" style={{ scrollbarWidth: 'thin' }}>
        {(['incoming', 'awaiting_response', 'in_negotiation', 'confirmed', 'declined'] as Stage[]).map(
          (stage) => (
            <Column
              key={stage}
              stage={stage}
              cards={byStage(stage)}
              onStatusChange={handleStatusChange}
            />
          )
        )}
      </div>
    </div>
  )
}
