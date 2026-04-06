import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/client'
import { getSpacesByVenue } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

async function getVenueBySlug(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('venues')
    .select('id, name, slug, neighbourhood')
    .eq('slug', slug)
    .single()
  return data
}

export default async function PaymentTermsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const spaces = await getSpacesByVenue(venue.id)

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
          {venue.neighbourhood}
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">
          Payment Terms
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Payment terms are set per space. Edit a space to update its terms.
        </p>
      </div>

      {spaces.length === 0 ? (
        <div className="bg-white border-2 border-dark rounded-2xl p-10 text-center">
          <p className="font-display font-bold text-xl uppercase text-dark mb-2">No spaces yet</p>
          <p className="text-text-muted text-sm mb-4">Add spaces to set payment terms.</p>
          <Link
            href={`/dashboard/${slug}/spaces`}
            className="inline-block bg-primary border-2 border-dark text-dark font-semibold px-5 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
          >
            Go to Spaces →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white border-2 border-dark rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl uppercase text-dark">
                  {space.name}
                </h3>
                <Link
                  href={`/dashboard/${slug}/spaces`}
                  className="text-xs font-semibold border-2 border-dark px-3 py-1.5 rounded-lg hover:bg-primary transition-colors"
                >
                  Edit
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-base rounded-xl p-3 border border-dark/10">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1">
                    Deposit
                  </p>
                  <p className="font-display font-bold text-xl text-dark">
                    {space.payment_deposit_pct ? `${space.payment_deposit_pct}%` : '—'}
                  </p>
                </div>
                <div className="bg-base rounded-xl p-3 border border-dark/10">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1">
                    Min spend
                  </p>
                  <p className="font-display font-bold text-xl text-dark">
                    {space.payment_min_spend
                      ? `£${space.payment_min_spend.toLocaleString()}`
                      : '—'}
                  </p>
                </div>
                <div className="bg-base rounded-xl p-3 border border-dark/10">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1">
                    Pay upfront
                  </p>
                  <p className="font-display font-bold text-xl text-dark">
                    {space.payment_pay_ahead ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
