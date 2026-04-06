import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBookerEvent, getConversationsByEventId } from '@/lib/supabase/queries'
import type { Conversation, Space, Venue } from '@/types'
import SortableOptions from './SortableOptions'

export const dynamic = 'force-dynamic'

export default async function OptionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, conversations] = await Promise.all([
    getBookerEvent(id),
    getConversationsByEventId(id),
  ])

  if (!event) notFound()

  return (
    <main className="min-h-screen bg-base px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-text-muted mb-1">
              {event.event_type} · {event.headcount} guests
            </p>
            <h1 className="font-display font-extrabold text-4xl uppercase text-dark">
              Your shortlist
            </h1>
          </div>
          <Link
            href={`/explore?event=${id}`}
            className="bg-primary border-2 border-dark text-dark font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
          >
            + Add space
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display font-bold text-2xl uppercase text-dark mb-3">
              No spaces yet
            </p>
            <p className="text-text-muted text-sm mb-8">
              Browse spaces and request proposals to build your shortlist.
            </p>
            <Link
              href={`/explore?event=${id}`}
              className="inline-block bg-secondary text-white font-semibold px-6 py-3 rounded-xl border-2 border-dark hover:bg-dark transition-colors"
            >
              Browse spaces →
            </Link>
          </div>
        ) : (
          <SortableOptions conversations={conversations} event={event} />
        )}
      </div>
    </main>
  )
}
