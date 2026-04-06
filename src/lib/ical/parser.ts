import ical from 'node-ical'

export interface ParsedEvent {
  uid: string
  title: string | null
  starts_at: Date
  ends_at: Date
  all_day: boolean
}

/**
 * Fetches and parses an iCal (.ics) feed from a URL.
 * Works with both Google Calendar public iCal URLs and any standard iCal feed.
 */
export async function parseIcalFeed(url: string): Promise<ParsedEvent[]> {
  const events = await ical.async.fromURL(url)
  const parsed: ParsedEvent[] = []

  for (const [, component] of Object.entries(events)) {
    if (!component || component.type !== 'VEVENT') continue

    const event = component as ical.VEvent
    if (!event.start) continue

    const starts_at = event.start instanceof Date ? event.start : new Date(event.start)
    const ends_at = event.end
      ? event.end instanceof Date
        ? event.end
        : new Date(event.end)
      : starts_at

    // Detect all-day events: ical marks them with dateOnly or the
    // start value is a "date" type string (YYYYMMDD without time).
    const allDay =
      (event.start as ical.DateWithTimeZone)?.dateOnly === true ||
      (typeof event.datetype === 'string' && event.datetype === 'date')

    // summary can be a plain string or { val: string, params: ... }
    const rawSummary = event.summary
    const title =
      rawSummary == null
        ? null
        : typeof rawSummary === 'string'
          ? rawSummary
          : rawSummary.val

    parsed.push({
      uid: event.uid ?? crypto.randomUUID(),
      title,
      starts_at,
      ends_at,
      all_day: allDay,
    })
  }

  return parsed
}

/**
 * Validates that a URL looks like a plausible iCal feed URL.
 */
export function isValidIcalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
