import { EventSourceInput } from '@fullcalendar/core';
import sanitizeHtml from 'sanitize-html';
import type { Tables } from '@/libs/supabase/_database';

/**
 * Transforms activities list from activities schema to FullCalendar schema.
 *
 * @param activities - The activities list to transform.
 */
export const activitiesToFc = (
  activities: Tables<'activities_details_view'>[],
): EventSourceInput[] => {
  return activities.map((activity) => ({
    id: activity.id as string,
    color: activity.series_color as string,
    title: activity.title,
    start: new Date(activity.date_starting as string),
    end: new Date(activity.date_ending as string),
    description: sanitizeHtml(activity.description as string, {
      allowedTags: [],
    }),
    url: `/portal/activities/${activity.id}/info`,
    allDay:
      // TODO: Improve allDay check logic, this is unreliable.
      // check if activity is all day if start and end time is 00:00
      activity?.date_starting?.includes('00:00:00') &&
      activity?.date_ending?.includes('00:00:00'),
  }));
};
