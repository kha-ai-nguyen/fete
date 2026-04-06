import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/client'
import BookerNav from '@/components/BookerNav'
import type { BookerEvent } from '@/types'

export const dynamic = 'force-dynamic'

function formatDate(d: string | null) {
  if (!d) return 'Flexible'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function getEvents(): Promise<BookerEvent[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as BookerEvent[]
}

export default async function EventsListPage() {
  const events = await getEvents()

  // Filter to new-flow events (booker-created: venue_name is empty string or null)
  const bookerEvents = events.filter(
    (e) => !(e as any).venue_name || (e as any).venue_name === ''
  )

  return (
    <>
      <BookerNav />
      <main className="md:ml-[250px] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                Booker
              </p>
              <h1 className="font-display font-extrabold text-4xl uppercase text-dark">
                My Events
              </h1>
            </div>
            <Link
              href="/create-event"
              className="bg-primary border-2 border-dark text-dark font-display font-bold uppercase text-sm px-5 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
            >
              + New event
            </Link>
          </div>

          {bookerEvents.length === 0 ? (
            <div className="bg-white border-2 border-dark rounded-2xl p-10 text-center">
              <p className="font-display font-bold text-2xl uppercase text-dark mb-2">
                No events yet
              </p>
              <p className="text-text-muted text-sm mb-6">
                Create your first event to start exploring venues.
              </p>
              <Link
                href="/create-event"
                className="inline-block bg-primary border-2 border-dark text-dark font-bold uppercase text-sm px-6 py-3 rounded-xl hover:bg-dark hover:text-primary transition-colors"
              >
                Create event →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookerEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block bg-white border-2 border-dark rounded-2xl p-5 hover:border-primary hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-xl uppercase text-dark truncate">
                        {event.event_type}
                      </h2>
                      <div className="flex gap-4 mt-1 text-sm text-text-muted flex-wrap">
                        <span>
                          <strong className="text-dark">{event.headcount}</strong> guests
                        </span>
                        {event.budget_per_head_max && (
                          <span>
                            £<strong className="text-dark">{event.budget_per_head_max}</strong>/head
                          </span>
                        )}
                        <span>{formatDate(event.date_from)}</span>
                        {event.postcode && (
                          <span className="font-mono uppercase">{event.postcode}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
