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

/**
 * 获取当前用户的情绪记录列表（分页）
 * @requires 登录认证
 * @query page - 页码，默认 1
 * @query pageSize - 每页条数，默认 DEFAULT_PAGE_SIZE
 * @query startDate - 开始日期筛选（可选），格式 YYYY-MM-DD
 * @query endDate - 结束日期筛选（可选），格式 YYYY-MM-DD
 * @returns 分页情绪记录列表
 */
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

/**
 * 获取单个情绪记录详情
 * @requires 登录认证
 * @param id - 记录ID
 * @returns 情绪记录详情
 */
export async function getRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const { id } = req.params;

  const record = await getEmotionRecordById(parseInt(id as string), userId);

  if (!record) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success({ record }));
}

/**
 * 创建新的情绪记录
 * @requires 登录认证
 * @body event - 事件描述（必填）发生了什么
 * @body emotionType - 用户标注的情绪类型（可选）
 * @body emotionIntensity - 情绪强度 1-5（可选）
 * @body need - 需求描述（必填）你需要什么支持
 * @body aiRecognizedEmotion - AI 识别情绪类型（可选）
 * @body aiRecognizedIntensity - AI 识别情绪强度（可选）
 * @body recordDate - 记录日期，默认今天
 * @returns 创建成功返回记录信息
 */
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

/**
 * 更新情绪记录
 * @requires 登录认证
 * @param id - 记录ID
 * @body 同创建接口，只更新提供的字段
 * @returns 更新成功返回记录信息
 */
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

/**
 * 删除情绪记录（软删除）
 * @requires 登录认证
 * @param id - 记录ID
 * @returns 删除成功
 */
export async function deleteRecordController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const { id } = req.params;

  const deleted = await deleteEmotionRecord(parseInt(id as string), userId);

  if (!deleted) {
    return res.status(404).json(error('记录不存在'));
  }

  return res.json(success(null, '删除成功'));
}
