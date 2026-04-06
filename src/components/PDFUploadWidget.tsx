'use client'

import { useRef, useState } from 'react'
import { ExtractedVenueData } from '@/types'

type Props = {
  slug: string
  onExtracted: (data: ExtractedVenueData) => void
}

export default function PDFUploadWidget({ slug, onExtracted }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.')
      return
    }

    setIsLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`/api/venues/${slug}/extract-pdf`, {
        method: 'POST',
        body: form,
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Extraction failed. Please try again.')
        return
      }

      onExtracted(json.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 bg-white border-2 border-dark rounded-2xl p-16 text-center">
        <div className="w-10 h-10 border-4 border-dark border-t-primary rounded-full animate-spin" />
        <div>
          <p className="font-display font-bold text-xl uppercase text-dark">
            Felicity is reading your brochure…
          </p>
          <p className="text-sm text-text-muted mt-1">Usually takes under 10 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`
          flex flex-col items-center justify-center gap-4 cursor-pointer
          border-2 border-dashed rounded-2xl p-16 text-center transition-colors
          ${isDragOver
            ? 'border-primary bg-base-deep'
            : 'border-dark bg-white hover:bg-base/30'
          }
        `}
      >
        <div className="w-14 h-14 bg-base rounded-xl border-2 border-dark flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-2xl uppercase text-dark">
            Drop your events brochure here
          </p>
          <p className="text-sm text-text-muted mt-1">PDF only · up to 10MB</p>
          <p className="text-xs text-text-muted mt-3 underline">or click to browse</p>
        </div>
      </div>

      {error && (
        <div className="bg-white border-2 border-secondary rounded-xl px-4 py-3 text-sm text-dark">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
