import { and, count, eq, desc, isNull, like, ilike } from 'drizzle-orm';
import { db } from '../config/db';
import { tasks } from '@personal-assistant/drizzle/src/schema';
import { Task, Quadrant } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

export async function findAllTasksByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ tasks: Task[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);

  const where = and(
    eq(tasks.userId, userId),
    isNull(tasks.deletedAt)
  );

  const [result, totalResult] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(desc(tasks.createdAtTs))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count(tasks.id) }).from(tasks).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    tasks: result.map(rowToTask),
    total,
  };
}

export async function findTaskByTaskId(taskId: string, userId: string): Promise<Task | null> {
  const result = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.taskId, taskId),
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return rowToTask(result[0]);
}

export async function findTasksByQuadrant(quadrant: Quadrant, userId: string): Promise<Task[]> {
  const result = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.quadrant, quadrant),
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt)
    ))
    .orderBy(desc(tasks.createdAtTs));

  return result.map(rowToTask);
}

export async function searchTasksByKeyword(userId: string, keyword: string): Promise<Task[]> {
  const result = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt),
      keyword
        ? (ilike(tasks.title, `%${keyword}%`) as any)
        : undefined
    ))
    .orderBy(desc(tasks.createdAtTs));

  return result.map(rowToTask);
}

export async function createTask(data: {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  createdAt: string;
}): Promise<Task> {
  const result = await db
    .insert(tasks)
    .values({
      taskId: data.taskId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      quadrant: data.quadrant,
      createdAt: data.createdAt,
    })
    .returning();

  return rowToTask(result[0]);
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    quadrant?: Quadrant;
    completed?: boolean;
    completedAt?: string | null;
  }
): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(tasks.taskId, taskId),
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt)
    ))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return rowToTask(result[0]);
}

export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(tasks)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(tasks.taskId, taskId),
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt)
    ))
    .returning({ id: tasks.id });

  return result.length > 0;
}

export async function countTasksByUserId(userId: string): Promise<{ total: number; completed: number; pending: number }> {
  const [totalResult, completedResult] = await Promise.all([
    db
      .select({ count: count(tasks.id) })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt))),
    db
      .select({ count: count(tasks.id) })
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.completed, true),
        isNull(tasks.deletedAt)
      )),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const completed = completedResult[0]?.count ?? 0;
  const pending = total - completed;

  return { total, completed, pending };
}

export async function getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
  const result = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt),
    ));

  // 在内存中按日期过滤，因为 createdAt 是 date 类型
  return result
    .filter(row => {
      const taskDate = row.createdAt;
      return taskDate >= startDate && taskDate <= endDate;
    })
    .map(rowToTask);
}

function rowToTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id.toString(),
    taskId: row.taskId,
    userId: row.userId,
    title: row.title,
    description: row.description ?? undefined,
    quadrant: row.quadrant as Quadrant,
    completed: row.completed,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? undefined,
    linkedNoteId: row.linkedNoteId ?? undefined,
    createdAtTs: row.createdAtTs.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
