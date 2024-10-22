import { runs } from '@trigger.dev/sdk/v3';
import { emailReminders } from '@/trigger/email-reminders';

/**
 * Schedule email reminders for an event.
 *
 * 3 and 7 days before the event starting date.
 *
 * @param eventId - The event id.
 * @param eventTitle - The event title.
 * @param eventStartingDate - The event starting date.
 */
export function scheduleReminders({
  eventId,
  eventTitle,
  eventStartingDate,
}: {
  eventId: string;
  eventTitle: string;
  eventStartingDate: Date;
}) {
  // check if the event starting date is not within 3 days from now
  if (eventStartingDate.getTime() - 3 * 24 * 60 * 60 * 1000 > Date.now()) {
    // schedule new reminder task, 3 and 7 days before the event
    // no need to await
    emailReminders.trigger(
      {
        eventId: eventId,
        eventTitle: eventTitle,
      },
      {
        idempotencyKey: eventId + '_3d',
        tags: [`event_${eventId}`, 'action_reminders', 'in_3'],
        // trigger 3 days before the event starting date, return Date object
        delay: new Date(
          new Date(eventStartingDate).getTime() - 3 * 24 * 60 * 60 * 1000,
        ),
      },
    );
  }

  // check if the event starting date is not within 7 days from now
  if (eventStartingDate.getTime() - 7 * 24 * 60 * 60 * 1000 > Date.now()) {
    // schedule new reminder task, 7 days before the event
    // no need to await
    emailReminders.trigger(
      {
        eventId: eventId,
        eventTitle: eventTitle,
      },
      {
        idempotencyKey: eventId + '_7d',
        tags: [`event_${eventId}`, 'action_reminders', 'in_7'],
        // trigger 7 days before the event starting date, return Date object
        delay: new Date(
          new Date(eventStartingDate).getTime() - 7 * 24 * 60 * 60 * 1000,
        ),
      },
    );
  }
}

/**
 * Reschedule email reminders for an event.
 *
 * Schedule new reminders if there are no existing reminders.
 *
 * @param eventId - The event id.
 * @param eventTitle - The event title.
 * @param eventStartingDate - The event starting date.
 */
export async function rescheduleReminders({
  eventId,
  eventTitle,
  eventStartingDate,
}: {
  eventId: string;
  eventTitle: string;
  eventStartingDate: Date;
}) {
  // get the queued reminder task
  const day3 = runs.list({
    status: ['DELAYED'],
    taskIdentifier: 'email-reminders',
    tag: [`event_${eventId}`, 'action_reminders', 'in_3'],
    limit: 1,
  });

  const day7 = runs.list({
    status: ['DELAYED'],
    taskIdentifier: 'email-reminders',
    tag: [`event_${eventId}`, 'action_reminders', 'in_7'],
    limit: 1,
  });

  const [rday3, rday7] = await Promise.all([day3, day7]);

  if (rday3?.data[0].id || rday7?.data[0].id) {
    // reschedule the reminder task
    // no need to await
    runs.reschedule(rday3?.data[0].id, {
      delay: new Date(
        new Date(eventStartingDate).getTime() - 3 * 24 * 60 * 60 * 1000,
      ),
    });
    runs.reschedule(rday7?.data[0].id, {
      delay: new Date(
        new Date(eventStartingDate).getTime() - 7 * 24 * 60 * 60 * 1000,
      ),
    });
  } else {
    // schedule new reminder task
    scheduleReminders({
      eventId: eventId,
      eventTitle: eventTitle,
      eventStartingDate: eventStartingDate,
    });
  }
}
