import { and, count, eq, desc, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import { emotionRecords } from '@personal-assistant/drizzle/src/schema';
import { EmotionRecord } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

export async function create(data: {
  recordId: string;
  userId: string;
  event: string;
  emotionType: string;
  emotionIntensity: number;
  need: string;
  recordDate: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
}): Promise<EmotionRecord> {
  const result = await db
    .insert(emotionRecords)
    .values({
      recordId: data.recordId,
      userId: data.userId,
      event: data.event,
      emotionType: data.emotionType,
      emotionIntensity: data.emotionIntensity.toString(),
      need: data.need,
      recordDate: data.recordDate,
      aiRecognizedEmotion: data.aiRecognizedEmotion,
      aiRecognizedIntensity: data.aiRecognizedIntensity?.toString(),
    })
    .returning();

  return rowToEmotionRecord(result[0]);
}

export async function getById(recordId: string, userId: string): Promise<EmotionRecord | null> {
  const result = await db
    .select()
    .from(emotionRecords)
    .where(and(
      eq(emotionRecords.recordId, recordId),
      eq(emotionRecords.userId, userId),
      isNull(emotionRecords.deletedAt)
    ))
    .limit(1);

  if (result.length === 0) return null;
  return rowToEmotionRecord(result[0]);
}

export async function getByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ records: EmotionRecord[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);
  const where = and(eq(emotionRecords.userId, userId), isNull(emotionRecords.deletedAt));

  const [result, totalResult] = await Promise.all([
    db.select().from(emotionRecords).where(where)
      .orderBy(desc(emotionRecords.recordDate), desc(emotionRecords.createdAt))
      .limit(pageSize).offset(offset),
    db.select({ count: count(emotionRecords.id) }).from(emotionRecords).where(where),
  ]);

  return {
    records: result.map(rowToEmotionRecord),
    total: totalResult[0]?.count ?? 0,
  };
}

export async function update(
  recordId: string,
  userId: string,
  data: {
    event?: string;
    emotionType?: string;
    emotionIntensity?: number;
    need?: string;
    aiRecognizedEmotion?: string;
    aiRecognizedIntensity?: number;
  }
): Promise<EmotionRecord | null> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.emotionIntensity !== undefined) {
    updateData.emotionIntensity = data.emotionIntensity.toString();
  }
  if (data.aiRecognizedIntensity !== undefined) {
    updateData.aiRecognizedIntensity = data.aiRecognizedIntensity.toString();
  }

  const result = await db
    .update(emotionRecords)
    .set(updateData)
    .where(and(
      eq(emotionRecords.recordId, recordId),
      eq(emotionRecords.userId, userId),
      isNull(emotionRecords.deletedAt)
    ))
    .returning();

  if (result.length === 0) return null;
  return rowToEmotionRecord(result[0]);
}

export async function softDelete(recordId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(emotionRecords)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(emotionRecords.recordId, recordId),
      eq(emotionRecords.userId, userId),
      isNull(emotionRecords.deletedAt)
    ))
    .returning({ id: emotionRecords.id });

  return result.length > 0;
}

export async function countByUserId(userId: string): Promise<number> {
  const result = await db
    .select({ count: count(emotionRecords.id) })
    .from(emotionRecords)
    .where(and(eq(emotionRecords.userId, userId), isNull(emotionRecords.deletedAt)));
  return result[0]?.count ?? 0;
}

export async function countByUserIdAndDate(userId: string, date: string): Promise<number> {
  const result = await db
    .select({ count: count(emotionRecords.id) })
    .from(emotionRecords)
    .where(and(
      eq(emotionRecords.userId, userId),
      eq(emotionRecords.recordDate, date),
      isNull(emotionRecords.deletedAt)
    ));
  return result[0]?.count ?? 0;
}

function rowToEmotionRecord(row: typeof emotionRecords.$inferSelect): EmotionRecord {
  return {
    recordId: row.recordId,
    userId: row.userId,
    event: row.event,
    emotionType: row.emotionType,
    emotionIntensity: parseFloat(row.emotionIntensity),
    need: row.need,
    aiRecognizedEmotion: row.aiRecognizedEmotion ?? undefined,
    aiRecognizedIntensity: row.aiRecognizedIntensity ? parseFloat(row.aiRecognizedIntensity) : undefined,
    recordDate: row.recordDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
