import { task, envvars, logger } from '@trigger.dev/sdk/v3';
import { type PartnersFeedbackProps } from '@/app/eval/_components/Forms/PartnersForm';
import { type ImplementerFeedbackProps } from '@/app/eval/_components/Forms/ImplementersForm';
import { type BeneficiariesFeedbackProps } from '@/app/eval/_components/Forms/BeneficiariesForm';
import { createAdminClient } from '@/libs/supabase/admin-client';
import {
  analyzeEmotions,
  analyzeSentiments,
} from '@/libs/huggingface/transformers';

/**
 * Analyze partner feedback evaluation form.
 *
 * @param id - feedback ID.
 */
export const analyzePartner = task({
  id: 'analyze-partner',
  run: async (payload: {
    id: string;
    form: Readonly<PartnersFeedbackProps>;
  }) => {
    const { form } = payload;

    // calculate total ratings from objectives field
    const totalRating =
      form.objectives?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total rating score', { ratings: totalRating });

    // calculate total ratings from outcomes field
    const totalOutcomeRating =
      form.outcomes?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total outcome rating score', { ratings: totalOutcomeRating });

    // calculate total ratings from feedback field
    const totalFeedbackRating =
      form.feedback?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total feedback rating score', {
      ratings: totalFeedbackRating,
    });

    // strings for sentiment analysis
    const textsForSentiment: string[] | undefined =
      [
        form.sentiments?.beneficial,
        form.sentiments?.improve,
        form.sentiments?.comments,
      ].filter((text): text is string => !!text?.trim()) || undefined;

    // strings for emotions analysis
    const textsForEmotions: string[] = [
      ...(form.objectives?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.outcomes?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...(form.feedback?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...textsForSentiment,
    ];
    // analyze emotions
    // NOTE: This uses CPU, take into account when running in parallel
    //       such as Promise.all(...);
    const emotionScore = await analyzeEmotions(textsForEmotions);
    const sentimentScore = await analyzeSentiments(textsForSentiment);

    // save results
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    const data = {
      score_ratings: totalRating + totalOutcomeRating + totalFeedbackRating,
      score_emotions: { ...emotionScore },
      score_sentiment: { ...sentimentScore },
    };

    const { error } = await supabase
      .from('activity_feedback')
      .update(data)
      .eq('id', payload.id)
      .select('id');

    if (error) {
      logger.error(error.message, { error });
    }
  },
});

/**
 * Analyze implenter feedback evaluation form.
 *
 * @param id - feedback ID.
 */
export const analyzeImplementer = task({
  id: 'analyze-implementer',
  run: async (payload: {
    id: string;
    form: Readonly<ImplementerFeedbackProps>;
  }) => {
    const { form } = payload;

    // calculate total ratings from objectives field
    const totalRating =
      form.objectives?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total rating score', { ratings: totalRating });

    // calculate total ratings from outcomes field
    const totalOutcomeRating =
      form.outcomes?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total outcome rating score', { ratings: totalOutcomeRating });

    // calculate total ratings from feedback field
    const totalFeedbackRating =
      form.feedback?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total feedback rating score', {
      ratings: totalFeedbackRating,
    });

    // strings for sentiment analysis
    const textsForSentiment: string[] | undefined = [
      ...([
        form.reflections?.interpersonal,
        form.reflections?.productivity,
        form.reflections?.social,
        form.sentiments?.beneficial,
        form.sentiments?.improve,
        form.sentiments?.comments,
      ].filter((text): text is string => !!text?.trim()) || undefined),
    ];

    // strings for emotions analysis
    const textsForEmotions: string[] = [
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
      ...textsForSentiment,
    ];

    // analyze emotions
    // NOTE: This uses CPU, take into account when running in parallel
    //       such as Promise.all(...);
    const emotionScore = await analyzeEmotions(textsForEmotions);
    const sentimentScore = await analyzeSentiments(textsForSentiment);

    // save results
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    const data = {
      score_ratings: totalRating + totalOutcomeRating + totalFeedbackRating,
      score_emotions: { ...emotionScore },
      score_sentiment: { ...sentimentScore },
    };

    logger.info('Saving feedback analysis results', { ...data });

    const { error } = await supabase
      .from('activity_feedback')
      .update(data)
      .eq('id', payload.id)
      .select('id');

    if (error) {
      logger.error(error.message, { error });
    }
  },
});

/**
 * Analyze implenter feedback evaluation form.
 *
 * @param id - feedback ID.
 */
export const analyzeBeneficiary = task({
  id: 'analyze-beneficiary',
  run: async (payload: {
    id: string;
    form: Readonly<BeneficiariesFeedbackProps>;
  }) => {
    const { form } = payload;

    // calculate total ratings from objectives field
    const totalObjectivesRating =
      form.objectives?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total rating score', { ratings: totalObjectivesRating });

    // calculate total ratings from feedback field
    const totalFeedbackRating =
      form.feedback?.reduce((acc, obj) => {
        return acc + parseInt(obj.rating);
      }, 0) ?? 0;
    logger.info('Total feedback rating score', {
      ratings: totalFeedbackRating,
    });

    // strings for sentiment analysis
    const textsForSentiment: string[] | undefined = [
      ...([
        form.reflections?.interpersonal,
        form.reflections?.productivity,
        form.reflections?.social,
        form.sentiments?.learning,
        form.sentiments?.value,
      ].filter((text): text is string => !!text?.trim()) || undefined),
    ];

    // strings for emotions analysis
    const textsForEmotions: string[] = [
      ...(form.objectives?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),

      ...(form.feedback?.map((obj) => obj.remarks) ?? []).filter(
        (text) => text.trim() !== '',
      ),
      ...textsForSentiment,
    ];

    // analyze emotions
    // NOTE: This uses CPU, take into account when running in parallel
    //       such as Promise.all(...);
    const emotionScore = await analyzeEmotions(textsForEmotions);
    const sentimentScore = await analyzeSentiments(textsForSentiment);

    // save results
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    const data = {
      score_ratings:
        totalObjectivesRating + totalFeedbackRating + parseInt(form.importance),
      score_emotions: { ...emotionScore },
      score_sentiment: { ...sentimentScore },
    };

    logger.info('Saving feedback analysis results', { ...data });

    const { error } = await supabase
      .from('activity_feedback')
      .update(data)
      .eq('id', payload.id)
      .select('id');

    if (error) {
      logger.error(error.message, { error });
    }
  },
});
