import { Response } from 'express';
import {
  listEmotionRecords,
  getEmotionRecordById,
  createEmotionRecord,
  updateEmotionRecord,
  deleteEmotionRecord,
} from '../dao/emotionDao';
import { success, error, paginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

export async function listRecordsController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const page = parseInt((req.query.page as string | undefined) || '1') || 1;
  const pageSize = parseInt((req.query.pageSize as string | undefined) || String(DEFAULT_PAGE_SIZE)) || DEFAULT_PAGE_SIZE;
  const startDate = (req.query.startDate as string | undefined) ?? undefined;
  const endDate = (req.query.endDate as string | undefined) ?? undefined;

  const { records, total } = await listEmotionRecords(
    userId,
    page,
    pageSize,
    startDate,
    endDate
  );

  return res.json(paginated(records, page, total, pageSize));
}

export async function getRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const { id } = req.params;

  const record = await getEmotionRecordById(parseInt(id as string), userId);

  if (!record) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success({ record }));
}

export async function createRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const {
    event,
    emotionType,
    emotionIntensity,
    need,
    aiRecognizedEmotion,
    aiRecognizedIntensity,
    recordDate,
  } = req.body;

  if (!event || !need) {
    return res.status(400).json(error('事件和需求不能为空'));
  }

  const today = new Date().toISOString().split('T')[0];
  const record = await createEmotionRecord({
    userId,
    event,
    emotionType,
    emotionIntensity,
    need,
    aiRecognizedEmotion,
    aiRecognizedIntensity,
    recordDate: recordDate || today,
  });

  return res.json(success({ record }));
}

export async function updateRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const { id } = req.params;
  const data = req.body;

  const updated = await updateEmotionRecord(parseInt(id as string), userId, data);

  if (!updated) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success({ record: updated }));
}

export async function deleteRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const { id } = req.params;

  const deleted = await deleteEmotionRecord(parseInt(id as string), userId);

  if (!deleted) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success(null, '删除成功'));
}
