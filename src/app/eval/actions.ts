'use server';

import { cookies } from 'next/headers';
import { UseFormReturnType } from '@mantine/form';
import { createServerClient } from '@/libs/supabase/server';
import {
  analyzePartner,
  analyzeBeneficiary,
  analyzeImplementer,
} from '@/trigger/analyze-feedback';
import type ApiResponse from '@/utils/response';

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
  const { id, idempotencyKey, type, ...feedback } = form.values;

  const { data, error } = await supabase
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

  switch (type) {
    case 'beneficiaries':
      // analyze beneficiary feedback
      analyzeBeneficiary.trigger(
        { id: id!, form: feedback },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, 'type_beneficiary'],
        },
      );
      break;

    case 'partners':
      // analyze partner feedback
      analyzePartner.trigger(
        { id: id!, form: feedback },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, 'type_partner'],
        },
      );
      break;

    case 'implementers':
      // analyze implementers feedback
      analyzeImplementer.trigger(
        { id: id!, form: feedback },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, 'type_implementer'],
        },
      );
      break;

    default:
      throw new Error('Invalid feedback type: ' + type);
  }

  return {
    status: 0,
    title: 'Feedback submitted',
    message: 'Thank you for your feedback!',
    data: data,
  };
}
