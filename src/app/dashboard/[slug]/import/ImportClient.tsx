'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExtractedVenueData } from '@/types'
import PDFUploadWidget from '@/components/PDFUploadWidget'
import ExtractedDataReview from '@/components/ExtractedDataReview'

type Step = 'upload' | 'review' | 'success'

type Props = {
  slug: string
  venueName: string
}

export default function ImportClient({ slug, venueName }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [extractedData, setExtractedData] = useState<ExtractedVenueData | null>(null)

  function handleExtracted(data: ExtractedVenueData) {
    setExtractedData(data)
    setStep('review')
  }

  function handleReset() {
    setExtractedData(null)
    setStep('upload')
  }

  function handleSaved() {
    setStep('success')
  }

  if (step === 'upload') {
    return (
      <PDFUploadWidget slug={slug} onExtracted={handleExtracted} />
    )
  }

  if (step === 'review' && extractedData) {
    return (
      <div className="space-y-6">
        <div className="bg-primary/20 border-2 border-primary rounded-xl px-4 py-3">
          <p className="text-sm font-bold text-dark">
            Felicity extracted {extractedData.spaces?.length ?? 0} space{extractedData.spaces?.length !== 1 ? 's' : ''} from your brochure.
            Review and edit below before saving.
          </p>
        </div>
        <ExtractedDataReview
          data={extractedData}
          slug={slug}
          onSaved={handleSaved}
          onReset={handleReset}
        />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="bg-white border-2 border-dark rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-2xl border-2 border-dark flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl uppercase text-dark">
            Spaces are live!
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Your spaces have been imported from the brochure.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href={`/dashboard/${slug}/spaces`}
            className="bg-primary border-2 border-dark rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-sm text-dark hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all"
          >
            View spaces →
          </Link>
          <button
            onClick={handleReset}
            className="border-2 border-dark rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-sm text-dark hover:bg-base-deep transition-colors"
          >
            Import another
          </button>
        </div>
      </div>
    )
  }

  return null
}
