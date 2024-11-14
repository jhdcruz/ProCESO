'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@/libs/supabase/server';
import {
  analyzePartner,
  analyzeBeneficiary,
  analyzeImplementer,
} from '@/trigger/analyze-feedback';
import type { ImplementerFeedbackProps } from './_components/Forms/ImplementersForm';
import type { PartnersFeedbackProps } from './_components/Forms/PartnersForm';
import type { BeneficiariesFeedbackProps } from './_components/Forms/BeneficiariesForm';
import type ApiResponse from '@/utils/response';

/**
 * Submit feedback for an activity.
 *
 * @param form - Form data using PartnersFeedbackProps type.
 */
export async function submitFeedback(
  form:
    | ImplementerFeedbackProps
    | PartnersFeedbackProps
    | BeneficiariesFeedbackProps,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // separate id and type from the rest
  const { id, idempotencyKey, type, ...feedback } = form;

  const { data, error } = await supabase
    .from('activity_feedback')
    .insert({
      activity_id: id!,
      type: type!,
      response: feedback,
    })
    .select('id')
    .limit(1)
    .single();

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
      await analyzeBeneficiary.trigger(
        { id: data.id, form: feedback as BeneficiariesFeedbackProps },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, `feedback_${data.id}`, 'type_beneficiary'],
          metadata: { idempotencyKey },
        },
      );
      break;

    case 'partners':
      // analyze partner feedback
      await analyzePartner.trigger(
        { id: data.id, form: feedback as PartnersFeedbackProps },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, `feedback_${data.id}`, 'type_partner'],
          metadata: { idempotencyKey },
        },
      );
      break;

    case 'implementers':
      // analyze implementers feedback
      await analyzeImplementer.trigger(
        { id: data.id, form: feedback as ImplementerFeedbackProps },
        {
          idempotencyKey: idempotencyKey,
          tags: [`activity_${id}`, `feedback_${data.id}`, 'type_implementer'],
          metadata: { idempotencyKey },
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
