import { notFound } from 'next/navigation'
import { getConversation, getConversationMessages } from '@/lib/supabase/queries'
import type { Message } from '@/types'
import FollowUpPanel from './FollowUpPanel'

export const dynamic = 'force-dynamic'

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
]

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function SenderBadge({ fromType }: { fromType: 'booker' | 'venue' | 'felicity' }) {
  if (fromType === 'felicity') {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-dark">
        Felicity
      </span>
    )
  }
  if (fromType === 'venue') {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-white">
        Venue
      </span>
    )
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-dark text-white">
      You
    </span>
  )
}

function SpaceHero({
  space,
  venue,
}: {
  space: { name: string; capacity: number; base_price: number; photos: string[]; payment_deposit_pct: number | null; payment_min_spend: number | null; payment_pay_ahead: boolean }
  venue: { name: string; neighbourhood: string } | null
}) {
  const photos = space.photos?.length > 0 ? space.photos : PLACEHOLDER_PHOTOS

  return (
    <div className="bg-white border-2 border-dark rounded-2xl overflow-hidden mb-6">
      {/* Photos strip */}
      <div
        className="flex gap-1 h-48 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {photos.slice(0, 4).map((url, i) => (
          <div
            key={i}
            className="shrink-0 w-64 h-full bg-base-deep bg-cover bg-center"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>

      {/* Details */}
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-text-muted font-medium mb-0.5">
          {venue?.name ?? 'Venue'} · {venue?.neighbourhood ?? ''}
        </p>
        <h2 className="font-display font-bold text-2xl uppercase text-dark mb-4">
          {space.name}
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Capacity</p>
            <p className="font-semibold text-dark">Up to {space.capacity} guests</p>
          </div>
          <div>
            <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Price</p>
            <p className="font-semibold text-dark">£{space.base_price}/head</p>
          </div>
          {space.payment_deposit_pct && (
            <div>
              <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Deposit</p>
              <p className="font-semibold text-dark">{space.payment_deposit_pct}%</p>
            </div>
          )}
          {space.payment_min_spend && (
            <div>
              <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Min spend</p>
              <p className="font-semibold text-dark">£{space.payment_min_spend.toLocaleString()}</p>
            </div>
          )}
        </div>

        {space.payment_pay_ahead && (
          <p className="mt-3 text-xs bg-base border border-dark/20 rounded-lg px-3 py-2 text-dark font-medium">
            Full payment required in advance
          </p>
        )}
      </div>
    </div>
  )
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [conversation, messages] = await Promise.all([
    getConversation(id).catch(() => null),
    getConversationMessages(id).catch(() => [] as Message[]),
  ])

  if (!conversation) notFound()

  const event = conversation.event as {
    event_type: string
    headcount: number
    date_from: string | null
    date_to: string | null
    budget_per_head_max: number | null
  } | null

  const space = conversation.space as {
    name: string
    capacity: number
    base_price: number
    photos: string[]
    payment_deposit_pct: number | null
    payment_min_spend: number | null
    payment_pay_ahead: boolean
  } | null

  const venue = conversation.venue as {
    name: string
    slug: string
    neighbourhood: string
  } | null

  const dateLabel = event?.date_from
    ? new Date(event.date_from).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const eventType = event?.event_type ?? 'Event'

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Event header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-text-muted mb-1">
          Conversation
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">
          {eventType} · {dateLabel}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {event?.headcount ?? '—'} guests
          {event?.budget_per_head_max ? ` · £${event.budget_per_head_max}/head max` : ''}
        </p>
      </div>

      {/* Space hero card (shown if conversation has a space) */}
      {space && <SpaceHero space={space} venue={venue} />}

      {/* Message thread */}
      <div className="space-y-4 mb-8">
        {messages.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isBooker = msg.from_type === 'booker'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBooker ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <SenderBadge fromType={msg.from_type} />
                  <span className="text-xs text-text-muted">{relativeTime(msg.sent_at)}</span>
                </div>
                <div
                  className={`bg-white border-2 border-dark rounded-xl p-4 text-sm text-dark leading-relaxed max-w-prose whitespace-pre-wrap ${
                    isBooker ? 'rounded-tr-none' : 'rounded-tl-none'
                  }`}
                >
                  {msg.message_text}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Follow-up questions panel */}
      <FollowUpPanel conversationId={id} eventType={eventType} />
    </main>
  )
}
