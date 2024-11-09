'use server';

import { cookies } from 'next/headers';
import type ApiResponse from '@/utils/response';
import { createServerClient } from '@/libs/supabase/server';
import { UseFormReturnType } from '@mantine/form';

/**
 * Submit feedback for an activity.
 *
 * @param form - Form data using PartnersFeedbackProps type.
 */
export async function submitFeedback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // separate id and type from the rest
  const { id, type, ...feedback } = form.values;

  const { error } = await supabase
    .from('activity_feedback')
    .insert({
      activity_id: id!,
      type: type!,
      response: feedback,
    })
    .select();

  if (error) {
    return {
      status: 2,
      title: 'Unable to submit feedback',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Feedback submitted',
    message: 'Thank you for your feedback!',
  };
}
