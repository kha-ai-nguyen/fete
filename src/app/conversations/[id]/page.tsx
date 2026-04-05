import { notFound } from 'next/navigation'
import { getConversation, getConversationMessages } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

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

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [conversation, messages] = await Promise.all([
    getConversation(id).catch(() => null),
    getConversationMessages(id).catch(() => []),
  ])

  if (!conversation) notFound()

  const enquiry = (Array.isArray(conversation.enquiries)
    ? conversation.enquiries[0]
    : conversation.enquiries) as {
    event_type: string
    event_date: string
    headcount: number
    price_per_head: number
    notes?: string
  } | null

  const venue = (Array.isArray(conversation.venues)
    ? conversation.venues[0]
    : conversation.venues) as {
    name: string
    slug: string
  } | null

  const formattedDate = enquiry?.event_date
    ? new Date(enquiry.event_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Enquiry header */}
      <div className="bg-white border-2 border-dark rounded-xl p-5 mb-8">
        <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-1">
          Enquiry
        </p>
        <h1 className="font-display font-extrabold text-2xl uppercase text-dark mb-3">
          {enquiry?.event_type ?? 'Event'} · {formattedDate}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
          <span>
            <strong className="text-dark">{enquiry?.headcount ?? '—'}</strong> guests
          </span>
          {enquiry?.price_per_head && (
            <span>
              <strong className="text-dark">£{enquiry.price_per_head}pp</strong> budget
            </span>
          )}
          {venue && (
            <span>
              @ <strong className="text-dark">{venue.name}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => {
            const isBooker = msg.from_type === 'booker'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBooker ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <SenderBadge fromType={msg.from_type as 'booker' | 'venue' | 'felicity'} />
                  <span className="text-xs text-text-muted">
                    {relativeTime(msg.sent_at)}
                  </span>
                </div>
                <div
                  className={`bg-white border-2 border-dark rounded-xl p-4 text-sm text-dark leading-relaxed max-w-prose ${
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

      {/* Footer hint */}
      <p className="text-center text-xs text-text-muted mt-10">
        Reply will appear here once the venue responds.
      </p>
    </main>
  )
}
