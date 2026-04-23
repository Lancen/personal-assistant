import { and, count, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { db } from '../config/db';
import { emotionRecords } from '@personal-assistant/drizzle/src/schema';
import { EmotionRecord } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

export async function listEmotionRecords(
  userId: string,
  page: number = 1,
  pageSize: number = 20,
  startDate?: string,
  endDate?: string
): Promise<{ records: EmotionRecord[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);

  let conditions = and(
    eq(emotionRecords.userId, userId),
    isNull(emotionRecords.deletedAt)
  );

  if (startDate) {
    conditions = and(conditions, gte(emotionRecords.recordDate, startDate));
  }
  if (endDate) {
    conditions = and(conditions, lte(emotionRecords.recordDate, endDate));
  }

  const [result, totalResult] = await Promise.all([
    db
      .select()
      .from(emotionRecords)
      .where(conditions)
      .orderBy(desc(emotionRecords.recordDate), desc(emotionRecords.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(emotionRecords)
      .where(conditions),
  ]);

  const total = totalResult[0]?.count ?? 0;

  const mappedRecords: EmotionRecord[] = result.map((row: any) => ({
    id: row.id.toString(),
    userId: row.userId,
    event: row.event,
    emotionType: row.emotionType ?? undefined,
    emotionIntensity: row.emotionIntensity ? Number(row.emotionIntensity) : undefined,
    need: row.need,
    aiRecognizedEmotion: row.aiRecognizedEmotion ?? undefined,
    aiRecognizedIntensity: row.aiRecognizedIntensity ? Number(row.aiRecognizedIntensity) : undefined,
    recordDate: row.recordDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  return { records: mappedRecords, total };
}

export async function getEmotionRecordById(
  id: number,
  userId: string
): Promise<EmotionRecord | null> {
  const result = await db
    .select()
    .from(emotionRecords)
    .where(
      and(
        eq(emotionRecords.id, id),
        eq(emotionRecords.userId, userId),
        isNull(emotionRecords.deletedAt)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    event: row.event,
    emotionType: row.emotionType ?? undefined,
    emotionIntensity: row.emotionIntensity ? Number(row.emotionIntensity) : undefined,
    need: row.need,
    aiRecognizedEmotion: row.aiRecognizedEmotion ?? undefined,
    aiRecognizedIntensity: row.aiRecognizedIntensity ? Number(row.aiRecognizedIntensity) : undefined,
    recordDate: row.recordDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createEmotionRecord(data: {
  userId: string;
  event: string;
  emotionType?: string;
  emotionIntensity?: number;
  need: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
  recordDate: string;
}): Promise<EmotionRecord> {
  const insertData = {
    userId: data.userId,
    event: data.event,
    emotionType: data.emotionType,
    emotionIntensity: data.emotionIntensity !== undefined ? data.emotionIntensity.toString() : undefined,
    need: data.need,
    aiRecognizedEmotion: data.aiRecognizedEmotion,
    aiRecognizedIntensity: data.aiRecognizedIntensity !== undefined ? data.aiRecognizedIntensity.toString() : undefined,
    recordDate: data.recordDate,
  };
  const result = await db
    .insert(emotionRecords)
    .values(insertData)
    .returning();

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    event: row.event,
    emotionType: row.emotionType ?? undefined,
    emotionIntensity: row.emotionIntensity ? Number(row.emotionIntensity) : undefined,
    need: row.need,
    aiRecognizedEmotion: row.aiRecognizedEmotion ?? undefined,
    aiRecognizedIntensity: row.aiRecognizedIntensity ? Number(row.aiRecognizedIntensity) : undefined,
    recordDate: row.recordDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateEmotionRecord(
  id: number,
  userId: string,
  data: {
    event?: string;
    emotionType?: string;
    emotionIntensity?: number;
    need?: string;
    aiRecognizedEmotion?: string;
    aiRecognizedIntensity?: number;
    recordDate?: string;
  }
): Promise<EmotionRecord | null> {
  const updateData = {
    event: data.event,
    emotionType: data.emotionType,
    emotionIntensity: data.emotionIntensity !== undefined ? data.emotionIntensity.toString() : undefined,
    need: data.need,
    aiRecognizedEmotion: data.aiRecognizedEmotion,
    aiRecognizedIntensity: data.aiRecognizedIntensity !== undefined ? data.aiRecognizedIntensity.toString() : undefined,
    recordDate: data.recordDate,
    updatedAt: new Date(),
  };
  const result = await db
    .update(emotionRecords)
    .set(updateData)
    .where(
      and(
        eq(emotionRecords.id, id),
        eq(emotionRecords.userId, userId),
        isNull(emotionRecords.deletedAt)
      )
    )
    .returning();

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    event: row.event,
    emotionType: row.emotionType ?? undefined,
    emotionIntensity: row.emotionIntensity ? Number(row.emotionIntensity) : undefined,
    need: row.need,
    aiRecognizedEmotion: row.aiRecognizedEmotion ?? undefined,
    aiRecognizedIntensity: row.aiRecognizedIntensity ? Number(row.aiRecognizedIntensity) : undefined,
    recordDate: row.recordDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteEmotionRecord(id: number, userId: string): Promise<boolean> {
  const result = await db
    .update(emotionRecords)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(emotionRecords.id, id),
        eq(emotionRecords.userId, userId),
        isNull(emotionRecords.deletedAt)
      )
    )
    .returning();

  return result.length > 0;
}
