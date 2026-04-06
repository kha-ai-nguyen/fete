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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function CalendarSection({ spaces }: { spaces: Space[] }) {
  const today = new Date()
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaces[0]?.id ?? '')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [loadingDate, setLoadingDate] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  async function toggleDate(day: number) {
    if (!selectedSpaceId) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setLoadingDate(dateStr)

    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ space_id: selectedSpaceId, date: dateStr }),
    })
    const json = await res.json()

    setBlocked((prev) => {
      const next = new Set(prev)
      if (json.blocked) next.add(dateStr)
      else next.delete(dateStr)
      return next
    })
    setLoadingDate(null)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  if (spaces.length === 0) {
    return <p className="text-text-muted text-sm">Add a space first to manage its calendar.</p>
  }

  return (
    <div className="space-y-4">
      {/* Space selector */}
      <select
        value={selectedSpaceId}
        onChange={(e) => { setSelectedSpaceId(e.target.value); setBlocked(new Set()) }}
        className="border-2 border-dark rounded-xl px-4 py-2.5 bg-white text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {spaces.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Month nav */}
      <div className="flex items-center gap-4">
        <button onClick={prevMonth} className="w-9 h-9 border-2 border-dark rounded-lg font-bold hover:bg-base-deep">‹</button>
        <span className="font-display font-bold text-lg uppercase">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="w-9 h-9 border-2 border-dark rounded-lg font-bold hover:bg-base-deep">›</button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-text-muted py-1">{d}</div>
        ))}
        {/* Empty cells for first week */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isBlocked = blocked.has(dateStr)
          const isLoading = loadingDate === dateStr
          const isPast = new Date(dateStr) < new Date(today.toDateString())

          return (
            <button
              key={day}
              onClick={() => !isPast && toggleDate(day)}
              disabled={isPast || isLoading}
              className={`aspect-square rounded-lg border-2 text-sm font-medium transition-colors ${
                isLoading
                  ? 'border-dark/30 bg-base-deep animate-pulse'
                  : isBlocked
                  ? 'border-dark bg-dark text-white hover:bg-secondary hover:border-secondary'
                  : isPast
                  ? 'border-dark/20 text-dark/30 cursor-not-allowed'
                  : 'border-dark/30 bg-white hover:bg-primary hover:border-primary'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-text-muted">
        Dark = blocked. Click to toggle. Changes save immediately.
      </p>

      {/* Google Calendar CTA (placeholder) */}
      <button
        disabled
        className="mt-2 flex items-center gap-2 px-4 py-2.5 border-2 border-dark/30 rounded-xl text-sm font-medium text-dark/40 cursor-not-allowed"
      >
        <span>📅</span> Sync Google Calendar <span className="text-xs ml-1">(coming soon)</span>
      </button>
    </div>
  )
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

type Section = 'spaces' | 'calendar' | 'terms'

export default function SpacesDashboard({
  venue,
  initialSpaces,
}: {
  venue: Venue
  initialSpaces: Space[]
}) {
  const [section, setSection] = useState<Section>('spaces')
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

  const navItems: { key: Section; label: string }[] = [
    { key: 'spaces', label: 'Spaces' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'terms', label: 'Payment terms' },
  ]

  return (
    <div className="min-h-screen bg-base">
      {/* Top bar */}
      <header className="border-b-2 border-dark bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted font-medium">{venue.neighbourhood}</p>
          <h1 className="font-display font-bold text-xl uppercase text-dark">{venue.name}</h1>
        </div>
        <span className="text-xs font-mono text-text-muted">{venue.slug}</span>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 border-r-2 border-dark min-h-[calc(100vh-65px)] bg-white pt-6 px-3">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold mb-1 transition-colors ${
                section === key
                  ? 'bg-dark text-white'
                  : 'text-dark hover:bg-base'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 px-8 py-8 max-w-3xl">
          {/* ── Spaces section ── */}
          {section === 'spaces' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl uppercase">Spaces</h2>
                <button
                  onClick={() => { setEditingSpace(null); setShowModal(true) }}
                  className="bg-primary border-2 border-dark text-dark font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-dark hover:text-primary transition-colors"
                >
                  + Add space
                </button>
              </div>

              {spaces.length === 0 ? (
                <p className="text-text-muted text-sm">No spaces yet. Add your first space above.</p>
              ) : (
                <div className="space-y-4">
                  {spaces.map((space) => (
                    <div
                      key={space.id}
                      className="bg-white border-2 border-dark rounded-2xl p-5 flex items-start justify-between gap-4"
                    >
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
                        {space.photos.length > 0 && (
                          <p className="text-xs text-text-muted mt-1">{space.photos.length} photo{space.photos.length !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSpace(space)
                            setShowModal(true)
                          }}
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
            </div>
          )}

          {/* ── Calendar section ── */}
          {section === 'calendar' && (
            <div>
              <h2 className="font-display font-bold text-2xl uppercase mb-6">Calendar</h2>
              <CalendarSection spaces={spaces} />
            </div>
          )}

          {/* ── Payment terms section ── */}
          {section === 'terms' && (
            <div>
              <h2 className="font-display font-bold text-2xl uppercase mb-6">Payment terms</h2>
              <p className="text-sm text-text-muted mb-6">
                Venue-level defaults apply to all spaces unless overridden per space.
                Edit individual spaces in the Spaces section to set space-level terms.
              </p>
              <div className="space-y-4">
                {spaces.map((space) => (
                  <div key={space.id} className="bg-white border-2 border-dark rounded-2xl p-5">
                    <h3 className="font-display font-bold text-lg uppercase mb-3">{space.name}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Deposit</p>
                        <p className="font-semibold text-dark">
                          {space.payment_deposit_pct ? `${space.payment_deposit_pct}%` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Min spend</p>
                        <p className="font-semibold text-dark">
                          {space.payment_min_spend ? `£${space.payment_min_spend.toLocaleString()}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted uppercase tracking-wide text-xs font-medium mb-1">Pay ahead</p>
                        <p className="font-semibold text-dark">
                          {space.payment_pay_ahead ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {spaces.length === 0 && (
                  <p className="text-text-muted text-sm">No spaces yet.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
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
