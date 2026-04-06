import { Suspense } from 'react'
import Link from 'next/link'
import { getSpacesWithFilters, getBookerEvent } from '@/lib/supabase/queries'
import type { Space } from '@/types'
import RequestProposalButton from './RequestProposalButton'
import BookerNav from '@/components/BookerNav'

export const dynamic = 'force-dynamic'

// Placeholder photos used when a space has none
const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
]

function SpaceCard({ space, eventId }: { space: Space; eventId: string | null }) {
  const photos =
    space.photos && space.photos.length > 0 ? space.photos : PLACEHOLDER_PHOTOS.slice(0, 1)

  const venue = space.venue as { name: string; neighbourhood: string } | undefined

  return (
    <div className="bg-white border-2 border-dark rounded-2xl overflow-hidden flex flex-col">
      {/* Photo strip */}
      <div className="flex gap-1 h-44 overflow-hidden">
        {photos.slice(0, 3).map((url, i) => (
          <div
            key={i}
            className="flex-1 bg-base-deep bg-cover bg-center"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted font-medium">
            {venue?.name ?? 'Venue'} · {venue?.neighbourhood ?? ''}
          </p>
          <h2 className="font-display font-bold text-xl uppercase text-dark mt-0.5">
            {space.name}
          </h2>
        </div>

        <div className="flex gap-4 text-sm text-text-muted">
          <span>
            <strong className="text-dark">Up to {space.capacity}</strong> guests
          </span>
          <span>
            <strong className="text-dark">£{space.base_price}</strong>/head
          </span>
        </div>

        {/* Payment terms */}
        {(space.payment_deposit_pct || space.payment_min_spend) && (
          <div className="flex gap-2 flex-wrap">
            {space.payment_deposit_pct && (
              <span className="bg-base border border-dark/20 rounded-full px-3 py-1 text-xs font-medium text-dark">
                {space.payment_deposit_pct}% deposit
              </span>
            )}
            {space.payment_min_spend && (
              <span className="bg-base border border-dark/20 rounded-full px-3 py-1 text-xs font-medium text-dark">
                £{space.payment_min_spend.toLocaleString()} min spend
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          {eventId ? (
            <RequestProposalButton
              spaceId={space.id}
              venueId={space.venue_id}
              eventId={eventId}
            />
          ) : (
            <Link
              href="/create-event"
              className="block w-full bg-base text-dark font-semibold text-sm text-center py-3 rounded-xl border-2 border-dark hover:bg-primary transition-colors"
            >
              Create event to request proposal
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

async function SpaceGrid({
  headcount,
  budget,
  dateFrom,
  dateTo,
  eventId,
}: {
  headcount?: number
  budget?: number
  dateFrom?: string
  dateTo?: string
  eventId: string | null
}) {
  const spaces = await getSpacesWithFilters({
    headcount,
    budget_max: budget,
    dateFrom,
    dateTo,
  })

  if (spaces.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl font-display font-bold uppercase text-dark mb-2">No spaces found</p>
        <p className="text-text-muted text-sm">Try adjusting your filters or dates.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <SpaceCard key={space.id} space={space} eventId={eventId} />
      ))}
    </div>
  )
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const sp = await searchParams
  const eventId = sp.event ?? null

  let event = null
  if (eventId) {
    event = await getBookerEvent(eventId)
  }

  const headcount = event?.headcount
  const budget = event?.budget_per_head_max ?? undefined
  const dateFrom = event?.date_from ?? undefined
  const dateTo = event?.date_to ?? undefined

  return (
    <>
      <BookerNav />
      <main className="md:ml-[250px] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-text-muted mb-1">
              Explore
            </p>
            <h1 className="font-display font-extrabold text-4xl uppercase text-dark">
              Spaces in London
            </h1>
            {event && (
              <p className="text-sm text-text-muted mt-1">
                Showing spaces for: <strong className="text-dark">{event.event_type}</strong>
                {headcount && <> · {headcount} guests</>}
                {budget && <> · £{budget}/head max</>}
              </p>
            )}
          </div>
          {eventId && (
            <div className="flex gap-3">
              <Link
                href={`/events/${eventId}/options`}
                className="bg-white border-2 border-dark text-dark font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-base-deep transition-colors"
              >
                My shortlist
              </Link>
              <Link
                href={`/events/${eventId}`}
                className="bg-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors"
              >
                ← Event
              </Link>
            </div>
          )}
          {!eventId && (
            <Link
              href="/create-event"
              className="bg-primary border-2 border-dark text-dark font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
            >
              Create event to filter →
            </Link>
          )}
        </div>

        {/* Grid */}
        <Suspense
          fallback={
            <div className="text-center py-20 text-text-muted font-medium">Loading spaces…</div>
          }
        >
          <SpaceGrid
            headcount={headcount}
            budget={budget}
            dateFrom={dateFrom}
            dateTo={dateTo}
            eventId={eventId}
          />
        </Suspense>
      </div>
      </main>
    </>
  )
}
