// Tailed for:
// https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
export interface SentimentResponse {
  positive: number;
  neutral: number;
  negative: number;
}

// Tailored for:
// https://huggingface.co/SamLowe/roberta-base-go_emotions-onnx
export interface EmotionResponse {
  admiration: number;
  amusement: number;
  anger: number;
  annoyance: number;
  approval: number;
  caring: number;
  confusion: number;
  curiosity: number;
  desire: number;
  disappointment: number;
  disapproval: number;
  disgust: number;
  embarrassment: number;
  excitement: number;
  fear: number;
  gratitude: number;
  grief: number;
  joy: number;
  love: number;
  nervousness: number;
  optimism: number;
  pride: number;
  realization: number;
  relief: number;
  remorse: number;
  sadness: number;
  surprise: number;
  neutral: number;
}
