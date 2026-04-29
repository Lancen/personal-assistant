import { Response } from 'express';
import * as aiService from '../services/aiService';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export async function recognizeController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json(error('文本内容不能为空'));
  }

  try {
    const result = await aiService.recognizeEmotion(userId, text);
    return res.json(success(result));
  } catch (e: any) {
    const statusCode = e.statusCode || 500;
    return res.status(statusCode).json(error(e.message));
  }
}
