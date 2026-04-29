import { and, count, eq, desc, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import { emotionDailyChecks } from '@personal-assistant/drizzle/src/schema';
import { EmotionDailyCheck, EmotionCheckQuestion } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

export async function create(data: {
  checkId: string;
  userId: string;
  checkDate: string;
  totalScore: number;
  questionsJson: EmotionCheckQuestion[];
  isBelowThreshold: boolean;
}): Promise<EmotionDailyCheck> {
  const result = await db
    .insert(emotionDailyChecks)
    .values({
      checkId: data.checkId,
      userId: data.userId,
      checkDate: data.checkDate,
      totalScore: data.totalScore,
      questionsJson: data.questionsJson,
      isBelowThreshold: data.isBelowThreshold,
    })
    .returning();

  return rowToEmotionDailyCheck(result[0]);
}

export async function getByUserAndDate(userId: string, checkDate: string): Promise<EmotionDailyCheck | null> {
  const result = await db
    .select()
    .from(emotionDailyChecks)
    .where(and(
      eq(emotionDailyChecks.userId, userId),
      eq(emotionDailyChecks.checkDate, checkDate),
      isNull(emotionDailyChecks.deletedAt)
    ))
    .limit(1);

  if (result.length === 0) return null;
  return rowToEmotionDailyCheck(result[0]);
}

export async function update(
  checkId: string,
  data: {
    totalScore?: number;
    questionsJson?: EmotionCheckQuestion[];
    isBelowThreshold?: boolean;
  }
): Promise<EmotionDailyCheck | null> {
  const result = await db
    .update(emotionDailyChecks)
    .set(data)
    .where(eq(emotionDailyChecks.checkId, checkId))
    .returning();

  if (result.length === 0) return null;
  return rowToEmotionDailyCheck(result[0]);
}

export async function getByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ checks: EmotionDailyCheck[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);
  const where = and(eq(emotionDailyChecks.userId, userId), isNull(emotionDailyChecks.deletedAt));

  const [result, totalResult] = await Promise.all([
    db.select().from(emotionDailyChecks).where(where)
      .orderBy(desc(emotionDailyChecks.checkDate))
      .limit(pageSize).offset(offset),
    db.select({ count: count(emotionDailyChecks.id) }).from(emotionDailyChecks).where(where),
  ]);

  return {
    checks: result.map(rowToEmotionDailyCheck),
    total: totalResult[0]?.count ?? 0,
  };
}

function rowToEmotionDailyCheck(row: typeof emotionDailyChecks.$inferSelect): EmotionDailyCheck {
  return {
    checkId: row.checkId,
    userId: row.userId,
    checkDate: row.checkDate,
    totalScore: row.totalScore,
    questionsJson: row.questionsJson as EmotionCheckQuestion[],
    isBelowThreshold: row.isBelowThreshold,
    createdAt: row.createdAt.toISOString(),
  };
}
