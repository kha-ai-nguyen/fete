'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Create Event', href: '/create-event' },
  { label: 'My Events', href: '/events' },
  { label: 'Explore Venues', href: '/explore' },
]

export default function BookerNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/create-event') return pathname === href
    if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/')
    if (href === '/explore') return pathname.startsWith('/explore')
    return pathname === href
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-[250px] bg-base border-r-2 border-dark z-40 pt-6">
      {/* Header */}
      <div className="px-5 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
          You are
        </p>
        <h2 className="font-display font-extrabold text-2xl uppercase text-dark">
          Booker
        </h2>
      </div>

      {/* Nav links */}
      <nav className="px-3 space-y-0.5">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isActive(href)
                ? 'bg-dark text-primary'
                : 'text-dark hover:bg-base-deep'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-5 pb-6">
        <p className="text-[10px] text-text-muted">Fete v0 · booker demo</p>
      </div>
    </aside>
  )
}
