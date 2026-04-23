import { Response } from 'express';
import {
  getAllActiveQuestions,
  getTodaysCheck,
  createDailyCheck,
  getCheckHistory,
  getScoreTrend,
} from '../dao/emotionCheckDao';
import { success, error, paginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { EmotionQuestion } from '@personal-assistant/types';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

// 默认阈值 - 总分低于25提醒
const DEFAULT_THRESHOLD = 25;

// 获取今日检测状态
export async function getStatusController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];
  const existing = await getTodaysCheck(userId, today);

  return res.json(success({
    alreadyCompleted: !!existing,
    existingCheck: existing,
  }));
}

// 生成今日检测题目
export async function generateQuestionsController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  // 检查是否已经完成
  const existing = await getTodaysCheck(userId, today);
  if (existing) {
    return res.json(success({
      questions: existing.questions.map((q: any) => ({
        id: q.questionId,
        dimension: q.dimension,
        questionText: q.questionText,
      })),
    }));
  }

  const allQuestions = await getAllActiveQuestions();

  // 按维度分组
  const byDimension = new Map<string, EmotionQuestion[]>();
  allQuestions.forEach((q: EmotionQuestion) => {
    if (!byDimension.has(q.dimension)) {
      byDimension.set(q.dimension, []);
    }
    byDimension.get(q.dimension)!.push(q);
  });

  // 六个维度各抽一题（保证每个维度都有）
  const selected: EmotionQuestion[] = [];
  Array.from(byDimension.entries()).forEach(([_, questions]) => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    selected.push(questions[randomIndex]);
  });

  // 如果不够10题，从剩余题目中随机抽取补充
  const remaining = allQuestions.filter((q: EmotionQuestion) => !selected.find(s => s.id === q.id));
  while (selected.length < 10 && remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[randomIndex]);
    remaining.splice(randomIndex, 1);
  }

  // 打乱顺序
  const shuffled = selected.sort(() => Math.random() - 0.5);

  return res.json(success({ questions: shuffled }));
}

// 提交检测答案
export async function submitAnswersController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length !== 10) {
    return res.status(400).json(error('必须回答10个问题'));
  }

  // 检查今日是否已经完成
  const existing = await getTodaysCheck(userId, today);
  if (existing) {
    return res.status(400).json(error('今日已经完成检测'));
  }

  // 获取完整问题信息
  const allQuestions = await getAllActiveQuestions();
  const questionsWithText = answers.map((answer: any) => {
    const question = allQuestions.find(q => q.id === answer.questionId);
    return {
      questionId: answer.questionId,
      questionText: question?.questionText || '',
      dimension: question?.dimension || '',
      score: answer.score,
    };
  });

  // 计算总分
  const totalScore = questionsWithText.reduce((sum, q) => sum + q.score, 0);
  const isBelowThreshold = totalScore < DEFAULT_THRESHOLD;

  let message = '';
  if (isBelowThreshold) {
    message = '你当前情绪状态偏低，建议今天不做重大决策';
  } else {
    message = '检测完成，情绪状态正常';
  }

  const check = await createDailyCheck({
    userId,
    checkDate: today,
    totalScore,
    isBelowThreshold,
    questions: questionsWithText,
  });

  return res.json(success({
    check,
    threshold: DEFAULT_THRESHOLD,
    message,
  }));
}

// 获取历史检测记录
export async function getHistoryController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const page = parseInt((req.query.page as string | undefined) || '1') || 1;
  const pageSize = parseInt((req.query.pageSize as string | undefined) || String(DEFAULT_PAGE_SIZE)) || DEFAULT_PAGE_SIZE;

  const { checks, total } = await getCheckHistory(userId, page, pageSize);
  return res.json(paginated(checks, page, total, pageSize));
}

// 获取多周期分析数据
export async function getAnalysisController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.userId;
  const period = req.query.period as 'day' | 'week' | 'month' | 'quarter';

  // 计算时间范围
  const end = new Date();
  let start = new Date();

  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  const startDateStr = start.toISOString().split('T')[0];
  const endDateStr = end.toISOString().split('T')[0];

  const trendData = await getScoreTrend(userId, startDateStr, endDateStr);

  // 情绪分布统计需要情绪记录，这里先返回趋势数据，AI摘要后续由前端或AI生成
  // TODO: 调用AI服务做总结提炼

  return res.json(success({
    trendData,
    emotionDistribution: [],
    aiSummary: {
      commonTriggers: [],
      conclusion: '数据收集完成，分析结果需要AI计算',
      suggestions: [],
    },
  }));
}
