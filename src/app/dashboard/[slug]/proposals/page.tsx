import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/client'
import { getConversationsByVenueId } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

async function getVenueBySlug(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('venues')
    .select('id, name, slug, neighbourhood')
    .eq('slug', slug)
    .single()
  return data
}

function formatDate(d: string | null) {
  if (!d) return 'Flexible'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ProposalsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const conversations = await getConversationsByVenueId(venue.id)

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
          {venue.neighbourhood}
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">Proposals</h1>
        <p className="text-sm text-text-muted mt-1">
          Incoming proposal requests from bookers.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white border-2 border-dark rounded-2xl p-10 text-center">
          <p className="font-display font-bold text-2xl uppercase text-dark mb-2">
            No proposals yet
          </p>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            When bookers request proposals for your spaces, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const event = (conv.event as unknown) as {
              id: string
              event_type: string
              headcount: number
              budget_per_head_max: number | null
              date_from: string | null
              booker_name: string
            } | null
            const space = (conv.space as unknown) as {
              id: string
              name: string
              capacity: number
              base_price: number
            } | null

            return (
              <div
                key={conv.id}
                className="bg-white border-2 border-dark rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Event type + space */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {event?.event_type && (
                        <span className="bg-dark text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                          {event.event_type}
                        </span>
                      )}
                      {space?.name && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted border border-dark/20 rounded-md px-2.5 py-1">
                          {space.name}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex gap-4 text-sm text-text-muted flex-wrap">
                      {event?.headcount && (
                        <span>
                          <strong className="text-dark">{event.headcount}</strong> guests
                        </span>
                      )}
                      {event?.budget_per_head_max && (
                        <span>
                          £<strong className="text-dark">{event.budget_per_head_max}</strong>/head budget
                        </span>
                      )}
                      <span>{formatDate(event?.date_from ?? null)}</span>
                    </div>

                    {event?.booker_name && (
                      <p className="text-xs text-text-muted mt-2">
                        From <strong className="text-dark">{event.booker_name}</strong>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col gap-2 items-end">
                    <Link
                      href={`/conversations/${conv.id}`}
                      className="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-dark transition-colors"
                    >
                      View thread →
                    </Link>
                    <Link
                      href={`/dashboard/${slug}/proposals/builder?conversation_id=${conv.id}`}
                      className="text-xs font-bold uppercase tracking-widest bg-primary border-2 border-dark rounded-lg px-3 py-1.5 text-dark hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all"
                    >
                      Generate proposal
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
