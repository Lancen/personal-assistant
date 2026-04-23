import { EmotionRecognitionResult } from '@personal-assistant/types';

/** 情绪识别响应结构 */
export interface EmotionRecognitionResponse {
  emotionType: string;
  intensity: number;
}

/** AI 服务接口定义 */
export interface AIService {
  /** 识别文本中的情绪 */
  recognizeEmotion(text: string): Promise<EmotionRecognitionResult>;
  /** 分析一段时间的情绪记录（TODO） */
  analyzeEmotionRecords(records: any, period: any): Promise<any>;
}

/** 支持的情绪类型列表（与前端一致） */
export const SUPPORTED_EMOTIONS = [
  '快乐', '平静', '兴奋', '焦虑', '紧张',
  '悲伤', '愤怒', '沮丧', '惊讶', '厌恶',
] as const;

/** 情绪识别系统提示词，指导 AI 输出正确格式 */
const EMOTION_RECOGNITION_PROMPT = `
你是一个专业的情绪分析助手。请分析用户输入的文本内容，识别出主要情绪，并给出情绪强度（1-5分）。

支持的情绪类型：${SUPPORTED_EMOTIONS.join(', ')}

请严格按照JSON格式输出，不要有其他内容：
{
  "emotionType": "情绪类型",
  "intensity": 情绪强度数字（1-5）
}
`;

/** OpenAI 实现的 AI 服务 */
export class OpenAIAIService implements AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  /**
   * 调用 OpenAI API 识别文本中的情绪
   * @param text - 用户输入的事件描述文本
   * @returns 识别结果 { emotionType, intensity }
   * @description 调用 OpenAI 识别情绪，对结果进行范围验证和 clamping
   */
  async recognizeEmotion(text: string): Promise<EmotionRecognitionResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: EMOTION_RECOGNITION_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API call failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    try {
      const result = JSON.parse(content) as EmotionRecognitionResult;
      // 验证结果，确保情绪类型在支持列表中，强度在 1-5 范围
      if (!SUPPORTED_EMOTIONS.includes(result.emotionType as any)) {
        result.emotionType = SUPPORTED_EMOTIONS[0];
      }
      if (result.intensity < 1) result.intensity = 1;
      if (result.intensity > 5) result.intensity = 5;
      return result;
    } catch (e) {
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * 分析一段时间的情绪记录（待实现）
   * @returns Promise  resolving to 分析结果
   */
  async analyzeEmotionRecords(): Promise<any> {
    // TODO: 实现多周期分析
    throw new Error('Not implemented yet');
  }
}

/** AI 服务单例实例 */
let aiServiceInstance: AIService | null = null;

/**
 * 获取 AI 服务单例
 * @returns AI 服务实例
 */
export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new OpenAIAIService();
  }
  return aiServiceInstance;
}
