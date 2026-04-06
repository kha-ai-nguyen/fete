'use client'

import { useState } from 'react'
import Link from 'next/link'

type Stage = 'incoming' | 'awaiting_response' | 'in_negotiation' | 'confirmed' | 'declined'
type EventType = 'Wedding' | 'Corporate' | 'Workshop' | 'Party' | 'Alumni dinner' | 'Birthday' | 'Other'
type TimeView = '7' | '30' | '90'

interface ProposalCard {
  proposal_id: string
  conversation_id: string
  space_name: string
  event_date: string
  event_type: EventType
  headcount: number
  booker_budget_per_head: number
  status: Stage
  last_message_at: string
  time_waiting?: string
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  Wedding: '#FF2D9B',
  Corporate: '#CDEA2D',
  Workshop: '#60A5FA',
  Party: '#A78BFA',
  'Alumni dinner': '#34D399',
  Birthday: '#FB923C',
  Other: '#1A1A1A',
}

const STAGE_LABELS: Record<Stage, string> = {
  incoming: 'Incoming',
  awaiting_response: 'Awaiting Response',
  in_negotiation: 'In Negotiation',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

// Fake data — 18 proposals across all stages
const FAKE_PROPOSALS: ProposalCard[] = [
  // INCOMING
  { proposal_id: 'p1', conversation_id: 'conv-fake-1', space_name: 'Private Dining Room', event_date: '2026-05-15', event_type: 'Wedding', headcount: 60, booker_budget_per_head: 85, status: 'incoming', last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(), time_waiting: '2 hours' },
  { proposal_id: 'p2', conversation_id: 'conv-fake-2', space_name: 'Garden Room', event_date: '2026-05-22', event_type: 'Corporate', headcount: 30, booker_budget_per_head: 55, status: 'incoming', last_message_at: new Date(Date.now() - 5 * 3600000).toISOString(), time_waiting: '5 hours' },
  { proposal_id: 'p3', conversation_id: 'conv-fake-3', space_name: 'Private Dining Room', event_date: '2026-06-01', event_type: 'Birthday', headcount: 20, booker_budget_per_head: 70, status: 'incoming', last_message_at: new Date(Date.now() - 14 * 3600000).toISOString(), time_waiting: '14 hours' },
  { proposal_id: 'p4', conversation_id: 'conv-fake-4', space_name: 'Mezzanine', event_date: '2026-06-08', event_type: 'Alumni dinner', headcount: 45, booker_budget_per_head: 65, status: 'incoming', last_message_at: new Date(Date.now() - 27 * 3600000).toISOString(), time_waiting: '1 day' },
  // AWAITING RESPONSE
  { proposal_id: 'p5', conversation_id: 'conv-fake-5', space_name: 'Garden Room', event_date: '2026-05-18', event_type: 'Workshop', headcount: 25, booker_budget_per_head: 40, status: 'awaiting_response', last_message_at: new Date(Date.now() - 48 * 3600000).toISOString() },
  { proposal_id: 'p6', conversation_id: 'conv-fake-6', space_name: 'Private Dining Room', event_date: '2026-05-28', event_type: 'Corporate', headcount: 50, booker_budget_per_head: 80, status: 'awaiting_response', last_message_at: new Date(Date.now() - 72 * 3600000).toISOString() },
  { proposal_id: 'p7', conversation_id: 'conv-fake-7', space_name: 'Mezzanine', event_date: '2026-06-14', event_type: 'Party', headcount: 80, booker_budget_per_head: 50, status: 'awaiting_response', last_message_at: new Date(Date.now() - 36 * 3600000).toISOString() },
  // IN NEGOTIATION
  { proposal_id: 'p8', conversation_id: 'conv-fake-8', space_name: 'Private Dining Room', event_date: '2026-05-10', event_type: 'Wedding', headcount: 55, booker_budget_per_head: 90, status: 'in_negotiation', last_message_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { proposal_id: 'p9', conversation_id: 'conv-fake-9', space_name: 'Garden Room', event_date: '2026-05-25', event_type: 'Birthday', headcount: 35, booker_budget_per_head: 60, status: 'in_negotiation', last_message_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { proposal_id: 'p10', conversation_id: 'conv-fake-10', space_name: 'Mezzanine', event_date: '2026-06-03', event_type: 'Corporate', headcount: 70, booker_budget_per_head: 75, status: 'in_negotiation', last_message_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { proposal_id: 'p11', conversation_id: 'conv-fake-11', space_name: 'Private Dining Room', event_date: '2026-06-20', event_type: 'Alumni dinner', headcount: 40, booker_budget_per_head: 65, status: 'in_negotiation', last_message_at: new Date(Date.now() - 18 * 3600000).toISOString() },
  { proposal_id: 'p12', conversation_id: 'conv-fake-12', space_name: 'Garden Room', event_date: '2026-07-04', event_type: 'Workshop', headcount: 20, booker_budget_per_head: 45, status: 'in_negotiation', last_message_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  // CONFIRMED
  { proposal_id: 'p13', conversation_id: 'conv-fake-13', space_name: 'Private Dining Room', event_date: '2026-04-18', event_type: 'Corporate', headcount: 45, booker_budget_per_head: 75, status: 'confirmed', last_message_at: new Date(Date.now() - 96 * 3600000).toISOString() },
  { proposal_id: 'p14', conversation_id: 'conv-fake-14', space_name: 'Mezzanine', event_date: '2026-04-26', event_type: 'Wedding', headcount: 70, booker_budget_per_head: 95, status: 'confirmed', last_message_at: new Date(Date.now() - 120 * 3600000).toISOString() },
  { proposal_id: 'p15', conversation_id: 'conv-fake-15', space_name: 'Garden Room', event_date: '2026-05-05', event_type: 'Birthday', headcount: 25, booker_budget_per_head: 60, status: 'confirmed', last_message_at: new Date(Date.now() - 144 * 3600000).toISOString() },
  // DECLINED
  { proposal_id: 'p16', conversation_id: 'conv-fake-16', space_name: 'Mezzanine', event_date: '2026-04-12', event_type: 'Party', headcount: 100, booker_budget_per_head: 35, status: 'declined', last_message_at: new Date(Date.now() - 168 * 3600000).toISOString() },
  { proposal_id: 'p17', conversation_id: 'conv-fake-17', space_name: 'Garden Room', event_date: '2026-04-20', event_type: 'Workshop', headcount: 15, booker_budget_per_head: 30, status: 'declined', last_message_at: new Date(Date.now() - 192 * 3600000).toISOString() },
  { proposal_id: 'p18', conversation_id: 'conv-fake-18', space_name: 'Private Dining Room', event_date: '2026-05-01', event_type: 'Corporate', headcount: 35, booker_budget_per_head: 45, status: 'declined', last_message_at: new Date(Date.now() - 216 * 3600000).toISOString() },
]

const SPACE_OPTIONS = ['All spaces', 'Private Dining Room', 'Garden Room', 'Mezzanine']

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

// ── Card ────────────────────────────────────────────────────────────────────

function Card({ card }: { card: ProposalCard }) {
  const hoursWaiting = (Date.now() - new Date(card.last_message_at).getTime()) / 3600000
  const isIncoming = card.status === 'incoming'
  const accentColor = EVENT_TYPE_COLORS[card.event_type] ?? '#1A1A1A'
  const urgencyColor = isIncoming ? getUrgencyColor(hoursWaiting) : '#1A1A1A'

  return (
    <Link href={`/conversations/${card.conversation_id}`}>
      <div
        className="bg-white border-2 border-dark rounded-xl p-4 cursor-pointer transition-all hover:shadow-[4px_4px_0_#1A1A1A] hover:-translate-y-0.5 relative overflow-hidden"
        style={{ borderLeftColor: accentColor, borderLeftWidth: 4 }}
      >
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
        <p className="text-xs text-text-muted mt-0.5">
          £{card.booker_budget_per_head}/head budget
        </p>

        {/* Time waiting — incoming only */}
        {isIncoming && (
          <div className="flex items-center gap-1 mt-2">
            <span style={{ color: urgencyColor }} className="text-sm">⏰</span>
            <span
              className="text-[11px] font-bold"
              style={{ color: urgencyColor }}
            >
              {getUrgencyLabel(hoursWaiting)}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-secondary">
          View thread →
        </div>
      </div>
    </Link>
  )
}

// ── Column ───────────────────────────────────────────────────────────────────

function Column({ stage, cards }: { stage: Stage; cards: ProposalCard[] }) {
  const sorted = [...cards].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )

  // Group by month for date separators
  let lastMonth = ''

  return (
    <div className="shrink-0 w-[300px] md:w-[320px]">
      {/* Column header */}
      <div className="bg-base border-2 border-dark rounded-t-xl px-4 py-3 flex items-center justify-between">
        <span className="font-display font-extrabold text-sm uppercase tracking-widest text-dark">
          {STAGE_LABELS[stage]}
        </span>
        <span className="bg-dark text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="border-l-2 border-r-2 border-b-2 border-dark rounded-b-xl p-3 space-y-3 min-h-[200px] bg-base/30">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-xs font-medium uppercase tracking-wide">
            No requests
          </div>
        ) : (
          sorted.map((card) => {
            const month = new Date(card.event_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
            const showSeparator = month !== lastMonth
            lastMonth = month

            return (
              <div key={card.proposal_id}>
                {showSeparator && (
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="flex-1 border-t border-dark/20" />
                    <span className="text-[10px] text-text-muted font-medium shrink-0">{month}</span>
                    <div className="flex-1 border-t border-dark/20" />
                  </div>
                )}
                <Card card={card} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Main pipeline client ─────────────────────────────────────────────────────

interface Props {
  venueName: string
  slug: string
}

export default function PipelineClient({ venueName, slug }: Props) {
  const [spaceFilter, setSpaceFilter] = useState('All spaces')
  const [timeView, setTimeView] = useState<TimeView>('30')

  const cutoff = addDays(parseInt(timeView))

  const filtered = FAKE_PROPOSALS.filter((p) => {
    const matchSpace = spaceFilter === 'All spaces' || p.space_name === spaceFilter
    const eventDate = new Date(p.event_date)
    const matchTime =
      p.status === 'declined' || // show all declined regardless of date
      p.status === 'confirmed' || // show all confirmed
      eventDate <= cutoff
    return matchSpace && matchTime
  })

  const byStage = (stage: Stage) => filtered.filter((p) => p.status === stage)

  const stats = {
    incoming: byStage('incoming').length,
    in_negotiation: byStage('in_negotiation').length,
    confirmed: byStage('confirmed').length,
    declined: byStage('declined').length,
  }

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Pipeline</p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">{venueName}</h1>

        {/* Stats */}
        <div className="flex gap-4 mt-3 flex-wrap text-sm">
          <span><strong className="text-dark">{stats.incoming}</strong> <span className="text-text-muted">incoming</span></span>
          <span><strong className="text-dark">{stats.in_negotiation}</strong> <span className="text-text-muted">negotiating</span></span>
          <span><strong className="text-dark">{stats.confirmed}</strong> <span className="text-text-muted">confirmed</span></span>
          <span><strong className="text-secondary">{stats.declined}</strong> <span className="text-text-muted">declined</span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Space filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Space:</span>
          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="border-2 border-dark rounded-lg px-3 py-1.5 text-xs font-semibold text-dark bg-white focus:outline-none focus:border-primary appearance-none pr-8"
          >
            {SPACE_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Time view */}
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

      {/* Kanban columns — horizontal scroll */}
      <div
        className="flex gap-4 overflow-x-auto pb-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        {(['incoming', 'awaiting_response', 'in_negotiation', 'confirmed', 'declined'] as Stage[]).map(
          (stage) => (
            <Column key={stage} stage={stage} cards={byStage(stage)} />
          )
        )}
      </div>
    </div>
  )
}
