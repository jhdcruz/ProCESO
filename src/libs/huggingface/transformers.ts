import { logger } from '@trigger.dev/sdk/v3';
import { pipeline, TextClassificationOutput } from '@huggingface/transformers';
import type { EmotionResponse, SentimentResponse } from './types';

/**
 * Accumulate JSON data from an array,
 * assuming that the array contains exact key-value pairs.
 *
 * @param data Array JSON data
 */
export const accumulateArray = (
  data: TextClassificationOutput | TextClassificationOutput[],
): Record<string, number> => {
  return (data as TextClassificationOutput[]).reduce(
    (acc: Record<string, number>, obj: TextClassificationOutput) => {
      return Object.keys(obj).reduce((acc, key: string) => {
        if (acc[key] === undefined) {
          acc[key] = 0;
        }
        acc[key] += (obj as unknown as Record<string, number>)[key];
        return acc;
      }, acc);
    },
    {},
  );
};

/**
 * Analyze emotions from a given text or string arrays.
 * Based on SamLowe/roberta-base-go_emotions-onnx model.
 *
 * @param text Text or string arrays to analyze.
 */
export const analyzeEmotions = async (
  text: string | string[],
  trigger?: boolean,
): Promise<EmotionResponse> => {
  // NOTE: This uses transformer instead of HF API, therefore
  //       uses local machine for processing (CPU/GPU).
  const pipe = await pipeline(
    'text-classification',
    'SamLowe/roberta-base-go_emotions-onnx',
    { dtype: 'int8' },
  );

  const emotions = await pipe(text);

  if (emotions.length > 1) {
    if (trigger) logger.info('Emotion analysis', { emotions });
    return accumulateArray(emotions) as unknown as EmotionResponse;
  } else {
    if (trigger) logger.info('Emotion analysis', { emotions });
    return emotions as unknown as EmotionResponse;
  }
};

/**
 * Analyze sentiment from a given text or string arrays.
 * Based on TrumpMcDonaldz/cardiffnlp-twitter-roberta-base-sentiment-latest-ONNX model.
 *
 * @param text Text or string arrays to analyze.
 */
export const analyzeSentiment = async (
  text: string | string[],
  trigger?: boolean,
): Promise<SentimentResponse> => {
  // NOTE: This uses transformer instead of HF API, therefore
  //       uses local machine for processing (CPU/GPU).
  const pipe = await pipeline(
    'sentiment-analysis',
    'TrumpMcDonaldz/cardiffnlp-twitter-roberta-base-sentiment-latest-ONNX',
    { dtype: 'int8' },
  );

  const sentiments = await pipe(text);

  if (sentiments.length > 1) {
    if (trigger) logger.info('Sentiment analysis', { sentiments });
    return accumulateArray(sentiments) as unknown as SentimentResponse;
  } else {
    if (trigger) logger.info('Sentiment analysis', { sentiments });
    return sentiments as unknown as SentimentResponse;
  }
};
