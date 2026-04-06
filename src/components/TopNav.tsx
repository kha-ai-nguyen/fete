'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const DEMO_VENUES = [
  { name: 'Morchella', slug: 'morchella' },
  { name: 'Boxcar', slug: 'boxcar' },
  { name: 'Tamila', slug: 'tamila' },
]

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showVenuePicker, setShowVenuePicker] = useState(false)

  // Detect current role from URL
  const dashboardMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  const currentSlug = dashboardMatch ? dashboardMatch[1] : null
  const isVenueRole = !!currentSlug
  const currentVenueName = currentSlug ? capitalize(currentSlug) : null

  function switchToVenue(slug: string) {
    setShowVenuePicker(false)
    router.push(`/dashboard/${slug}`)
  }

  function switchToBooker() {
    router.push('/events')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-base border-b-2 border-dark flex items-center px-5 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-extrabold text-xl uppercase text-dark tracking-tight"
        >
          Fete
        </Link>

        {/* Divider */}
        <div className="w-[2px] h-5 bg-dark/20" />

        {/* Role indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Mode
          </span>
          <span className="bg-dark text-primary text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
            {isVenueRole ? currentVenueName : 'Booker'}
          </span>
        </div>

        {/* Spacer */}
        <div className="ml-auto" />

        {/* Role switcher */}
        {isVenueRole ? (
          <button
            onClick={switchToBooker}
            className="bg-white border-2 border-dark text-dark text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary transition-colors"
          >
            ← Booker
          </button>
        ) : (
          <button
            onClick={() => setShowVenuePicker(true)}
            className="bg-dark text-primary text-sm font-semibold px-4 py-1.5 rounded-lg border-2 border-dark hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
          >
            Venue →
          </button>
        )}
      </nav>

      {/* Venue picker modal */}
      {showVenuePicker && (
        <div
          className="fixed inset-0 z-[60] bg-dark/50 flex items-center justify-center px-4"
          onClick={() => setShowVenuePicker(false)}
        >
          <div
            className="bg-white border-2 border-dark rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              Demo venues
            </p>
            <h2 className="font-display font-bold text-2xl uppercase text-dark mb-5">
              Select a venue to manage
            </h2>
            <div className="space-y-2">
              {DEMO_VENUES.map((v) => (
                <button
                  key={v.slug}
                  onClick={() => switchToVenue(v.slug)}
                  className="w-full text-left px-4 py-3 border-2 border-dark rounded-xl font-display font-bold text-lg uppercase hover:bg-primary transition-colors"
                >
                  {v.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowVenuePicker(false)}
              className="mt-4 w-full text-center text-sm text-text-muted underline underline-offset-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
