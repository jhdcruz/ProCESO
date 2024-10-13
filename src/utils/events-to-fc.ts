import { EventSourceInput } from '@fullcalendar/core';
import sanitizeHtml from 'sanitize-html';
import type { EventSeriesResponse } from '@/libs/supabase/api/_response';

/**
 * Transforms events list from events schema to FullCalendar schema.
 *
 * @param events - The events list to transform.
 */
export function eventsToFc(
  events?: EventSeriesResponse['data'],
): EventSourceInput[] {
  if (!events) return [];

  return events.map((event) => ({
    id: event!.id,
    color: event!.series_data?.color ?? undefined,
    title: event!.title,
    start: new Date(event!.date_starting as string),
    end: new Date(event!.date_ending as string),
    description: sanitizeHtml(event!.description!, { allowedTags: [] }),
    url: `/portal/events/${event!.id}/info`,
    allDay:
      // TODO: Improve allDay check logic, this is unreliable.
      // check if event is all day if start and end time is 00:00
      event?.date_starting?.includes('00:00') &&
      event?.date_ending?.includes('00:00'),
  }));
}
