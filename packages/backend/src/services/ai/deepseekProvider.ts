import { AIRecognizeResult } from '@personal-assistant/types';
import { AIProvider } from './types';

const EMOTION_LIST = '快乐、满足、平静、期待、感恩、焦虑、悲伤、愤怒、恐惧、厌恶、羞耻、内疚、惊讶、困惑';
const SYSTEM_PROMPT = `你是一个情绪识别助手。根据用户描述的事件和需求，识别其情绪类型和强度。
情绪类型只能从以下列表中选择：${EMOTION_LIST}
请以JSON格式返回：{"emotionType": "情绪类型", "intensity": 强度数值(1-5,保留一位小数), "confidence": 置信度(0-1)}
只返回JSON，不要返回其他内容。`;

export class DeepSeekAIProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model: string = 'deepseek-chat'
  ) {}

  async recognizeEmotion(text: string): Promise<AIRecognizeResult> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error(`AI 服务请求失败: ${response.status}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI_RESPONSE_FORMAT_ERROR');
    }

    return parseAIResponse(content);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
        signal: AbortSignal.timeout(15000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

function parseAIResponse(content: string): AIRecognizeResult {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI_RESPONSE_FORMAT_ERROR');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      emotionType: parsed.emotionType,
      intensity: Number(parsed.intensity),
      confidence: Number(parsed.confidence),
    };
  } catch {
    throw new Error('AI_RESPONSE_FORMAT_ERROR');
  }
}
