import { AIRecognizeResult } from '@personal-assistant/types';

export interface AIProvider {
  recognizeEmotion(text: string): Promise<AIRecognizeResult>;
  testConnection(): Promise<boolean>;
}
