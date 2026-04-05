'use client'

import { useState } from 'react'
import type { Venue } from '@/types'

interface Props {
  venue: Venue
}

export default function ProfileEditor({ venue }: Props) {
  const [description, setDescription] = useState(venue.description ?? '')
  const [priceEstimate, setPriceEstimate] = useState(venue.price_estimate ?? '')
  const [capacityMax, setCapacityMax] = useState<string>(
    venue.capacity_max != null ? String(venue.capacity_max) : ''
  )
  const [neighbourhood, setNeighbourhood] = useState(venue.neighbourhood ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/venue/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: venue.id,
          description: description || null,
          price_estimate: priceEstimate || null,
          capacity_max: capacityMax ? parseInt(capacityMax, 10) : null,
          neighbourhood: neighbourhood || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed')
      setStatus('error')
    }
  }

  return (
    <div>
      <h2 className="font-display font-extrabold uppercase text-xl text-[#1A1A1A] mb-6">
        Profile
      </h2>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#6B5068] mb-1">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the venue — atmosphere, history, what makes it special…"
            className="w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm outline-none focus:border-[#CDEA2D] resize-none transition-colors"
          />
        </div>

        {/* Price estimate */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#6B5068] mb-1">
            Price estimate
          </label>
          <input
            type="text"
            value={priceEstimate}
            onChange={e => setPriceEstimate(e.target.value)}
            placeholder="e.g. £75/head or £££"
            className="w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm outline-none focus:border-[#CDEA2D] transition-colors"
          />
        </div>

        {/* Max capacity */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#6B5068] mb-1">
            Max capacity
          </label>
          <input
            type="number"
            min={1}
            value={capacityMax}
            onChange={e => setCapacityMax(e.target.value)}
            placeholder="e.g. 200"
            className="w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm outline-none focus:border-[#CDEA2D] transition-colors"
          />
        </div>

        {/* Neighbourhood */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#6B5068] mb-1">
            Neighbourhood / location
          </label>
          <input
            type="text"
            value={neighbourhood}
            onChange={e => setNeighbourhood(e.target.value)}
            placeholder="e.g. Shoreditch, East London"
            className="w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm outline-none focus:border-[#CDEA2D] transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="bg-[#CDEA2D] border-2 border-[#1A1A1A] font-bold uppercase px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>

          {status === 'success' && (
            <span className="text-sm font-medium text-green-700">Saved successfully.</span>
          )}
          {status === 'error' && (
            <span className="text-sm font-medium text-[#FF2D9B]">{errorMsg}</span>
          )}
        </div>
      </form>
    </div>
  )
}
