import { randomUUID } from 'crypto';
import * as taskDao from '../dao/tasks';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStats, Quadrant } from '@personal-assistant/types';

export async function getTasksForUser(userId: string, page?: number, pageSize?: number): Promise<{ tasks: Task[]; total: number }> {
  return taskDao.findAllTasksByUserId(userId, page, pageSize);
}

export async function getTaskById(taskId: string, userId: string): Promise<Task | null> {
  return taskDao.findTaskByTaskId(taskId, userId);
}

export async function getTasksByQuadrant(quadrant: Quadrant, userId: string): Promise<Task[]> {
  return taskDao.findTasksByQuadrant(quadrant, userId);
}

export async function searchTasks(userId: string, keyword: string): Promise<Task[]> {
  return taskDao.searchTasksByKeyword(userId, keyword);
}

export async function createTask(userId: string, data: CreateTaskRequest): Promise<Task> {
  const taskId = randomUUID();
  const today = new Date().toISOString().split('T')[0];

  return taskDao.createTask({
    taskId,
    userId,
    title: data.title,
    description: data.description,
    quadrant: data.quadrant,
    createdAt: today,
  });
}

export async function updateTask(taskId: string, userId: string, data: UpdateTaskRequest): Promise<Task | null> {
  // 如果 completed 变为 true，设置 completedAt
  const updateData: any = { ...data };
  if (data.completed === true) {
    updateData.completedAt = new Date().toISOString().split('T')[0];
  } else if (data.completed === false) {
    updateData.completedAt = null;
  }

  return taskDao.updateTask(taskId, userId, updateData);
}

export async function toggleCompleted(taskId: string, userId: string): Promise<Task | null> {
  const existing = await taskDao.findTaskByTaskId(taskId, userId);
  if (!existing) return null;

  const newCompleted = !existing.completed;
  const completedAt = newCompleted ? new Date().toISOString().split('T')[0] : null;

  return taskDao.updateTask(taskId, userId, {
    completed: newCompleted,
    completedAt,
  });
}

export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  return taskDao.deleteTask(taskId, userId);
}

export async function getStats(userId: string): Promise<TaskStats> {
  return taskDao.countTasksByUserId(userId);
}

export async function getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
  return taskDao.getTasksByDateRange(userId, startDate, endDate);
}
