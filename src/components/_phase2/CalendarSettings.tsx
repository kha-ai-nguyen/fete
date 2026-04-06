// PHASE 2 — not yet wired to routing
'use client'

import { useState } from 'react'
import type { CalendarType } from '@/types'

interface CalendarSettingsProps {
  venueId: string
  currentType: CalendarType | null
  currentUrl: string | null
  lastSyncedAt: string | null
}

export default function CalendarSettings({
  venueId,
  currentType,
  currentUrl,
  lastSyncedAt,
}: CalendarSettingsProps) {
  const [calendarType, setCalendarType] = useState<CalendarType | null>(currentType)
  const [icalUrl, setIcalUrl] = useState(currentUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/venues/${venueId}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendar_type: calendarType,
          ical_url: icalUrl || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error ?? 'Failed to save', isError: true })
      } else {
        setMessage({ text: 'Calendar settings saved', isError: false })
      }
    } catch {
      setMessage({ text: 'Network error', isError: true })
    } finally {
      setSaving(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_id: venueId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error ?? 'Sync failed', isError: true })
      } else {
        const result = data.results?.[0]
        if (result?.error) {
          setMessage({ text: `Sync error: ${result.error}`, isError: true })
        } else {
          setMessage({
            text: `Synced ${result?.events_synced ?? 0} events`,
            isError: false,
          })
        }
      }
    } catch {
      setMessage({ text: 'Network error', isError: true })
    } finally {
      setSyncing(false)
    }
  }

  function handleDisconnect() {
    setCalendarType(null)
    setIcalUrl('')
  }

  return (
    <div className="bg-card border-2 border-dark rounded-lg p-6 space-y-6">
      <h2 className="font-display font-extrabold text-xl uppercase text-dark">
        Calendar Sync
      </h2>

      {/* Calendar type selector */}
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold block mb-2">
          Calendar Type
        </label>
        <div className="flex gap-2">
          {(['google', 'ical'] as CalendarType[]).map((type) => (
            <button
              key={type}
              onClick={() => setCalendarType(type)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-2 rounded-md transition-colors ${
                calendarType === type
                  ? 'bg-primary text-dark border-dark'
                  : 'bg-white text-dark border-dark hover:bg-secondary hover:text-white hover:border-secondary'
              }`}
            >
              {type === 'google' ? 'Google Calendar' : 'iCal Feed'}
            </button>
          ))}
        </div>
      </div>

      {/* URL input */}
      {calendarType && (
        <div>
          <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold block mb-2">
            {calendarType === 'google'
              ? 'Google Calendar iCal URL'
              : 'iCal Feed URL'}
          </label>
          <input
            type="url"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder={
              calendarType === 'google'
                ? 'https://calendar.google.com/calendar/ical/…/basic.ics'
                : 'https://example.com/calendar.ics'
            }
            className="w-full bg-white border-2 border-dark rounded-md px-4 py-3 text-sm text-dark placeholder:text-text-muted focus:bg-primary/10 focus:outline-none"
          />
          {calendarType === 'google' && (
            <p className="text-[10px] text-text-muted mt-2">
              In Google Calendar: Settings → your calendar → Integrate → Secret
              address in iCal format
            </p>
          )}
        </div>
      )}

      {/* Sync status */}
      {lastSyncedAt && (
        <div className="border-2 border-dark rounded-sm bg-white p-3">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
            Last Synced
          </span>
          <span className="text-sm font-bold text-dark">
            {new Date(lastSyncedAt).toLocaleString()}
          </span>
        </div>
      )}

      {/* Status message */}
      {message && (
        <p
          className={`text-sm font-medium ${
            message.isError ? 'text-secondary' : 'text-dark'
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary border-2 border-dark text-dark font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-md hover:bg-secondary hover:text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>

        {calendarType && icalUrl && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-dark border-2 border-dark text-primary font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-md hover:bg-secondary hover:text-white transition-colors disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        )}

        {calendarType && (
          <button
            onClick={handleDisconnect}
            className="text-[10px] font-bold uppercase tracking-widest text-dark hover:text-secondary underline transition-colors px-2 py-3"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  )
}
