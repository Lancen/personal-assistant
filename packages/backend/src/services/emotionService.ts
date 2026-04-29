import { randomUUID } from 'crypto';
import * as emotionRecordDao from '../dao/emotionRecords';
import { EmotionRecord, CreateEmotionRecordRequest, UpdateEmotionRecordRequest } from '@personal-assistant/types';

export async function createRecord(userId: string, data: CreateEmotionRecordRequest): Promise<EmotionRecord> {
  const recordId = randomUUID();
  const recordDate = data.recordDate || new Date().toISOString().split('T')[0];

  return emotionRecordDao.create({
    recordId,
    userId,
    event: data.event,
    emotionType: data.emotionType,
    emotionIntensity: data.emotionIntensity,
    need: data.need,
    recordDate,
  });
}

export async function getRecord(recordId: string, userId: string): Promise<EmotionRecord | null> {
  return emotionRecordDao.getById(recordId, userId);
}

export async function listRecords(
  userId: string,
  page?: number,
  pageSize?: number
): Promise<{ records: EmotionRecord[]; total: number }> {
  return emotionRecordDao.getByUserId(userId, page, pageSize);
}

export async function updateRecord(
  recordId: string,
  userId: string,
  data: UpdateEmotionRecordRequest
): Promise<EmotionRecord | null> {
  return emotionRecordDao.update(recordId, userId, data);
}

export async function deleteRecord(recordId: string, userId: string): Promise<boolean> {
  return emotionRecordDao.softDelete(recordId, userId);
}

export async function countTodayRecords(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  return emotionRecordDao.countByUserIdAndDate(userId, today);
}
