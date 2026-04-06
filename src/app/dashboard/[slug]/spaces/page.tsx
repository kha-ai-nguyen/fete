import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/client'
import { getSpacesByVenue } from '@/lib/supabase/queries'
import SpacesDashboard from './SpacesDashboard'

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

export default async function SpacesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const spaces = await getSpacesByVenue(venue.id)

  return <SpacesDashboard venue={venue} initialSpaces={spaces} />
}
