import * as userSettingsDao from '../dao/userSettings';
import * as aiService from './aiService';
import { UserSettings, UpdateUserSettingsRequest } from '@personal-assistant/types';
import { encrypt } from '../crypto/aes';

const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: 'zhipu',
  aiModel: 'glm-4',
  hasApiKey: false,
  emotionThreshold: 25,
  notificationEnabled: true,
};

export async function getSettings(userId: string): Promise<UserSettings> {
  const settings = await userSettingsDao.getByUserId(userId);

  if (!settings) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    aiProvider: settings.aiProvider,
    aiModel: settings.aiModel,
    hasApiKey: !!settings.aiApiKey,
    emotionThreshold: settings.emotionThreshold,
    notificationEnabled: settings.notificationEnabled,
  };
}

export async function updateSettings(userId: string, data: UpdateUserSettingsRequest): Promise<UserSettings> {
  const updateData: {
    aiProvider?: string;
    aiModel?: string;
    aiApiKey?: string;
    emotionThreshold?: number;
    notificationEnabled?: boolean;
  } = {};

  if (data.aiProvider !== undefined) updateData.aiProvider = data.aiProvider;
  if (data.aiModel !== undefined) updateData.aiModel = data.aiModel;
  if (data.emotionThreshold !== undefined) updateData.emotionThreshold = data.emotionThreshold;
  if (data.notificationEnabled !== undefined) updateData.notificationEnabled = data.notificationEnabled;

  if (data.apiKey !== undefined) {
    try {
      updateData.aiApiKey = encrypt(data.apiKey);
    } catch {
      const err: any = new Error('加密服务未配置');
      err.statusCode = 500;
      throw err;
    }
  }

  await userSettingsDao.upsert(userId, updateData);
  return getSettings(userId);
}

export async function testAIConnection(
  provider: string,
  model: string,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await aiService.testConnection(provider, model, apiKey);
    return {
      success: result,
      message: result ? '连接测试成功' : 'API Key 无效或连接失败',
    };
  } catch {
    return {
      success: false,
      message: 'API Key 无效或连接失败',
    };
  }
}
