import { pgTable, serial, text, boolean, timestamp, date, integer, jsonb, numeric } from 'drizzle-orm/pg-core';

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

export const emotionRecords = pgTable('emotion_records', {
  id: serial('id').primaryKey(),
  recordId: text('record_id').notNull().unique(),
  userId: text('user_id').notNull(),
  event: text('event').notNull(),
  emotionType: text('emotion_type').notNull(),
  emotionIntensity: numeric('emotion_intensity', { precision: 4, scale: 2 }).notNull(),
  need: text('need').notNull(),
  aiRecognizedEmotion: text('ai_recognized_emotion'),
  aiRecognizedIntensity: numeric('ai_recognized_intensity', { precision: 4, scale: 2 }),
  recordDate: date('record_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const emotionQuestions = pgTable('emotion_questions', {
  id: serial('id').primaryKey(),
  dimension: text('dimension').notNull(),
  questionText: text('question_text').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const emotionDailyChecks = pgTable('emotion_daily_checks', {
  id: serial('id').primaryKey(),
  checkId: text('check_id').notNull().unique(),
  userId: text('user_id').notNull(),
  checkDate: date('check_date').notNull(),
  totalScore: integer('total_score').notNull(),
  questionsJson: jsonb('questions_json').notNull(),
  isBelowThreshold: boolean('is_below_threshold').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  aiProvider: text('ai_provider').notNull().default('zhipu'),
  aiModel: text('ai_model').notNull().default('glm-4'),
  aiApiKey: text('ai_api_key'),
  emotionThreshold: integer('emotion_threshold').notNull().default(25),
  notificationEnabled: boolean('notification_enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
