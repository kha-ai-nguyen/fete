import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/client'
import { getConversation } from '@/lib/supabase/queries'
import ProposalBuilder from '@/components/ProposalBuilder'
import { Conversation } from '@/types'

export const dynamic = 'force-dynamic'

async function getFullVenue(venueId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('venues')
    .select('id, name, slug, neighbourhood, description, website, claimed_by_email, claimed_by_name')
    .eq('id', venueId)
    .single()
  return data
}

export default async function ProposalBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ conversation_id?: string }>
}) {
  const { slug } = await params
  const { conversation_id } = await searchParams

  if (!conversation_id) {
    return (
      <div className="px-8 py-8 max-w-3xl">
        <div className="bg-white border-2 border-dark rounded-2xl p-10 text-center">
          <p className="font-display font-bold text-xl uppercase text-dark mb-2">
            No conversation selected
          </p>
          <p className="text-sm text-text-muted">
            Open a proposal from the{' '}
            <a href={`/dashboard/${slug}/proposals`} className="underline text-dark">
              Proposals page
            </a>{' '}
            to generate a proposal.
          </p>
        </div>
      </div>
    )
  }

  const conversation = await getConversation(conversation_id)
  if (!conversation) notFound()

  // Fetch full venue data (including contact email, website) separately
  const fullVenue = conversation.venue_id ? await getFullVenue(conversation.venue_id) : null

  // Merge full venue data into conversation
  const enrichedConversation: Conversation = {
    ...conversation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    venue: (fullVenue as any) ?? conversation.venue,
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
          Proposal builder
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">
          Generate Proposal
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Toggle sections on or off, then download as PDF.
        </p>
      </div>

      <ProposalBuilder conversation={enrichedConversation} slug={slug} />
    </div>
  )
}
