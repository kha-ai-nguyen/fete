import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Calendar, Mail } from 'lucide-react'

import { getVenueBySlug, getAvailabilityBlocks, getEnquiriesByVenue } from '@/lib/supabase/queries'
import AvailabilityCalendar from '@/app/venues/[slug]/AvailabilityCalendar'
import ProfileEditor from './ProfileEditor'
import DashboardEnquiries from './DashboardEnquiries'

type Tab = 'profile' | 'availability' | 'enquiries'

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', Icon: Pencil },
  { key: 'availability', label: 'Availability', Icon: Calendar },
  { key: 'enquiries', label: 'Enquiries', Icon: Mail },
]

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab: rawTab } = await searchParams
  const activeTab: Tab =
    rawTab === 'availability' || rawTab === 'enquiries' ? rawTab : 'profile'

  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const [availabilityBlocks, enquiries] = await Promise.all([
    getAvailabilityBlocks(venue.id),
    getEnquiriesByVenue(venue.id),
  ])

  const blockedDates = availabilityBlocks.map(b => b.blocked_date)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E0C5DA]">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r-2 border-[#1A1A1A] shrink-0">
        {/* Venue name header */}
        <div className="border-b-2 border-[#1A1A1A] px-5 py-4">
          <p className="text-[10px] font-bold uppercase text-[#6B5068] mb-0.5">Dashboard</p>
          <p className="font-display font-extrabold uppercase text-sm text-[#1A1A1A] leading-tight truncate">
            {venue.name}
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <Link
                key={key}
                href={`/dashboard/${slug}?tab=${key}`}
                className={`flex items-center gap-3 px-5 py-4 border-b-2 border-[#1A1A1A] text-sm font-bold uppercase transition-colors ${
                  isActive
                    ? 'bg-[#CDEA2D] text-[#1A1A1A]'
                    : 'hover:bg-[#CDEA2D]/10 text-[#1A1A1A]'
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Back to listing */}
        <div className="border-t-2 border-[#1A1A1A] px-5 py-4">
          <Link
            href={`/venues/${slug}`}
            className="text-xs font-bold uppercase text-[#6B5068] hover:text-[#1A1A1A] transition-colors"
          >
            ← View listing
          </Link>
        </div>
      </aside>

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden bg-white border-b-2 border-[#1A1A1A]">
        <div className="px-4 py-3 border-b-2 border-[#1A1A1A]">
          <p className="text-[10px] font-bold uppercase text-[#6B5068]">Dashboard</p>
          <p className="font-display font-extrabold uppercase text-sm text-[#1A1A1A] truncate">
            {venue.name}
          </p>
        </div>
        <div className="flex">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <Link
                key={key}
                href={`/dashboard/${slug}?tab=${key}`}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase border-r-2 last:border-r-0 border-[#1A1A1A] transition-colors ${
                  isActive
                    ? 'bg-[#CDEA2D] text-[#1A1A1A]'
                    : 'hover:bg-[#CDEA2D]/10 text-[#1A1A1A]'
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {activeTab === 'profile' && <ProfileEditor venue={venue} />}

        {activeTab === 'availability' && (
          <div>
            <h2 className="font-display font-extrabold uppercase text-xl text-[#1A1A1A] mb-6">
              Availability
            </h2>
            <div className="bg-white border-2 border-[#1A1A1A] p-5 max-w-sm">
              <AvailabilityCalendar
                blockedDates={blockedDates}
                editable={true}
                venueId={venue.id}
              />
            </div>
            <p className="text-xs text-[#6B5068] mt-3">
              Click a date to block it. Click a blocked date (pink) to unblock it.
            </p>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <DashboardEnquiries enquiries={enquiries} />
        )}
      </main>
    </div>
  )
}
