import { AIRecognizeResult } from '@personal-assistant/types';
import { AIProvider } from './ai/types';
import { ZhipuAIProvider } from './ai/zhipuProvider';
import { DeepSeekAIProvider } from './ai/deepseekProvider';
import * as userSettingsDao from '../dao/userSettings';
import { decrypt } from '../crypto/aes';

export async function recognizeEmotion(userId: string, text: string): Promise<AIRecognizeResult> {
  const settings = await userSettingsDao.getByUserId(userId);

  if (!settings?.aiApiKey) {
    const err: any = new Error('请先在设置中配置 AI API Key');
    err.statusCode = 403;
    throw err;
  }

  let decryptedKey: string;
  try {
    decryptedKey = decrypt(settings.aiApiKey);
  } catch {
    const err: any = new Error('加密服务未配置');
    err.statusCode = 500;
    throw err;
  }

  const provider = createProvider(settings.aiProvider, settings.aiModel, decryptedKey);

  try {
    return await provider.recognizeEmotion(text);
  } catch (e: any) {
    if (e.message === 'API_KEY_INVALID') {
      const err: any = new Error('API Key 无效');
      err.statusCode = 401;
      throw err;
    }
    if (e.message === 'AI_RESPONSE_FORMAT_ERROR') {
      const err: any = new Error('AI 响应格式异常');
      err.statusCode = 502;
      throw err;
    }
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      const err: any = new Error('AI 服务暂时不可用');
      err.statusCode = 503;
      throw err;
    }
    const err: any = new Error('AI 服务暂时不可用');
    err.statusCode = 503;
    throw err;
  }
}

export async function testConnection(
  providerName: string,
  model: string,
  apiKey: string
): Promise<boolean> {
  const provider = createProvider(providerName, model, apiKey);
  return provider.testConnection();
}

function createProvider(providerName: string, model: string, apiKey: string): AIProvider {
  switch (providerName) {
    case 'deepseek':
      return new DeepSeekAIProvider(apiKey, model);
    case 'zhipu':
    default:
      return new ZhipuAIProvider(apiKey, model);
  }
}
