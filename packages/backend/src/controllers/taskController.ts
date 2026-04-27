import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { success, error, paginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

/**
 * 获取所有任务（分页）
 * @query page - 页码
 * @query pageSize - 每页条数
 * @requires 登录认证
 */
export async function getAllTasksController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE;

  const { tasks, total } = await taskService.getTasksForUser(userId, page, pageSize);
  return res.json(paginated(tasks, page, total, pageSize));
}

/**
 * 获取单个任务详情
 * @param taskId - 任务ID
 * @requires 登录认证
 */
export async function getTaskController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;

  const task = await taskService.getTaskById(taskId, userId);
  if (!task) {
    return res.status(404).json(error('任务不存在'));
  }

  return res.json(success(task));
}

/**
 * 获取任务统计
 * @requires 登录认证
 */
export async function getStatsController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const stats = await taskService.getStats(userId);
  return res.json(success(stats));
}

/**
 * 搜索任务
 * @query keyword - 搜索关键词
 * @requires 登录认证
 */
export async function searchTasksController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const keyword = (req.query.keyword as string) || '';

  const tasks = await taskService.searchTasks(userId, keyword);
  return res.json(success(tasks));
}

/**
 * 创建任务
 * @body title - 任务标题
 * @body description - 任务描述（可选）
 * @body quadrant - 优先级象限
 * @requires 登录认证
 */
export async function createTaskController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { title, description, quadrant } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json(error('任务标题不能为空'));
  }

  if (!quadrant) {
    return res.status(400).json(error('优先级象限不能为空'));
  }

  const task = await taskService.createTask(userId, { title, description, quadrant });
  return res.json(success(task, '任务创建成功'));
}

/**
 * 更新任务
 * @param taskId - 任务ID
 * @body title - 任务标题（可选）
 * @body description - 任务描述（可选）
 * @body quadrant - 优先级象限（可选）
 * @body completed - 是否完成（可选）
 * @requires 登录认证
 */
export async function updateTaskController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;
  const { title, description, quadrant, completed } = req.body;

  const task = await taskService.updateTask(taskId, userId, {
    title,
    description,
    quadrant,
    completed,
  });

  if (!task) {
    return res.status(404).json(error('任务不存在'));
  }

  return res.json(success(task, '任务更新成功'));
}

/**
 * 切换任务完成状态
 * @param taskId - 任务ID
 * @requires 登录认证
 */
export async function toggleCompletedController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;

  const task = await taskService.toggleCompleted(taskId, userId);
  if (!task) {
    return res.status(404).json(error('任务不存在'));
  }

  return res.json(success(task));
}

/**
 * 删除任务
 * @param taskId - 任务ID
 * @requires 登录认证
 */
export async function deleteTaskController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;

  const deleted = await taskService.deleteTask(taskId, userId);
  if (!deleted) {
    return res.status(404).json(error('任务不存在'));
  }

  return res.json(success(null, '任务删除成功'));
}

/**
 * 按象限获取任务
 * @param quadrant - 象限名称
 * @requires 登录认证
 */
export async function getByQuadrantController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const quadrant = req.params.quadrant as string;

  const tasks = await taskService.getTasksByQuadrant(quadrant as any, userId);
  return res.json(success(tasks));
}

/**
 * 按日期范围获取任务
 * @query startDate - 开始日期 YYYY-MM-DD
 * @query endDate - 结束日期 YYYY-MM-DD
 * @requires 登录认证
 */
export async function getByDateRangeController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const tasks = await taskService.getTasksByDateRange(userId, startDate, endDate);
  return res.json(success(tasks));
}
