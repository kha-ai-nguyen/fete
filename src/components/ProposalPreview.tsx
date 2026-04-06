'use client'

import { ProposalSections, Conversation, Space, Venue, BookerEvent } from '@/types'

type Props = {
  sections: ProposalSections
  conversation: Conversation
}

function formatDate(d: string | null | undefined) {
  if (!d) return 'Flexible'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ProposalPreview({ sections, conversation }: Props) {
  const event = conversation.event as BookerEvent | undefined
  const space = conversation.space as Space | undefined
  const venue = conversation.venue as Venue | undefined

  const headcount = event?.headcount ?? 0
  const basePrice = space?.base_price ?? 0
  const minSpend = space?.payment_min_spend ?? null
  const subtotal = basePrice * headcount
  const total = minSpend ? Math.max(subtotal, minSpend) : subtotal

  return (
    <div
      id="proposal-preview"
      className="bg-white border-2 border-dark rounded-2xl overflow-hidden text-dark"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Cover page */}
      {sections.coverPage && (
        <div className="bg-base p-10 border-b-2 border-dark">
          <div className="mb-6">
            <span className="font-display font-extrabold text-2xl uppercase tracking-widest text-dark">
              FETE
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Event Proposal
            </p>
            <h1 className="font-display font-extrabold text-4xl uppercase text-dark leading-tight">
              {event?.event_type ?? 'Private Event'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-muted pt-2">
              {event?.date_from && (
                <span>{formatDate(event.date_from)}</span>
              )}
              {headcount > 0 && (
                <span>{headcount} guests</span>
              )}
              {venue?.name && (
                <span className="font-semibold text-dark">{venue.name}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Space details */}
      {sections.spaceDetails && space && (
        <div className="p-8 border-b-2 border-dark">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            The Space
          </p>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-3">
            {space.name}
          </h2>

          {space.photos?.[0] && (
            <div className="mb-4 rounded-xl overflow-hidden border-2 border-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.photos[0]}
                alt={space.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex gap-6 text-sm text-text-muted">
            <span>
              Capacity: <strong className="text-dark">{space.capacity} guests</strong>
            </span>
          </div>
        </div>
      )}

      {/* Pricing breakdown */}
      {sections.pricingBreakdown && (
        <div className="p-8 border-b-2 border-dark">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Pricing
          </p>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-4">
            Your Investment
          </h2>

          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-dark/10">
                <td className="py-2 text-text-muted">Price per head</td>
                <td className="py-2 text-right font-semibold text-dark">£{basePrice}</td>
              </tr>
              <tr className="border-b border-dark/10">
                <td className="py-2 text-text-muted">Guests</td>
                <td className="py-2 text-right font-semibold text-dark">× {headcount}</td>
              </tr>
              <tr className="border-b border-dark/10">
                <td className="py-2 text-text-muted">Subtotal</td>
                <td className="py-2 text-right font-semibold text-dark">£{subtotal.toLocaleString()}</td>
              </tr>
              {minSpend && minSpend > subtotal && (
                <tr className="border-b border-dark/10">
                  <td className="py-2 text-text-muted">Minimum spend applies</td>
                  <td className="py-2 text-right font-semibold text-dark">£{minSpend.toLocaleString()}</td>
                </tr>
              )}
              <tr className="bg-base/50">
                <td className="py-3 px-2 font-display font-bold text-base uppercase">Total</td>
                <td className="py-3 px-2 text-right font-display font-extrabold text-xl text-dark">
                  £{total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Payment terms */}
      {sections.paymentTerms && space && (
        <div className="p-8 border-b-2 border-dark">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Payment Terms
          </p>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-4">
            How It Works
          </h2>

          <div className="space-y-2 text-sm text-text-muted">
            {space.payment_deposit_pct && (
              <p>
                <strong className="text-dark">{space.payment_deposit_pct}% deposit</strong> required to confirm your booking.
              </p>
            )}
            {space.payment_pay_ahead && (
              <p>
                <strong className="text-dark">Full payment</strong> is due on confirmation.
              </p>
            )}
            {!space.payment_deposit_pct && !space.payment_pay_ahead && (
              <p>Payment terms will be confirmed on booking. Please contact us to discuss.</p>
            )}
            {minSpend && (
              <p>
                A minimum spend of <strong className="text-dark">£{minSpend.toLocaleString()}</strong> applies to this space.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      {sections.contact && venue && (
        <div className="p-8 border-b-2 border-dark">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Next Steps
          </p>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-4">
            Ready to Confirm?
          </h2>

          <div className="space-y-2 text-sm">
            <p className="font-bold text-dark">{venue.name}</p>
            {venue.claimed_by_email && (
              <p className="text-text-muted">
                📧{' '}
                <a href={`mailto:${venue.claimed_by_email}`} className="text-dark underline">
                  {venue.claimed_by_email}
                </a>
              </p>
            )}
            {venue.website && (
              <p className="text-text-muted">
                🌐{' '}
                <a href={venue.website} className="text-dark underline">
                  {venue.website}
                </a>
              </p>
            )}
            <div className="pt-3">
              {venue.claimed_by_email ? (
                <a
                  href={`mailto:${venue.claimed_by_email}?subject=Proposal Confirmation – ${event?.event_type ?? 'Event'}`}
                  className="inline-block bg-primary border-2 border-dark rounded-xl px-5 py-2.5 font-bold uppercase tracking-widest text-sm text-dark"
                >
                  Confirm booking →
                </a>
              ) : (
                <span className="inline-block bg-base border-2 border-dark rounded-xl px-5 py-2.5 font-bold uppercase tracking-widest text-sm text-dark">
                  Contact venue to confirm
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu / additional info */}
      {sections.menu && (
        <div className="p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Additional Info
          </p>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark mb-3">
            Menus & Extras
          </h2>
          <p className="text-sm text-text-muted">
            Full menus, special packages, and optional extras available on request.
            Get in touch to discuss your specific requirements.
          </p>
        </div>
      )}
    </div>
  )
}
