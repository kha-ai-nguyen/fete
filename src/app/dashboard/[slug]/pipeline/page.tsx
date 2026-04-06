import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/client'
import PipelineClient from './PipelineClient'

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

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  return <PipelineClient venueName={venue.name} slug={slug} />
}
