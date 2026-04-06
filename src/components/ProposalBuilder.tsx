'use client'

import { useState } from 'react'
import { Conversation, ProposalSections } from '@/types'
import ProposalPreview from './ProposalPreview'

type Props = {
  conversation: Conversation
  slug: string
}

const SECTION_CONFIG: { key: keyof ProposalSections; label: string; description: string }[] = [
  { key: 'coverPage', label: 'Cover page', description: 'Event type, date, headcount, and venue name' },
  { key: 'spaceDetails', label: 'Space details', description: 'Photos, capacity, and room description' },
  { key: 'pricingBreakdown', label: 'Pricing breakdown', description: 'Per-head price, subtotal, minimum spend, and total' },
  { key: 'paymentTerms', label: 'Payment terms', description: 'Deposit %, pay-ahead requirements, cancellation policy' },
  { key: 'contact', label: 'Contact & next steps', description: 'Venue contact details and confirmation CTA' },
  { key: 'menu', label: 'Menu / additional info', description: 'Optional menus, packages, and special offers' },
]

export default function ProposalBuilder({ conversation, slug }: Props) {
  const [sections, setSections] = useState<ProposalSections>({
    coverPage: true,
    spaceDetails: true,
    pricingBreakdown: true,
    paymentTerms: true,
    contact: true,
    menu: false,
  })
  const [isDownloading, setIsDownloading] = useState(false)

  function toggle(key: keyof ProposalSections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function downloadPdf() {
    setIsDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('proposal-preview')
      if (!element) return

      await html2pdf()
        .set({
          margin: 0,
          filename: `fete-proposal-${slug}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } finally {
      setIsDownloading(false)
    }
  }

  const activeCount = Object.values(sections).filter(Boolean).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left: controls */}
      <div className="space-y-4">
        <div className="bg-white border-2 border-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-dark bg-base">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {activeCount} of {SECTION_CONFIG.length} sections selected
            </p>
            <h2 className="font-display font-bold text-xl uppercase text-dark">
              Proposal sections
            </h2>
          </div>

          <div className="divide-y-2 divide-dark/10">
            {SECTION_CONFIG.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-base/30 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 border-2 border-dark rounded accent-primary"
                  />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${sections[key] ? 'text-dark' : 'text-text-muted'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadPdf}
            disabled={isDownloading || activeCount === 0}
            className="flex-1 bg-primary border-2 border-dark rounded-xl px-5 py-3 font-bold uppercase tracking-widest text-sm text-dark hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button
            title="Coming soon"
            className="flex-1 bg-secondary border-2 border-dark rounded-xl px-5 py-3 font-bold uppercase tracking-widest text-sm text-white opacity-50 cursor-not-allowed"
          >
            Send to booker
          </button>
        </div>

        <p className="text-xs text-text-muted text-center">"Send to booker" is coming soon</p>
      </div>

      {/* Right: preview */}
      <div className="sticky top-20">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Live preview
          </p>
          <span className="text-[10px] text-text-muted">A4 format</span>
        </div>
        <div className="max-h-[80vh] overflow-y-auto rounded-2xl border-2 border-dark">
          <ProposalPreview sections={sections} conversation={conversation} />
        </div>
      </div>
    </div>
  )
}
