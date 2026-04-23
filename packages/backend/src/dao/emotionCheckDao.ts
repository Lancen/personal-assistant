import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import { emotionQuestions, emotionDailyChecks } from '@personal-assistant/drizzle/src/schema';
import { EmotionQuestion, EmotionDailyCheck } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

// 获取所有激活的问题
export async function getAllActiveQuestions(): Promise<EmotionQuestion[]> {
  const result = await db
    .select({
      id: emotionQuestions.id,
      dimension: emotionQuestions.dimension,
      questionText: emotionQuestions.questionText,
    })
    .from(emotionQuestions)
    .where(eq(emotionQuestions.isActive, true));

  return result;
}

// 检查今日是否已经完成检测
export async function getTodaysCheck(
  userId: string,
  checkDate: string
): Promise<EmotionDailyCheck | null> {
  const result = await db
    .select()
    .from(emotionDailyChecks)
    .where(
      and(
        eq(emotionDailyChecks.userId, userId),
        eq(emotionDailyChecks.checkDate, checkDate),
        isNull(emotionDailyChecks.deletedAt)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    checkDate: row.checkDate,
    totalScore: row.totalScore,
    isBelowThreshold: row.isBelowThreshold,
    questions: JSON.parse(row.questionsJson as string),
    createdAt: row.createdAt.toISOString(),
  };
}

// 创建每日检测结果
export async function createDailyCheck(data: {
  userId: string;
  checkDate: string;
  totalScore: number;
  isBelowThreshold: boolean;
  questions: any[];
}): Promise<EmotionDailyCheck> {
  const result = await db
    .insert(emotionDailyChecks)
    .values({
      userId: data.userId,
      checkDate: data.checkDate,
      totalScore: data.totalScore,
      isBelowThreshold: data.isBelowThreshold,
      questionsJson: JSON.stringify(data.questions),
    })
    .returning();

  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    checkDate: row.checkDate,
    totalScore: row.totalScore,
    isBelowThreshold: row.isBelowThreshold,
    questions: JSON.parse(row.questionsJson as string),
    createdAt: row.createdAt.toISOString(),
  };
}

// 获取历史检测记录
export async function getCheckHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ checks: EmotionDailyCheck[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);

  const [result, totalResult] = await Promise.all([
    db
      .select()
      .from(emotionDailyChecks)
      .where(
        and(
          eq(emotionDailyChecks.userId, userId),
          isNull(emotionDailyChecks.deletedAt)
        )
      )
      .orderBy(desc(emotionDailyChecks.checkDate))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(emotionDailyChecks)
      .where(
        and(
          eq(emotionDailyChecks.userId, userId),
          isNull(emotionDailyChecks.deletedAt)
        )
      ),
  ]);

  const total = totalResult[0]?.count ?? 0;

  const checks: EmotionDailyCheck[] = result.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    checkDate: row.checkDate,
    totalScore: row.totalScore,
    isBelowThreshold: row.isBelowThreshold,
    questions: JSON.parse(row.questionsJson as string),
    createdAt: row.createdAt.toISOString(),
  }));

  return { checks, total };
}

// 获取得分趋势数据（用于多周期分析）
export async function getScoreTrend(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; score: number }>> {
  const result = await db
    .select({
      checkDate: emotionDailyChecks.checkDate,
      totalScore: emotionDailyChecks.totalScore,
    })
    .from(emotionDailyChecks)
    .where(
      and(
        eq(emotionDailyChecks.userId, userId),
        isNull(emotionDailyChecks.deletedAt)
      )
    )
    .orderBy(desc(emotionDailyChecks.checkDate));

  return result.map((row: any) => ({
    date: row.checkDate,
    score: row.totalScore,
  }));
}
