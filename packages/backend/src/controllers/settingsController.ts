import { Response } from 'express';
import * as settingsService from '../services/settingsService';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const settings = await settingsService.getSettings(userId);
  return res.json(success(settings));
}

export async function updateController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { aiProvider, aiModel, apiKey, emotionThreshold, notificationEnabled } = req.body;

  try {
    const settings = await settingsService.updateSettings(userId, {
      aiProvider,
      aiModel,
      apiKey,
      emotionThreshold,
      notificationEnabled,
    });
    return res.json(success(settings));
  } catch (e: any) {
    const statusCode = e.statusCode || 500;
    return res.status(statusCode).json(error(e.message));
  }
}

export async function testAIController(req: AuthenticatedRequest, res: Response) {
  const { aiProvider, aiModel, apiKey } = req.body;

  if (!aiProvider || !aiModel || !apiKey) {
    return res.status(400).json(error('服务商、模型和 API Key 不能为空'));
  }

  const result = await settingsService.testAIConnection(aiProvider, aiModel, apiKey);
  return res.json(success(result));
}
