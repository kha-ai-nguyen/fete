import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Users, DollarSign, ArrowRight } from 'lucide-react'
import { getVenueBySlug, getAvailabilityBlocks, getEnquiriesByVenue } from '@/lib/supabase/queries'
import AvailabilityCalendar from './AvailabilityCalendar'
import { ClaimModal } from './ClaimModal'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d).padStart(2,'0')} ${months[m - 1]} ${y}`
}

function daysAgo(isoString: string): string {
  const then = new Date(isoString).getTime()
  const now = Date.now()
  const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

const EVENT_TYPE_COLOURS: Record<string, string> = {
  Wedding:     'bg-[#FF2D9B] text-white border-[#FF2D9B]',
  Workshop:    'bg-[#CDEA2D] text-[#1A1A1A] border-[#1A1A1A]',
  Corporate:   'bg-[#1A1A1A] text-white border-[#1A1A1A]',
  Party:       'bg-[#FF2D9B] text-white border-[#FF2D9B]',
  Exhibition:  'bg-white text-[#1A1A1A] border-[#1A1A1A]',
}

function eventTypeBadgeClass(type: string): string {
  return EVENT_TYPE_COLOURS[type] ?? 'bg-white text-[#1A1A1A] border-[#1A1A1A]'
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function VenueProfilePage({ params }: PageProps) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const [availabilityBlocks, enquiries] = await Promise.all([
    getAvailabilityBlocks(venue.id),
    getEnquiriesByVenue(venue.id),
  ])

  const blockedDates = availabilityBlocks.map(b => b.blocked_date)
  const recentEnquiries = enquiries.slice(0, 10)

  const capacityLabel =
    venue.capacity_min && venue.capacity_max
      ? `${venue.capacity_min}–${venue.capacity_max} guests`
      : venue.capacity_max
      ? `Up to ${venue.capacity_max} guests`
      : null

  // Hero image resolution
  const heroImage = venue.placeholder_image_url ?? venue.photos?.[0] ?? null

  return (
    <main className="min-h-screen bg-[#E0C5DA]">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-bold uppercase text-[#6B5068] hover:text-[#1A1A1A] transition-colors"
        >
          ← All venues
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div
          className="relative w-full overflow-hidden border-2 border-[#1A1A1A]"
          style={{ height: '280px' }}
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2A1A28] flex items-end p-6">
              <span className="font-display font-extrabold text-white text-3xl uppercase">
                {venue.name}
              </span>
            </div>
          )}
          {/* Overlay name on real images */}
          {heroImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 to-transparent flex items-end p-6">
              <span className="font-display font-extrabold text-white text-3xl uppercase drop-shadow">
                {venue.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Venue name + neighbourhood */}
            <div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase text-[#1A1A1A] leading-tight">
                {venue.name}
              </h1>
              {venue.neighbourhood && (
                <p className="text-[#6B5068] font-medium mt-1">{venue.neighbourhood}</p>
              )}
            </div>

            {/* Verified badge */}
            {venue.claimed && (
              <div className="inline-flex items-center gap-1 bg-[#CDEA2D] text-[#1A1A1A] border-2 border-[#1A1A1A] px-3 py-1 text-xs font-bold uppercase">
                <CheckCircle size={12} />
                Verified Venue
              </div>
            )}

            {/* Description */}
            {venue.description && (
              <p className="text-[#1A1A1A] leading-relaxed">{venue.description}</p>
            )}

            {/* Details row */}
            <div className="flex flex-wrap gap-3">
              {capacityLabel && (
                <div className="flex items-center gap-1.5 border-2 border-[#1A1A1A] bg-white px-3 py-1.5 text-sm font-bold">
                  <Users size={14} />
                  {capacityLabel}
                </div>
              )}
              {venue.price_estimate && (
                <div className="flex items-center gap-1.5 border-2 border-[#1A1A1A] bg-white px-3 py-1.5 text-sm font-bold">
                  <DollarSign size={14} />
                  {venue.price_estimate}
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <Link
              href={`/enquire?venue=${venue.slug ?? slug}`}
              className="inline-flex items-center gap-2 bg-[#CDEA2D] border-2 border-[#1A1A1A] px-6 py-3 font-bold uppercase text-sm hover:opacity-90 transition-opacity"
            >
              Enquire <ArrowRight size={16} />
            </Link>

            {/* Claim CTA (only if unclaimed) */}
            {!venue.claimed && (
              <div className="mt-2">
                <ClaimModal venueName={venue.name} venueId={venue.id} />
              </div>
            )}

            {/* ── Enquiry log ── */}
            <section>
              <h2 className="font-display font-extrabold text-xl uppercase text-[#1A1A1A] mb-4">
                Recent enquiries
              </h2>

              {recentEnquiries.length === 0 ? (
                <div className="border-2 border-[#1A1A1A] bg-white p-6 text-center space-y-3">
                  <p className="text-[#6B5068] text-sm">
                    No enquiries yet — be the first.
                  </p>
                  <Link
                    href={`/enquire?venue=${venue.slug ?? slug}`}
                    className="inline-flex items-center gap-2 bg-[#CDEA2D] border-2 border-[#1A1A1A] px-4 py-2 text-xs font-bold uppercase hover:opacity-90 transition-opacity"
                  >
                    Send an enquiry <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-[#1A1A1A] bg-white divide-y-2 divide-[#1A1A1A]">
                  {recentEnquiries.map(enq => (
                    <div
                      key={enq.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm"
                    >
                      <span
                        className={`border-2 px-2 py-0.5 text-xs font-bold uppercase ${eventTypeBadgeClass(enq.event_type)}`}
                      >
                        {enq.event_type}
                      </span>
                      <span className="text-[#1A1A1A] font-medium">
                        {enq.headcount} guests
                      </span>
                      <span className="text-[#6B5068]">
                        {formatDate(enq.event_date)}
                      </span>
                      <span className="text-[#6B5068] ml-auto text-xs">
                        {daysAgo(enq.sent_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Availability calendar ── */}
            <section>
              <h2 className="font-display font-extrabold text-xl uppercase text-[#1A1A1A] mb-1">
                Availability
              </h2>
              <p className="text-xs text-[#6B5068] mb-4">
                Blocked dates are shown in pink
              </p>
              <div className="border-2 border-[#1A1A1A] bg-white p-4">
                <AvailabilityCalendar blockedDates={blockedDates} />
              </div>
            </section>

          </div>

          {/* ── Right sticky sidebar (desktop only) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 border-2 border-[#1A1A1A] bg-white p-6 space-y-4">
              <h3 className="font-display font-extrabold text-lg uppercase text-[#1A1A1A]">
                {venue.name}
              </h3>

              {capacityLabel && (
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-[#6B5068]" />
                  <span className="font-medium">{capacityLabel}</span>
                </div>
              )}

              {venue.price_estimate && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={14} className="text-[#6B5068]" />
                  <span className="font-medium">{venue.price_estimate}</span>
                </div>
              )}

              {venue.neighbourhood && (
                <p className="text-sm text-[#6B5068]">{venue.neighbourhood}</p>
              )}

              <div className="pt-2 border-t-2 border-[#1A1A1A]">
                <Link
                  href={`/enquire?venue=${venue.slug ?? slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#CDEA2D] border-2 border-[#1A1A1A] px-4 py-3 font-bold uppercase text-sm hover:opacity-90 transition-opacity"
                >
                  Enquire <ArrowRight size={16} />
                </Link>
              </div>

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[#6B5068] hover:text-[#1A1A1A] underline underline-offset-2"
                >
                  Visit website
                </a>
              )}
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
