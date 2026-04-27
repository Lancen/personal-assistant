import { pgTable, serial, text, boolean, timestamp, date, integer, jsonb } from 'drizzle-orm/pg-core';

/**
 * 用户表 - 存储系统用户信息
 *
 * 字段说明：
 * - id: 内部自增主键
 * - userId: 外部暴露的用户UUID，防止ID被遍历
 * - email: 用户邮箱，唯一标识
 * - passwordHash: 密码哈希值（bcryptjs）
 * - name: 用户昵称/姓名
 * - isAdmin: 是否为管理员
 * - isActive: 账号是否启用
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 最后更新时间（UTC）
 * - deletedAt: 软删除时间（UTC）
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/**
 * 任务表 - 存储用户任务
 *
 * 字段说明：
 * - id: 内部自增主键
 * - taskId: 外部暴露的任务UUID
 * - userId: 关联用户ID
 * - title: 任务标题
 * - description: 任务描述（可选）
 * - quadrant: 优先级象限（重要紧急/重要不紧急/紧急不重要/不重要不紧急）
 * - completed: 是否完成
 * - createdAt: 创建日期
 * - completedAt: 完成日期（可选）
 * - linkedNoteId: 关联笔记ID（可选）
 * - createdAtTs: 创建时间戳（UTC）
 * - updatedAt: 最后更新时间（UTC）
 * - deletedAt: 软删除时间（UTC）
 */
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  taskId: text('task_id').notNull().unique(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  quadrant: text('quadrant').notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: date('created_at').notNull(),
  completedAt: date('completed_at'),
  linkedNoteId: text('linked_note_id'),
  createdAtTs: timestamp('created_at_ts', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/**
 * 笔记表 - 存储用户知识笔记
 *
 * 字段说明：
 * - id: 内部自增主键
 * - noteId: 外部暴露的笔记UUID
 * - userId: 关联用户ID
 * - title: 笔记标题
 * - content: 笔记内容
 * - tags: 标签JSON数组
 * - isPinned: 是否置顶
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 最后更新时间（UTC）
 * - deletedAt: 软删除时间（UTC）
 */
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  noteId: text('note_id').notNull().unique(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: jsonb('tags').notNull().$type<string[]>(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
