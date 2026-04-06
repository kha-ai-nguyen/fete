'use client'

import { useState } from 'react'
import type { Space } from '@/types'

type Venue = { id: string; name: string; slug: string; neighbourhood: string }

type SpaceFormData = {
  name: string
  capacity: string
  base_price: string
  photos: string
  payment_deposit_pct: string
  payment_min_spend: string
  payment_pay_ahead: boolean
}

const EMPTY_FORM: SpaceFormData = {
  name: '',
  capacity: '',
  base_price: '',
  photos: '',
  payment_deposit_pct: '',
  payment_min_spend: '',
  payment_pay_ahead: false,
}

function SpaceModal({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial?: SpaceFormData
  onSave: (data: SpaceFormData) => void
  onClose: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<SpaceFormData>(initial ?? EMPTY_FORM)
  function set(field: keyof SpaceFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white border-2 border-dark rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-2xl uppercase mb-5">
          {initial ? 'Edit space' : 'Add space'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Space name</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Private Dining Room"
              className="w-full border-2 border-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Capacity</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
                placeholder="e.g. 60"
                className="w-full border-2 border-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Price/head (£)</label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => set('base_price', e.target.value)}
                placeholder="e.g. 75"
                className="w-full border-2 border-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Photo URLs <span className="font-normal text-text-muted">(comma-separated)</span>
            </label>
            <textarea
              value={form.photos}
              onChange={(e) => set('photos', e.target.value)}
              placeholder="https://example.com/photo1.jpg, https://…"
              rows={2}
              className="w-full border-2 border-dark rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="border-t-2 border-dark/10 pt-4">
            <p className="text-sm font-semibold mb-3">Payment terms</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Deposit %</label>
                <input
                  type="number"
                  value={form.payment_deposit_pct}
                  onChange={(e) => set('payment_deposit_pct', e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full border-2 border-dark rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Min spend (£)</label>
                <input
                  type="number"
                  value={form.payment_min_spend}
                  onChange={(e) => set('payment_min_spend', e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full border-2 border-dark rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.payment_pay_ahead}
                onChange={(e) => set('payment_pay_ahead', e.target.checked)}
                className="w-4 h-4 accent-dark"
              />
              <span className="text-sm font-medium">Full payment required upfront</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            disabled={loading}
            className="flex-1 bg-dark text-white font-display font-bold uppercase py-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save space'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 border-2 border-dark rounded-xl font-semibold hover:bg-base-deep"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SpacesDashboard({
  venue,
  initialSpaces,
}: {
  venue: Venue
  initialSpaces: Space[]
}) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces)
  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  async function handleSave(form: SpaceFormData) {
    setModalLoading(true)
    const photos = form.photos
      ? form.photos.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const payload = {
      name: form.name,
      capacity: parseInt(form.capacity) || 0,
      base_price: parseInt(form.base_price) || 0,
      photos,
      payment_deposit_pct: form.payment_deposit_pct ? parseInt(form.payment_deposit_pct) : null,
      payment_min_spend: form.payment_min_spend ? parseInt(form.payment_min_spend) : null,
      payment_pay_ahead: form.payment_pay_ahead,
    }

    if (editingSpace) {
      const res = await fetch(`/api/spaces/${editingSpace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const updated = await res.json()
      setSpaces((prev) => prev.map((s) => (s.id === editingSpace.id ? updated : s)))
    } else {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, venue_id: venue.id }),
      })
      const created = await res.json()
      setSpaces((prev) => [...prev, created])
    }

    setShowModal(false)
    setEditingSpace(null)
    setModalLoading(false)
  }

  async function handleDelete(spaceId: string) {
    if (!confirm('Delete this space? This cannot be undone.')) return
    await fetch(`/api/spaces/${spaceId}`, { method: 'DELETE' })
    setSpaces((prev) => prev.filter((s) => s.id !== spaceId))
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
            {venue.neighbourhood}
          </p>
          <h2 className="font-display font-bold text-3xl uppercase text-dark">Spaces</h2>
        </div>
        <button
          onClick={() => { setEditingSpace(null); setShowModal(true) }}
          className="bg-primary border-2 border-dark text-dark font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
        >
          + Add space
        </button>
      </div>

      {spaces.length === 0 ? (
        <div className="bg-white border-2 border-dark rounded-2xl p-10 text-center">
          <p className="font-display font-bold text-xl uppercase text-dark mb-2">No spaces yet</p>
          <p className="text-text-muted text-sm mb-4">Add your first space to start receiving proposals.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary border-2 border-dark text-dark font-semibold px-5 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
          >
            + Add space
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="bg-white border-2 border-dark rounded-2xl p-5 flex items-start justify-between gap-4"
            >
              {/* Photo strip */}
              {space.photos.length > 0 && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-dark shrink-0">
                  <img
                    src={space.photos[0]}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg uppercase truncate">{space.name}</h3>
                <div className="flex gap-4 text-sm text-text-muted mt-1 flex-wrap">
                  <span>Up to <strong className="text-dark">{space.capacity}</strong> guests</span>
                  <span><strong className="text-dark">£{space.base_price}</strong>/head</span>
                  {space.payment_deposit_pct && (
                    <span>{space.payment_deposit_pct}% deposit</span>
                  )}
                  {space.payment_min_spend && (
                    <span>£{space.payment_min_spend.toLocaleString()} min</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setEditingSpace(space); setShowModal(true) }}
                  className="px-3 py-1.5 border-2 border-dark rounded-lg text-sm font-medium hover:bg-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(space.id)}
                  className="px-3 py-1.5 border-2 border-dark rounded-lg text-sm font-medium hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <SpaceModal
          initial={
            editingSpace
              ? {
                  name: editingSpace.name,
                  capacity: String(editingSpace.capacity),
                  base_price: String(editingSpace.base_price),
                  photos: editingSpace.photos.join(', '),
                  payment_deposit_pct: editingSpace.payment_deposit_pct
                    ? String(editingSpace.payment_deposit_pct)
                    : '',
                  payment_min_spend: editingSpace.payment_min_spend
                    ? String(editingSpace.payment_min_spend)
                    : '',
                  payment_pay_ahead: editingSpace.payment_pay_ahead,
                }
              : undefined
          }
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingSpace(null) }}
          loading={modalLoading}
        />
      )}
    </div>
  )
}
