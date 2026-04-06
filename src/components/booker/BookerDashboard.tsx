'use client'

import { mockEnquiries, mockProposals, mockShortlist } from '@/data/booker-mock'
import DashboardStats from '@/components/booker/DashboardStats'
import OutreachMap from '@/components/booker/OutreachMap'
import ProposalCarousel from '@/components/booker/ProposalCarousel'
import ShortlistFeed from '@/components/booker/ShortlistFeed'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BookerDashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] text-text-muted uppercase tracking-widest font-bold hover:text-secondary transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to venues
          </Link>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase text-dark">
            Your Dashboard
          </h1>
          <p className="text-text-muted font-medium mt-2">
            Track your venue outreach, review proposals, and manage your shortlist.
          </p>
        </div>
      </header>

      {/* Stats bar */}
      <section className="mb-8">
        <DashboardStats
          enquiries={mockEnquiries}
          proposals={mockProposals}
          shortlistCount={mockShortlist.length}
        />
      </section>

      {/* Main content — two columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Outreach map */}
        <section>
          <OutreachMap enquiries={mockEnquiries} />
        </section>

        {/* Proposal carousel */}
        <section>
          <ProposalCarousel proposals={mockProposals} />
        </section>
      </div>

      {/* Shortlist feed — full width */}
      <section>
        <ShortlistFeed shortlist={mockShortlist} enquiries={mockEnquiries} />
      </section>
    </main>
  )
}
