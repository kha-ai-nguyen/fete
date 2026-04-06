'use client'

import type { ShortlistedVenue, BookerEnquiry } from '@/types'
import { Star, Send, MessageSquare } from 'lucide-react'

interface ShortlistFeedProps {
  shortlist: ShortlistedVenue[]
  enquiries: BookerEnquiry[]
}

function getEnquiryStatus(enquiryId: string | null, enquiries: BookerEnquiry[]): string | null {
  if (!enquiryId) return null
  const enq = enquiries.find((e) => e.id === enquiryId)
  return enq?.status ?? null
}

const STATUS_CHIP_STYLES: Record<string, string> = {
  sent: 'bg-primary text-dark',
  viewed: 'bg-base-deep text-dark',
  replied: 'bg-secondary text-white',
  declined: 'bg-dark text-text-muted',
}

export default function ShortlistFeed({ shortlist, enquiries }: ShortlistFeedProps) {
  return (
    <div className="bg-card border-2 border-dark rounded-md overflow-hidden">
      <div className="p-5 border-b-2 border-dark flex items-center justify-between">
        <h2 className="font-display font-extrabold text-xl uppercase text-dark">
          Shortlist
        </h2>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
          {shortlist.length} {shortlist.length === 1 ? 'venue' : 'venues'}
        </span>
      </div>

      {shortlist.length === 0 ? (
        <div className="p-12 text-center">
          <p className="font-display font-extrabold text-lg uppercase text-dark mb-1">
            No venues shortlisted
          </p>
          <p className="text-text-muted text-sm font-medium">
            Browse venues and add your favourites to build your shortlist.
          </p>
        </div>
      ) : (
        <div className="divide-y-2 divide-dark">
          {shortlist.map((venue) => {
            const enquiryStatus = getEnquiryStatus(venue.enquiry_id, enquiries)

            return (
              <div
                key={venue.id}
                className="flex items-center gap-4 p-4 hover:bg-base/30 transition-colors"
              >
                {/* Venue photo */}
                <img
                  src={venue.venue_photo}
                  alt={venue.venue_name}
                  className="w-14 h-14 object-cover rounded-sm border-2 border-dark flex-shrink-0"
                />

                {/* Venue info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-extrabold text-sm uppercase text-dark truncate">
                    {venue.venue_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                      {venue.venue_neighbourhood}
                    </span>
                    {venue.capacity_max && (
                      <>
                        <span className="text-text-muted text-[10px]">·</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                          Up to {venue.capacity_max}
                        </span>
                      </>
                    )}
                    {venue.price_estimate && (
                      <>
                        <span className="text-text-muted text-[10px]">·</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                          {venue.price_estimate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status and actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Proposal count badge */}
                  {venue.proposal_count > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 border-2 border-dark rounded-md">
                      <MessageSquare className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-bold text-dark">
                        {venue.proposal_count}
                      </span>
                    </div>
                  )}

                  {/* Enquiry status chip */}
                  {enquiryStatus ? (
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border-2 border-dark ${STATUS_CHIP_STYLES[enquiryStatus]}`}>
                      {enquiryStatus}
                    </span>
                  ) : (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary border-2 border-dark rounded-md text-[10px] font-bold uppercase tracking-widest text-dark hover:bg-secondary hover:text-white transition-colors">
                      <Send className="w-3 h-3" />
                      Enquire
                    </button>
                  )}

                  {/* Favourite star */}
                  <button className="w-8 h-8 flex items-center justify-center border-2 border-dark rounded-md hover:bg-primary transition-colors">
                    <Star className="w-3.5 h-3.5 fill-primary text-dark" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
