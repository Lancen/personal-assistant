import { randomUUID } from 'crypto';
import * as emotionQuestionDao from '../dao/emotionQuestions';
import * as emotionDailyCheckDao from '../dao/emotionDailyChecks';
import * as userSettingsDao from '../dao/userSettings';
import { EmotionCheckStatus, EmotionCheckResult, EmotionCheckQuestion } from '@personal-assistant/types';

export async function getCheckStatus(userId: string): Promise<EmotionCheckStatus> {
  const today = new Date().toISOString().split('T')[0];
  const check = await emotionDailyCheckDao.getByUserAndDate(userId, today);

  if (check && check.totalScore > 0) {
    return {
      completed: true,
      checkDate: check.checkDate,
      totalScore: check.totalScore,
    };
  }

  return {
    completed: false,
    checkDate: null,
    totalScore: null,
  };
}

export async function generateQuestions(userId: string): Promise<{ questions: EmotionCheckQuestion[]; checkId: string; checkDate: string }> {
  const today = new Date().toISOString().split('T')[0];
  const existing = await emotionDailyCheckDao.getByUserAndDate(userId, today);

  // 幂等：如果已有当日的检测记录，返回已有题目
  if (existing) {
    return {
      questions: existing.questionsJson,
      checkId: existing.checkId,
      checkDate: existing.checkDate,
    };
  }

  // 随机抽取 10 题
  const questions = await emotionQuestionDao.getRandomForCheck();
  const checkId = randomUUID();

  // 创建检测记录（初始总分 0，待提交后更新）
  const checkQuestions: EmotionCheckQuestion[] = questions.map(q => ({
    id: q.id,
    dimension: q.dimension,
    questionText: q.questionText,
  }));

  await emotionDailyCheckDao.create({
    checkId,
    userId,
    checkDate: today,
    totalScore: 0,
    questionsJson: checkQuestions,
    isBelowThreshold: false,
  });

  return { questions: checkQuestions, checkId, checkDate: today };
}

export async function submitAnswers(
  userId: string,
  answers: { questionId: number; score: number }[]
): Promise<EmotionCheckResult> {
  const today = new Date().toISOString().split('T')[0];
  const check = await emotionDailyCheckDao.getByUserAndDate(userId, today);

  if (!check) {
    const err: any = new Error('请先生成今日检测题目');
    err.statusCode = 400;
    throw err;
  }

  // 如果已提交（totalScore > 0），返回已有结果
  if (check.totalScore > 0) {
    return buildResult(check);
  }

  // 校验答案数量
  if (answers.length !== check.questionsJson.length) {
    const err: any = new Error('答案数量与题目数量不匹配');
    err.statusCode = 400;
    throw err;
  }

  // 校验评分范围
  for (const answer of answers) {
    if (answer.score < 1 || answer.score > 5) {
      const err: any = new Error('评分必须在1-5之间');
      err.statusCode = 400;
      throw err;
    }
  }

  // 计算总分和维度得分
  let totalScore = 0;
  const dimensionScores: Record<string, number> = {};
  const dimensionCounts: Record<string, number> = {};
  const updatedQuestions = check.questionsJson.map(q => {
    const answer = answers.find(a => a.questionId === q.id);
    const score = answer?.score ?? 0;
    totalScore += score;

    if (!dimensionScores[q.dimension]) {
      dimensionScores[q.dimension] = 0;
      dimensionCounts[q.dimension] = 0;
    }
    dimensionScores[q.dimension] += score;
    dimensionCounts[q.dimension]++;

    return { ...q, score };
  });

  // 计算维度平均分
  for (const dim of Object.keys(dimensionScores)) {
    dimensionScores[dim] = Math.round((dimensionScores[dim] / dimensionCounts[dim]) * 10) / 10;
  }

  // 获取用户阈值
  const settings = await userSettingsDao.getByUserId(userId);
  const threshold = settings?.emotionThreshold ?? 25;

  const isBelowThreshold = totalScore < threshold;
  const suggestion = isBelowThreshold ? '你当前情绪状态偏低，建议今天不做重大决策' : undefined;

  // 更新检测记录
  await emotionDailyCheckDao.update(check.checkId, {
    totalScore,
    questionsJson: updatedQuestions,
    isBelowThreshold,
  });

  return {
    checkId: check.checkId,
    totalScore,
    isBelowThreshold,
    suggestion,
    dimensionScores,
  };
}

export async function getHistory(
  userId: string,
  page?: number,
  pageSize?: number
): Promise<{ checks: EmotionCheckResult[]; total: number }> {
  const { checks, total } = await emotionDailyCheckDao.getByUserId(userId, page, pageSize);
  return {
    checks: checks.filter(c => c.totalScore > 0).map(buildResult),
    total,
  };
}

function buildResult(check: import('@personal-assistant/types').EmotionDailyCheck): EmotionCheckResult {
  const dimensionScores: Record<string, number> = {};
  const dimensionCounts: Record<string, number> = {};

  for (const q of check.questionsJson) {
    if (q.score !== undefined) {
      if (!dimensionScores[q.dimension]) {
        dimensionScores[q.dimension] = 0;
        dimensionCounts[q.dimension] = 0;
      }
      dimensionScores[q.dimension] += q.score;
      dimensionCounts[q.dimension]++;
    }
  }

  for (const dim of Object.keys(dimensionScores)) {
    dimensionScores[dim] = Math.round((dimensionScores[dim] / dimensionCounts[dim]) * 10) / 10;
  }

  return {
    checkId: check.checkId,
    totalScore: check.totalScore,
    isBelowThreshold: check.isBelowThreshold,
    suggestion: check.isBelowThreshold ? '你当前情绪状态偏低，建议今天不做重大决策' : undefined,
    dimensionScores,
  };
}
