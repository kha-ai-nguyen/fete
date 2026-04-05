'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

type Persona = 'booker' | 'venue'

const NAV: Record<Persona, { label: string; href: string }[]> = {
  booker: [
    { label: 'Directory', href: '/' },
    { label: 'Conversations', href: '/conversations' },
  ],
  venue: [
    { label: 'Enquiries', href: '/dashboard' },
    { label: 'Pipeline', href: '/dashboard' },
    { label: 'Conversations', href: '/conversations' },
  ],
}

export default function Header() {
  const pathname = usePathname()
  const [persona, setPersona] = useState<Persona>('booker')

  useEffect(() => {
    const saved = localStorage.getItem('fete-persona') as Persona | null
    if (saved === 'booker' || saved === 'venue') setPersona(saved)
  }, [])

  function switchPersona(p: Persona) {
    setPersona(p)
    localStorage.setItem('fete-persona', p)
  }

  const navItems = NAV[persona]

  return (
    <header className="bg-dark text-white px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Persona toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/"
          className="font-display font-extrabold text-lg uppercase tracking-tight text-primary"
        >
          Fete
        </Link>

        <div className="relative flex items-center bg-white/10 rounded-full p-0.5">
          {/* Sliding pill */}
          <div
            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-primary transition-transform duration-200"
            style={{ transform: persona === 'venue' ? 'translateX(calc(100% + 4px))' : 'translateX(2px)' }}
          />
          <button
            onClick={() => switchPersona('booker')}
            className={`relative z-10 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full transition-colors duration-200 ${
              persona === 'booker' ? 'text-dark' : 'text-white/60 hover:text-white'
            }`}
          >
            Booker
          </button>
          <button
            onClick={() => switchPersona('venue')}
            className={`relative z-10 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full transition-colors duration-200 ${
              persona === 'venue' ? 'text-dark' : 'text-white/60 hover:text-white'
            }`}
          >
            Venue
          </button>
        </div>
      </div>

      {/* Persona nav */}
      <nav className="flex items-center gap-1">
        {navItems.map(({ label, href }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)

          return (
            <Link
              key={label}
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
