import { EventSourceInput } from '@fullcalendar/core';
import sanitizeHtml from 'sanitize-html';
import type { Tables } from '@/libs/supabase/_database';

/**
 * Transforms events list from events schema to FullCalendar schema.
 *
 * @param events - The events list to transform.
 */
export function eventsToFc(
  events: Tables<'events_details_view'>[],
): EventSourceInput[] {
  return events.map((event) => ({
    id: event.id!,
    color: event.series_color!,
    title: event.title,
    start: new Date(event.date_starting!),
    end: new Date(event.date_ending!),
    description: sanitizeHtml(event.description!, { allowedTags: [] }),
    url: `/portal/events/${event.id}/info`,
    allDay:
      // TODO: Improve allDay check logic, this is unreliable.
      // check if event is all day if start and end time is 00:00
      event?.date_starting?.includes('00:00') &&
      event?.date_ending?.includes('00:00'),
  }));
}
