import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { getAIService } from '../services/aiService';

/**
 * 调用 AI 识别文本中的情绪
 * @requires 登录认证
 * @body text - 需要识别的文本内容（必填）
 * @returns AI 识别结果 { emotionType, intensity }
 */
export async function recognizeEmotionController(req: AuthenticatedRequest, res: Response) {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json(error('文本内容不能为空'));
  }

  try {
    const aiService = getAIService();
    const result = await aiService.recognizeEmotion(text);
    return res.json(success(result));
  } catch (err) {
    console.error('AI emotion recognition failed:', err);
    return res.status(500).json(error('AI识别失败，请稍后重试'));
  }
}
