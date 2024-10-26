import { runs } from '@trigger.dev/sdk/v3';
import { emailReminders } from '@/trigger/email-reminders';

/**
 * Schedule email reminders for an activity.
 *
 * 3 and 7 days before the activity starting date.
 *
 * @param activityId - The activity id.
 * @param activityTitle - The activity title.
 * @param activityStartingDate - The activity starting date.
 */
export function scheduleReminders({
  activityId,
  activityTitle,
  activityStartingDate,
}: {
  activityId: string;
  activityTitle: string;
  activityStartingDate: Date;
}) {
  // check if the activity starting date is not within 3 days from now
  if (activityStartingDate.getTime() - 3 * 24 * 60 * 60 * 1000 > Date.now()) {
    // schedule new reminder task, 3 and 7 days before the activity
    // no need to await
    emailReminders.trigger(
      {
        activityId: activityId,
        activityTitle: activityTitle,
      },
      {
        idempotencyKey: activityId + '_3d',
        tags: [`activity_${activityId}`, 'action_reminders', 'in_3'],
        // trigger 3 days before the activity starting date, return Date object
        delay: new Date(
          new Date(activityStartingDate).getTime() - 3 * 24 * 60 * 60 * 1000,
        ),
      },
    );
  }

  // check if the activity starting date is not within 7 days from now
  if (activityStartingDate.getTime() - 7 * 24 * 60 * 60 * 1000 > Date.now()) {
    // schedule new reminder task, 7 days before the activity
    // no need to await
    emailReminders.trigger(
      {
        activityId: activityId,
        activityTitle: activityTitle,
      },
      {
        idempotencyKey: activityId + '_7d',
        tags: [`activity_${activityId}`, 'action_reminders', 'in_7'],
        // trigger 7 days before the activity starting date, return Date object
        delay: new Date(
          new Date(activityStartingDate).getTime() - 7 * 24 * 60 * 60 * 1000,
        ),
      },
    );
  }
}

/**
 * Reschedule email reminders for an activity.
 *
 * Schedule new reminders if there are no existing reminders.
 *
 * @param activityId - The activity id.
 * @param activityTitle - The activity title.
 * @param activityStartingDate - The activity starting date.
 */
export async function rescheduleReminders({
  activityId,
  activityTitle,
  activityStartingDate,
}: {
  activityId: string;
  activityTitle: string;
  activityStartingDate: Date;
}) {
  // get the queued reminder task
  const day1 = runs.list({
    status: ['DELAYED'],
    taskIdentifier: 'email-reminders',
    tag: [`activity_${activityId}`, 'action_reminders', 'in_1'],
    limit: 1,
  });
  const day3 = runs.list({
    status: ['DELAYED'],
    taskIdentifier: 'email-reminders',
    tag: [`activity_${activityId}`, 'action_reminders', 'in_3'],
    limit: 1,
  });
  const day7 = runs.list({
    status: ['DELAYED'],
    taskIdentifier: 'email-reminders',
    tag: [`activity_${activityId}`, 'action_reminders', 'in_7'],
    limit: 1,
  });

  const [rday1, rday3, rday7] = await Promise.all([day1, day3, day7]);

  // this all coincides, so we can just check one
  if (rday1?.data[0].id || rday3?.data[0].id || rday7?.data[0].id) {
    // reschedule the reminder task
    // no need to await
    runs.reschedule(rday1?.data[0].id, {
      delay: new Date(
        new Date(activityStartingDate).getTime() - 1 * 24 * 60 * 60 * 1000,
      ),
    });
    runs.reschedule(rday3?.data[0].id, {
      delay: new Date(
        new Date(activityStartingDate).getTime() - 3 * 24 * 60 * 60 * 1000,
      ),
    });
    runs.reschedule(rday7?.data[0].id, {
      delay: new Date(
        new Date(activityStartingDate).getTime() - 7 * 24 * 60 * 60 * 1000,
      ),
    });
  } else {
    // schedule new reminder task
    scheduleReminders({
      activityId: activityId,
      activityTitle: activityTitle,
      activityStartingDate: activityStartingDate,
    });
  }
}
