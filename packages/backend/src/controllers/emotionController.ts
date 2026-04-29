import { Response } from 'express';
import * as emotionService from '../services/emotionService';
import { success, error, paginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

export async function getAllController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE;

  const { records, total } = await emotionService.listRecords(userId, page, pageSize);
  return res.json(paginated(records, page, total, pageSize));
}

export async function getByIdController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const recordId = req.params.id as string;

  const record = await emotionService.getRecord(recordId, userId);
  if (!record) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success(record));
}

export async function createController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { event, emotionType, emotionIntensity, need, recordDate } = req.body;

  if (!event || !event.trim()) {
    return res.status(400).json(error('事件描述不能为空'));
  }
  if (!emotionType) {
    return res.status(400).json(error('情绪类型不能为空'));
  }
  if (emotionIntensity === undefined || emotionIntensity < 1 || emotionIntensity > 5) {
    return res.status(400).json(error('情绪强度必须在1-5之间'));
  }
  if (!need || !need.trim()) {
    return res.status(400).json(error('需求描述不能为空'));
  }

  const record = await emotionService.createRecord(userId, {
    event,
    emotionType,
    emotionIntensity,
    need,
    recordDate,
  });

  return res.status(201).json(success(record));
}

export async function updateController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const recordId = req.params.id as string;
  const { event, emotionType, emotionIntensity, need, aiRecognizedEmotion, aiRecognizedIntensity } = req.body;

  if (emotionIntensity !== undefined && (emotionIntensity < 1 || emotionIntensity > 5)) {
    return res.status(400).json(error('情绪强度必须在1-5之间'));
  }

  const record = await emotionService.updateRecord(recordId, userId, {
    event,
    emotionType,
    emotionIntensity,
    need,
    aiRecognizedEmotion,
    aiRecognizedIntensity,
  });

  if (!record) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success(record));
}

export async function deleteController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const recordId = req.params.id as string;

  const deleted = await emotionService.deleteRecord(recordId, userId);
  if (!deleted) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success(null, '记录删除成功'));
}
