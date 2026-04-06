import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBookerEvent } from '@/lib/supabase/queries'
import BookerNav from '@/components/BookerNav'

export const dynamic = 'force-dynamic'

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getBookerEvent(id)
  if (!event) notFound()

  const dateLabel =
    event.date_from && event.date_to
      ? `${formatDate(event.date_from)} – ${formatDate(event.date_to)}`
      : event.date_from
      ? formatDate(event.date_from)
      : 'Flexible'

  return (
    <>
      <BookerNav />
      <main className="md:ml-[250px] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-widest font-medium text-text-muted mb-2">
          Your event
        </p>
        <h1 className="font-display font-extrabold text-4xl uppercase text-dark mb-8">
          {event.event_type}
        </h1>

        {/* Event summary card */}
        <div className="bg-white border-2 border-dark rounded-2xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Guests</p>
              <p className="font-semibold text-dark text-lg">{event.headcount}</p>
            </div>
            {event.budget_per_head_max && (
              <div>
                <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Budget</p>
                <p className="font-semibold text-dark text-lg">£{event.budget_per_head_max}/head</p>
              </div>
            )}
            <div>
              <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Date</p>
              <p className="font-semibold text-dark">{dateLabel}</p>
            </div>
            {event.postcode && (
              <div>
                <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Location</p>
                <p className="font-semibold text-dark font-mono">
                  {event.postcode} · {event.radius_km}km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href={`/events/${id}/results`}
            className="block w-full bg-primary text-dark font-display font-bold text-lg uppercase text-center py-4 rounded-xl border-2 border-dark hover:bg-dark hover:text-primary transition-colors"
          >
            View results →
          </Link>
          <Link
            href={`/explore?event=${id}`}
            className="block w-full bg-white text-dark font-display font-bold text-lg uppercase text-center py-4 rounded-xl border-2 border-dark hover:bg-base-deep transition-colors"
          >
            Browse spaces
          </Link>
          <Link
            href={`/events/${id}/options`}
            className="block w-full bg-white text-dark font-display font-bold text-lg uppercase text-center py-4 rounded-xl border-2 border-dark hover:bg-base-deep transition-colors"
          >
            My shortlist
          </Link>
          <Link
            href="/create-event"
            className="block w-full text-center text-sm text-text-muted underline underline-offset-2 py-2"
          >
            Start a different event
          </Link>
        </div>
      </div>
      </main>
    </>
  )
}
