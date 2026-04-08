import { notFound } from 'next/navigation'
import { getBookerEvent } from '@/lib/supabase/queries'
import { createServiceClient } from '@/lib/supabase/client'
import BookerNav from '@/components/BookerNav'
import ResultsGrid from './ResultsGrid'
import { generateMockSpaces, type ResultSpace } from './mockSpaces'
import type { Space } from '@/types'

export const dynamic = 'force-dynamic'

// Fake distances for v0 (no geo data in DB yet)
const FAKE_DISTANCES = [0.2, 0.5, 0.8, 1.1, 1.5, 1.9, 2.4, 3.0, 3.7, 4.2]

async function getSpacesForEvent(params: {
  headcount: number
  budgetMax: number | null
  dateFrom: string | null
  dateTo: string | null
}) {
  const supabase = createServiceClient()

  let query = supabase
    .from('spaces')
    .select('*, venue:venues(id, name, neighbourhood)')
    .order('base_price', { ascending: true })

  if (params.headcount) query = query.gte('capacity', params.headcount)
  if (params.budgetMax) query = query.lte('base_price', params.budgetMax)

  const { data: spaces, error } = await query
  if (error || !spaces) return { spaces: [], blockedIds: new Set<string>() }

  // Find blocked space IDs for the date range
  let blockedIds = new Set<string>()
  if (params.dateFrom && spaces.length > 0) {
    const spaceIds = spaces.map((s: Space) => s.id)
    let blockQuery = supabase
      .from('availability')
      .select('space_id')
      .in('space_id', spaceIds)
      .gte('blocked_date', params.dateFrom)

    if (params.dateTo) {
      blockQuery = blockQuery.lte('blocked_date', params.dateTo)
    } else {
      blockQuery = blockQuery.eq('blocked_date', params.dateFrom)
    }

    const { data: blocks } = await blockQuery
    blockedIds = new Set((blocks ?? []).map((b: { space_id: string }) => b.space_id))
  }

  return { spaces, blockedIds }
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const event = await getBookerEvent(id)
  if (!event) notFound()

  const effectiveDateFrom = sp.dateFrom ?? event.date_from
  const effectiveDateTo = sp.dateTo ?? event.date_to

  const { spaces: dbSpaces, blockedIds } = await getSpacesForEvent({
    headcount: event.headcount,
    budgetMax: event.budget_per_head_max,
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo,
  })

  // Convert DB spaces to ResultSpace format
  const dbResultSpaces: ResultSpace[] = dbSpaces.map(
    (space: Space & { venue: { id: string; name: string; neighbourhood: string } }, i: number) => ({
      ...space,
      available: !blockedIds.has(space.id),
      distance_km: FAKE_DISTANCES[i % FAKE_DISTANCES.length],
      total_price: space.base_price * event.headcount + (space.payment_min_spend ?? 0),
    })
  )

  // Use mock data to fill up to 50 spaces for a rich visual experience
  const mockSpaces = generateMockSpaces(event.headcount)
  const allSpaces = dbResultSpaces.length > 0
    ? [...dbResultSpaces, ...mockSpaces.slice(dbResultSpaces.length)]
    : mockSpaces

  return (
    <>
      <BookerNav />
      <main className="md:ml-[250px] px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              Results
            </p>
            <h1 className="font-display font-extrabold text-4xl uppercase text-dark">
              Available spaces
            </h1>
          </div>

          <ResultsGrid
            spaces={allSpaces}
            event={event}
            dateFrom={sp.dateFrom ?? null}
            dateTo={sp.dateTo ?? null}
          />
        </div>
      </main>
    </>
  )
}
