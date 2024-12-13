import { task, envvars, logger } from '@trigger.dev/sdk/v3';
import { type PartnersFeedbackProps } from '@/app/eval/_components/Forms/PartnersForm';
import { type ImplementerFeedbackProps } from '@/app/eval/_components/Forms/ImplementersForm';
import { type BeneficiariesFeedbackProps } from '@/app/eval/_components/Forms/BeneficiariesForm';
import { createAdminClient } from '@/libs/supabase/admin-client';
import {
  analyzeEmotions,
  analyzeSentiments,
} from '@/libs/huggingface/transformers';

async function analyzeFeedback(
  id: string,
  forAnalysis: string[],
  rating: number,
) {
  logger.info('Total rating score', { ratings: rating });

  const emotionScore = await analyzeEmotions(forAnalysis);
  const sentimentScore = await analyzeSentiments(forAnalysis);

  await Promise.all([
    envvars.retrieve('SUPABASE_URL'),
    envvars.retrieve('SUPABASE_SERVICE_KEY'),
  ]);
  const supabase = createAdminClient();

  const data: Record<string, unknown> = {
    score_ratings: rating,
    score_emotions: { ...emotionScore },
    score_sentiment: { ...sentimentScore },
  };

  const { error } = await supabase
    .from('activity_feedback')
    .update(data)
    .eq('id', id)
    .select('id');

  if (error) {
    logger.error(error.message, { error });
  }
}

export const analyzePartner = task({
  id: 'analyze-partner',
  machine: {
    preset: 'medium-1x',
  },
  run: async (payload: {
    id: string;
    form: Readonly<PartnersFeedbackProps>;
  }) => {
    const { id, form } = payload;

    const remarks: string[] =
      [
        form.sentiments?.beneficial,
        form.sentiments?.improve,
        form.sentiments?.comments,
      ].filter((text): text is string => !!text?.trim()) || [];

    const forAnalysis: string[] = [
      ...(form.objectives?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.outcomes?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.feedback?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...remarks,
    ];

    const ratings: number =
      (form.objectives?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      (form.outcomes?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      (form.feedback?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ?? 0);

    await analyzeFeedback(id, forAnalysis, ratings);
  },
});

export const analyzeImplementer = task({
  id: 'analyze-implementer',
  machine: {
    preset: 'medium-1x',
  },
  run: async (payload: {
    id: string;
    form: Readonly<ImplementerFeedbackProps>;
  }) => {
    const { id, form } = payload;

    const remarks: string[] =
      [
        form.reflections?.interpersonal,
        form.reflections?.productivity,
        form.reflections?.social,
        form.sentiments?.beneficial,
        form.sentiments?.improve,
        form.sentiments?.comments,
      ].filter((text): text is string => !!text?.trim()) || [];

    const forAnalysis: string[] = [
      ...(form.objectives?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.outcomes?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.feedback?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.implementations?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...remarks,
    ];

    const ratings: number =
      (form.objectives?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      (form.outcomes?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      (form.feedback?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ?? 0);

    await analyzeFeedback(id, forAnalysis, ratings);
  },
});

export const analyzeBeneficiary = task({
  id: 'analyze-beneficiary',
  machine: {
    preset: 'medium-1x',
  },
  run: async (payload: {
    id: string;
    form: Readonly<BeneficiariesFeedbackProps>;
  }) => {
    const { id, form } = payload;

    const remarks: string[] =
      [
        form.reflections?.interpersonal,
        form.reflections?.productivity,
        form.reflections?.social,
        form.sentiments?.learning,
        form.sentiments?.value,
      ].filter((text): text is string => !!text?.trim()) || [];

    const forAnalysis: string[] = [
      ...(form.objectives?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.feedback?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...remarks,
    ];

    const ratings: number =
      (form.objectives?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      (form.feedback?.reduce((acc, obj) => acc + parseInt(obj.rating), 0) ??
        0) +
      parseInt(form.importance);

    await analyzeFeedback(id, forAnalysis, ratings);
  },
});
