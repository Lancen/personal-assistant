import { Response } from 'express';
import * as emotionCheckService from '../services/emotionCheckService';
import { success, error, paginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

export async function getStatusController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const status = await emotionCheckService.getCheckStatus(userId);
  return res.json(success(status));
}

export async function generateController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const result = await emotionCheckService.generateQuestions(userId);
  return res.json(success(result));
}

export async function submitController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json(error('答案格式无效'));
  }

  try {
    const result = await emotionCheckService.submitAnswers(userId, answers);
    return res.json(success(result));
  } catch (e: any) {
    const statusCode = e.statusCode || 500;
    return res.status(statusCode).json(error(e.message));
  }
}

export async function getHistoryController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE;

  const { checks, total } = await emotionCheckService.getHistory(userId, page, pageSize);
  return res.json(paginated(checks, page, total, pageSize));
}
