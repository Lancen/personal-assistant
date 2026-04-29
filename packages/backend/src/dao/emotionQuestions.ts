import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import { emotionQuestions } from '@personal-assistant/drizzle/src/schema';
import { EmotionQuestion } from '@personal-assistant/types';

const DIMENSIONS = ['精力水平', '情绪稳定性', '愉悦感', '压力水平', '睡眠质量', '自信心'];

export async function getActiveByDimension(dimension: string): Promise<EmotionQuestion[]> {
  const result = await db
    .select()
    .from(emotionQuestions)
    .where(and(
      eq(emotionQuestions.dimension, dimension),
      eq(emotionQuestions.isActive, true)
    ));

  return result.map(rowToEmotionQuestion);
}

export async function getRandomForCheck(): Promise<EmotionQuestion[]> {
  const selected: EmotionQuestion[] = [];

  // 每个维度至少抽 1 题
  for (const dimension of DIMENSIONS) {
    const questions = await getActiveByDimension(dimension);
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      selected.push(questions[randomIndex]);
    }
  }

  // 补充到 10 题（从剩余活跃题目中随机抽）
  if (selected.length < 10) {
    const selectedIds = selected.map(q => q.id);
    const allActive = await db
      .select()
      .from(emotionQuestions)
      .where(eq(emotionQuestions.isActive, true));

    const remaining = allActive
      .filter(q => !selectedIds.includes(q.id))
      .map(rowToEmotionQuestion);

    // Fisher-Yates 洗牌后取需要的数量
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const needed = 10 - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  return selected;
}

export async function getByIds(ids: number[]): Promise<EmotionQuestion[]> {
  if (ids.length === 0) return [];
  const result = await db
    .select()
    .from(emotionQuestions)
    .where(inArray(emotionQuestions.id, ids));

  return result.map(rowToEmotionQuestion);
}

function rowToEmotionQuestion(row: typeof emotionQuestions.$inferSelect): EmotionQuestion {
  return {
    id: row.id,
    dimension: row.dimension,
    questionText: row.questionText,
    isActive: row.isActive,
  };
}
