import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import OpenAI from 'openai';
import { createAdminClient } from '@/libs/supabase/admin-client';
import type { EmotionsResponse } from '@/libs/huggingface/types';
import type { RatingsProps } from '@/app/portal/activities/_components/ActivityAnalytics/StatRatings';
import { aggregateEmotions } from '@/utils/json-restructure';

/**
 * Generate summary text for an activity.
 *
 * @param activity - activity name.
 * @param rating - activity ratings.
 */
export const generateSummary = task({
  id: 'generate-summary',
  machine: {
    preset: 'medium-1x',
  },
  run: async (payload: {
    activityId: string;
    ratings: RatingsProps;
    count: {
      partners: number;
      implementers: number;
      beneficiaries: number;
      total: number;
    };
  }) => {
    const { ratings, count, activityId } = payload;

    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    const { data: emotionsRes, error } = await supabase
      .from('activity_feedback')
      .select('type, score_emotions->emotions')
      .eq('activity_id', activityId)
      .not('score_emotions', 'is', null)
      .returns<EmotionsResponse[]>();

    if (error) {
      logger.error('Unable to get evaluation emotions', { error });
    }

    const emotions = aggregateEmotions(emotionsRes!, true, true);

    // ignore summary when no responses

    const ghToken = await envvars.retrieve('GITHUB_PAT');
    const gptEndpoint = 'https://models.inference.ai.azure.com';
    const gptModel = 'gpt-4o-mini';

    const client = new OpenAI({ baseURL: gptEndpoint, apiKey: ghToken.value });

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional analyst and secretary.',
        },
        {
          role: 'user',
          content:
            'Write a paragraph consisting of at least 5 sentences summary report of the feedback evaluation results provided below. Add basic html tags to format the text and highlight important parts, no links and headers.',
        },
        {
          role: 'user',
          content: `Here are ratings score from the evaluation: Partners gave a score of ${ratings?.partners?.score ?? 0}% from ${count.partners} partners, ${ratings?.implementers?.score ?? 0}% from ${count.implementers} for implementers, and ${ratings?.beneficiaries?.score ?? 0}% from ${count.beneficiaries} for beneficiaries. Totaling to ${count.total} total score across ${count.implementers + count.partners + count.beneficiaries} responses.`,
        },
        {
          role: 'user',
          content: `Also, Find out the dominant and frequent emotions that shows: ${emotions
            .slice(0, 60)
            .map((emotion) => emotion.label)
            .join(', ')}.`,
        },
      ],
      model: gptModel,
    });

    const summary = response.choices[0].message.content;

    logger.info('Saving generated result', { summary });

    // save to db
    const { error: dbError } = await supabase.from('analytics_metadata').upsert(
      { activity_id: activityId, type: 'summary', content: summary },
      {
        onConflict: 'activity_id, type',
      },
    );

    if (dbError) {
      logger.error('Unable to save generated summary', { dbError });
    }
  },
});
