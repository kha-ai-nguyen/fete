import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/client'
import VenueNav from '@/components/VenueNav'

async function getVenueBySlug(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('venues')
    .select('id, name, slug, neighbourhood')
    .eq('slug', slug)
    .single()
  return data
}

export default async function VenueDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <VenueNav slug={slug} venueName={venue.name} />
      <main className="flex-1 md:ml-[250px] min-h-full">
        {children}
      </main>
    </div>
  )
}
