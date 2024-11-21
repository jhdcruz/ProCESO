import { EventSourceInput } from '@fullcalendar/core';
import sanitizeHtml from 'sanitize-html';
import type { Tables } from '@/libs/supabase/_database';
import type {
  Emotions,
  EmotionsResponse,
  SentimentResponse,
} from '@/libs/huggingface/types';

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

export interface CategorizedEmotions {
  label: keyof Emotions;
  beneficiaries?: number;
  partners?: number;
  implementers?: number;
}

/**
 * Flattens the emotions response into a categorized emotions array.
 *
 * @param data EmotionsResponse[]
 * @returns CategorizedEmotions[]
 */
export function aggregateEmotions(
  data: EmotionsResponse[],
  showNeutral: boolean = false,
): CategorizedEmotions[] {
  return data.reduce<CategorizedEmotions[]>((acc, response) => {
    if (!response.type) {
      throw new Error(
        'Feedback type is missing, please inform ITSO team with the URL.',
      );
    }

    const type = response.type;

    response.emotions.forEach((emotion) => {
      // Skip neutral emotions if includeNeutral is false
      if (!showNeutral && emotion.label === 'neutral') {
        return;
      }

      // Find existing emotion entry or create new one
      let existingEmotion = acc.find((item) => item.label === emotion.label);

      if (!existingEmotion) {
        existingEmotion = { label: emotion.label };
        acc.push(existingEmotion);
      }

      // Add to existing value or set new value based on the type
      switch (type) {
        case 'beneficiaries':
          existingEmotion.beneficiaries =
            (existingEmotion.beneficiaries ?? 0) + emotion.score;
          break;
        case 'partners':
          existingEmotion.partners =
            (existingEmotion.partners ?? 0) + emotion.score;
          break;
        case 'implementers':
          existingEmotion.implementers =
            (existingEmotion.implementers ?? 0) + emotion.score;
          break;
      }
    });

    return acc;
  }, []);
}

/**
 * Aggregate sentiment response into a single response object.
 */
export function aggregateSentiments(
  responses: SentimentResponse[],
): SentimentResponse {
  return responses.reduce(
    (acc, current) => ({
      total: (acc.total ?? 0) + (current.total ?? 0),
      positive: acc.positive + current.positive,
      neutral: acc.neutral + current.neutral,
      negative: acc.negative + current.negative,
    }),
    {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    },
  );
}

/**
 * Accumulate emotions that all 3 types has in common.
 * Mostly for Mantine/Recharts Radar Chart.
 *
 * @param emotions EmotionAnalysis[]
 * @param exclude Optional array of emotion labels to exclude
 * @returns CategorizedEmotions[]
 */
export function aggregateCommonEmotions(
  data: EmotionsResponse[],
  showNeutral: boolean = false,
): CategorizedEmotions[] {
  const emotions = aggregateEmotions(data, showNeutral);

  return emotions.filter(
    (emotion) =>
      // Check if emotion exists in all three types
      emotion.beneficiaries !== undefined &&
      emotion.partners !== undefined &&
      emotion.implementers !== undefined,
  );
}
