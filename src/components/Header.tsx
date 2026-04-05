'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const modules = [
  { label: 'Venues', href: '/' },
  { label: 'Enquire', href: '/enquire' },
  { label: 'Dashboard', href: '/dashboard' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-dark text-white px-4 md:px-8 py-4 flex items-center justify-between">
      <Link
        href="/"
        className="font-display font-extrabold text-xl uppercase tracking-tight text-primary"
      >
        Fete
      </Link>

      <nav className="flex items-center gap-1">
        {modules.map(({ label, href }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-dark'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
