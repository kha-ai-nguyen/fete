'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BookerNav from '@/components/BookerNav'

const EVENT_TYPES = [
  'Alumni dinner',
  'Wedding',
  'Corporate',
  'Party',
  'Workshop',
  'Birthday',
  'Exhibition',
  'Other',
]

const RADIUS_OPTIONS = [1, 2, 3, 4, 5]

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    event_type: '',
    headcount: '',
    budget_per_head_max: '',
    date_from: '',
    date_to: '',
    postcode: '',
    radius_km: 5,
  })

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: form.event_type,
        headcount: parseInt(form.headcount),
        budget_per_head_max: form.budget_per_head_max ? parseInt(form.budget_per_head_max) : null,
        date_from: form.date_from || null,
        date_to: form.date_to || null,
        postcode: form.postcode || null,
        radius_km: form.radius_km,
      }),
    })

    const json = await res.json()
    if (json.id) {
      router.push(`/events/${json.id}`)
    }
    setLoading(false)
  }

  return (
    <>
      <BookerNav />
      <main className="md:ml-[250px] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-widest font-medium text-text-muted mb-2">
          New event
        </p>
        <h1 className="font-display font-extrabold text-4xl uppercase text-dark mb-8">
          Tell us about your event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event type */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Event type
            </label>
            <select
              required
              value={form.event_type}
              onChange={(e) => set('event_type', e.target.value)}
              className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select type…</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Headcount + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Guests
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 60"
                value={form.headcount}
                onChange={(e) => set('headcount', e.target.value)}
                className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Budget /head (£)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 80"
                value={form.budget_per_head_max}
                onChange={(e) => set('budget_per_head_max', e.target.value)}
                className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                From date
              </label>
              <input
                type="date"
                value={form.date_from}
                onChange={(e) => set('date_from', e.target.value)}
                className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                To date <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <input
                type="date"
                value={form.date_to}
                onChange={(e) => set('date_to', e.target.value)}
                className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Postcode + Radius */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Location postcode
            </label>
            <input
              type="text"
              placeholder="e.g. EC1A 1BB"
              value={form.postcode}
              onChange={(e) => set('postcode', e.target.value.toUpperCase())}
              className="w-full border-2 border-dark rounded-xl px-4 py-3 bg-white text-dark font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Search radius
            </label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('radius_km', r)}
                  className={`flex-1 py-2.5 rounded-xl border-2 border-dark text-sm font-semibold transition-colors ${
                    form.radius_km === r
                      ? 'bg-primary text-dark'
                      : 'bg-white text-dark hover:bg-base-deep'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-white font-display font-bold text-lg uppercase py-4 rounded-xl border-2 border-dark hover:bg-secondary hover:border-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Find spaces →'}
          </button>
        </form>
      </div>
      </main>
    </>
  )
}
