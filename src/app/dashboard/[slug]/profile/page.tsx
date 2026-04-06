'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type VenueProfile = {
  id: string
  name: string
  slug: string
  neighbourhood: string
  description: string | null
  website: string | null
  price_estimate: string | null
  capacity_min: number | null
  capacity_max: number | null
}

export default function VenueProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [venue, setVenue] = useState<VenueProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    neighbourhood: '',
    description: '',
    website: '',
    price_estimate: '',
    capacity_max: '',
  })

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/venue-by-slug?slug=${slug}`)
      const data = await res.json()
      if (data?.id) {
        setVenue(data)
        setForm({
          name: data.name ?? '',
          neighbourhood: data.neighbourhood ?? '',
          description: data.description ?? '',
          website: data.website ?? '',
          price_estimate: data.price_estimate ?? '',
          capacity_max: data.capacity_max ? String(data.capacity_max) : '',
        })
      }
      setLoading(false)
    }
    load()
  }, [slug])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!venue) return
    setSaving(true)

    await fetch('/api/venue/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId: venue.id,
        description: form.description || null,
        price_estimate: form.price_estimate || null,
        capacity_max: form.capacity_max ? parseInt(form.capacity_max) : null,
        neighbourhood: form.neighbourhood || null,
      }),
    })

    setSaving(false)
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="px-8 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-base-deep rounded-xl w-48" />
          <div className="h-4 bg-base-deep rounded w-full" />
          <div className="h-4 bg-base-deep rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="px-8 py-8">
        <p className="text-text-muted">Venue not found.</p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
          Venue settings
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase text-dark">Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Name (read-only for now) */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Venue name</label>
          <div className="w-full border-2 border-dark/30 rounded-xl px-4 py-3 bg-base text-dark/60 font-medium text-sm">
            {form.name}
          </div>
          <p className="text-xs text-text-muted mt-1">Contact support to change your venue name.</p>
        </div>

        {/* Neighbourhood */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Neighbourhood</label>
          <input
            value={form.neighbourhood}
            onChange={(e) => set('neighbourhood', e.target.value)}
            placeholder="e.g. Shoreditch"
            className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Tell bookers what makes your venue special…"
            rows={4}
            className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm leading-relaxed"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Website</label>
          <input
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://yourvenue.com"
            type="url"
            className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Price estimate + Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Price estimate
            </label>
            <select
              value={form.price_estimate}
              onChange={(e) => set('price_estimate', e.target.value)}
              className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select…</option>
              <option value="£">£ (under £50/head)</option>
              <option value="££">££ (£50–£100/head)</option>
              <option value="£££">£££ (£100–£200/head)</option>
              <option value="££££">££££ (£200+/head)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Max capacity</label>
            <input
              type="number"
              value={form.capacity_max}
              onChange={(e) => set('capacity_max', e.target.value)}
              placeholder="e.g. 150"
              className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-dark text-white font-display font-bold uppercase px-8 py-3 rounded-xl border-2 border-dark hover:bg-secondary hover:border-secondary transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && (
            <span className="text-sm font-semibold text-dark bg-primary px-3 py-1.5 rounded-lg border-2 border-dark">
              Saved ✓
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
