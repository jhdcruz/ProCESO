import { logger } from '@trigger.dev/sdk/v3';
import { pipeline } from '@huggingface/transformers';
import type {
  EmotionAnalysis,
  EmotionsResponse,
  SentimentAnalysis,
  SentimentsResponse,
} from './types';

/**
 * Total accumulated emotion analysis results.
 *
 * @param emotions Emotion analysis array results.
 */
export const accumulateEmotions = (
  emotions: EmotionAnalysis[],
): EmotionsResponse => {
  const total = emotions.length;

  // combine and total similar labels
  const accumulated = emotions.reduce((acc: Partial<EmotionsResponse>, e) => {
    const key = e.label;
    const value = e.score;

    if (key in acc) {
      acc[key] = (acc[key] ?? 0) + value;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  // filter out keys that are not in emotions
  const validKeys = Object.keys(accumulated).filter((key) =>
    emotions.some((e) => e.label === key),
  );

  const filteredAccumulated = validKeys.reduce((acc, key) => {
    acc[key as keyof EmotionsResponse] =
      accumulated[key as keyof EmotionsResponse];
    return acc;
  }, {} as Partial<EmotionsResponse>);

  return {
    total,
    ...filteredAccumulated,
  };
};

/**
 * Total accumulated sentiments from sentiment analysis results.
 *
 * @param sentiments Sentiment analysis array results.
 */
export const accumulateSentiments = (
  sentiments: SentimentAnalysis[],
): SentimentsResponse => {
  const total = sentiments.length;

  return {
    total,
    positive: sentiments
      .filter((s) => s.label === 'positive')
      .reduce((acc, s) => acc + s.score, 0),
    neutral: sentiments
      .filter((s) => s.label === 'neutral')
      .reduce((acc, s) => acc + s.score, 0),
    negative: sentiments
      .filter((s) => s.label === 'negative')
      .reduce((acc, s) => acc + s.score, 0),
  };
};

/**
 * Analyze emotions from a given text or string arrays.
 * Based on SamLowe/roberta-base-go_emotions-onnx model.
 *
 * @param text Text or string arrays to analyze.
 */
export const analyzeEmotions = async (
  text: string[],
  trigger: boolean = true,
): Promise<EmotionsResponse> => {
  // NOTE: This uses transformer instead of HF API, therefore
  //       uses local machine for processing (CPU/GPU).
  const pipe = await pipeline(
    'text-classification',
    'SamLowe/roberta-base-go_emotions-onnx',
    { dtype: 'q8' },
  );

  const emotions = (await pipe(text)) as EmotionAnalysis[];

  if (trigger) logger.info('Emotion analysis results', { ...emotions });

  return accumulateEmotions(emotions);
};

/**
 * Analyze sentiment from a given text or string arrays.
 * Based on TrumpMcDonaldz/cardiffnlp-twitter-roberta-base-sentiment-latest-ONNX model.
 *
 * @param text Text or string arrays to analyze.
 */
export const analyzeSentiments = async (
  text: string[],
  trigger: boolean = true,
): Promise<SentimentsResponse> => {
  // NOTE: This uses transformer instead of HF API, therefore
  //       uses local machine for processing (CPU/GPU).
  const pipe = await pipeline(
    'sentiment-analysis',
    'TrumpMcDonaldz/cardiffnlp-twitter-roberta-base-sentiment-latest-ONNX',
    { dtype: 'q8', model_file_name: 'decoder_model_merged' },
  );

  const sentiments = (await pipe(text)) as SentimentAnalysis[];

  if (trigger) {
    logger.info('Sentiment analysis results', {
      total: text.length,
      ...sentiments,
    });
  }

  return accumulateSentiments(sentiments);
};
