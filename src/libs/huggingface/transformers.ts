import { logger } from '@trigger.dev/sdk/v3';
import { pipeline } from '@huggingface/transformers';
import type {
  EmotionAnalysis,
  EmotionsResponse,
  SentimentAnalysis,
  SentimentResponse,
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

  // merge and accumulate similar labels with their scores
  const accumulated: EmotionAnalysis[] = emotions
    .flat()
    .reduce((acc, emotion) => {
      const existing = acc.find((e) => e.label === emotion.label);

      if (existing) {
        existing.score += emotion.score;
      } else {
        acc.push({
          label: emotion.label,
          score: emotion.score,
        });
      }

      return acc;
    }, [] as EmotionAnalysis[]);

  return {
    total,
    emotions: accumulated,
  };
};

/**
 * Total accumulated sentiments from sentiment analysis results.
 *
 * @param sentiments Sentiment analysis array results.
 */
export const accumulateSentiments = (
  sentiments: SentimentAnalysis[],
): SentimentResponse => {
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
 * @param trigger Trigger.dev logging functionality
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

  const emotions = (await pipe(text, { top_k: 3 })) as EmotionAnalysis[];

  if (trigger) logger.info('Emotion analysis results', { ...emotions });

  return accumulateEmotions(emotions);
};

/**
 * Analyze sentiment from a given text or string arrays.
 * Based on TrumpMcDonaldz/cardiffnlp-twitter-roberta-base-sentiment-latest-ONNX model.
 *
 * @param text Text or string arrays to analyze.
 * @param trigger Trigger.dev logging functionality
 */
export const analyzeSentiments = async (
  text: string[],
  trigger: boolean = true,
): Promise<SentimentResponse> => {
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
