import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/client'
import ImportClient from './ImportClient'

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

export default async function ImportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
          {venue.neighbourhood}
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">Import Brochure</h1>
        <p className="text-sm text-text-muted mt-1">
          Upload your events brochure and Felicity will extract your spaces automatically.
        </p>
      </div>

      <ImportClient slug={slug} venueName={venue.name} />
    </div>
  )
}
