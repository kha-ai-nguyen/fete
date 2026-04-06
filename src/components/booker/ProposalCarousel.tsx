'use client'

import { useState } from 'react'
import type { Proposal } from '@/types'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'

interface ProposalCarouselProps {
  proposals: Proposal[]
}

const STATUS_CHIP_STYLES: Record<string, string> = {
  submitted: 'bg-primary text-dark',
  accepted: 'bg-dark text-primary',
  declined: 'bg-base-deep text-dark',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProposalCarousel({ proposals }: ProposalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  function goTo(index: number) {
    if (index < 0) {
      setCurrentIndex(proposals.length - 1)
    } else if (index >= proposals.length) {
      setCurrentIndex(0)
    } else {
      setCurrentIndex(index)
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-card border-2 border-dark rounded-md overflow-hidden">
        <div className="p-5 border-b-2 border-dark">
          <h2 className="font-display font-extrabold text-xl uppercase text-dark">
            Proposals
          </h2>
        </div>
        <div className="p-12 text-center">
          <p className="font-display font-extrabold text-lg uppercase text-dark mb-1">
            No proposals yet
          </p>
          <p className="text-text-muted text-sm font-medium">
            Proposals from venues will appear here once they respond to your enquiries.
          </p>
        </div>
      </div>
    )
  }

  const proposal = proposals[currentIndex]

  return (
    <div className="bg-card border-2 border-dark rounded-md overflow-hidden">
      <div className="p-5 border-b-2 border-dark flex items-center justify-between">
        <h2 className="font-display font-extrabold text-xl uppercase text-dark">
          Proposals
        </h2>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
          {currentIndex + 1} / {proposals.length}
        </span>
      </div>

      <div className="relative">
        {/* Proposal card */}
        <div className="flex flex-col md:flex-row">
          {/* Venue photo */}
          <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-dark">
            <img
              src={proposal.venue_photo}
              alt={proposal.venue_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Proposal details */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-extrabold text-2xl uppercase text-dark leading-tight">
                  {proposal.venue_name}
                </h3>
                <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-0.5">
                  {proposal.venue_neighbourhood}
                </p>
              </div>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-2 border-dark rounded-md whitespace-nowrap ${STATUS_CHIP_STYLES[proposal.status]}`}>
                {proposal.status}
              </span>
            </div>

            {/* Package and pricing */}
            <div className="border-2 border-dark rounded-md bg-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
                  Package
                </span>
                <span className="text-sm font-bold text-dark">
                  {proposal.package_name ?? 'Standard'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
                  Price
                </span>
                <span className="font-display font-extrabold text-xl text-dark">
                  £{proposal.price_per_head}
                </span>
                <span className="text-text-muted text-xs font-medium">/head</span>
              </div>
            </div>

            {/* Event date */}
            <div className="border-2 border-dark rounded-md bg-white p-4">
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block mb-1">
                Event Date
              </span>
              <span className="text-sm font-bold text-dark">
                {formatDate(proposal.event_date)}
              </span>
            </div>

            {/* Notes */}
            {proposal.notes && (
              <p className="text-sm text-text-muted font-medium leading-relaxed">
                {proposal.notes}
              </p>
            )}

            {/* Actions */}
            {proposal.status === 'submitted' && (
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 bg-primary border-2 border-dark text-dark font-bold uppercase tracking-widest text-[10px] py-3 rounded-md hover:bg-secondary hover:text-white transition-colors">
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-dark text-dark font-bold uppercase tracking-widest text-[10px] py-3 rounded-md hover:bg-secondary hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation arrows */}
        {proposals.length > 1 && (
          <>
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card border-2 border-dark rounded-md hover:bg-primary transition-colors shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card border-2 border-dark rounded-md hover:bg-primary transition-colors shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {proposals.length > 1 && (
        <div className="flex justify-center gap-2 p-4 border-t-2 border-dark">
          {proposals.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full border border-dark transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-base-deep'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
