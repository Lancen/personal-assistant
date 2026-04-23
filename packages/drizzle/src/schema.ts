import { pgTable, serial, text, boolean, timestamp, date, decimal, integer, jsonb } from 'drizzle-orm/pg-core';

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
 * 情绪记录表 - 存储用户每日情绪记录
 *
 * 字段说明：
 * - id: 内部自增主键
 * - userId: 关联用户ID
 * - event: 事件描述 - 发生了什么事
 * - emotionType: 用户手动标注的情绪类型
 * - emotionIntensity: 情绪强度（1-5）
 * - need: 需求描述 - 你需要什么支持
 * - aiRecognizedEmotion: AI识别出的情绪类型
 * - aiRecognizedIntensity: AI识别出的情绪强度
 * - recordDate: 记录日期
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 最后更新时间（UTC）
 * - deletedAt: 软删除时间（UTC）
 */
export const emotionRecords = pgTable('emotion_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  event: text('event').notNull(),
  emotionType: text('emotion_type'),
  emotionIntensity: decimal('emotion_intensity', { precision: 4, scale: 2 }),
  need: text('need').notNull(),
  aiRecognizedEmotion: text('ai_recognized_emotion'),
  aiRecognizedIntensity: decimal('ai_recognized_intensity', { precision: 4, scale: 2 }),
  recordDate: date('record_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/**
 * 情绪检测问题表 - 存储情绪健康检测题目
 *
 * 字段说明：
 * - id: 内部自增主键
 * - dimension: 情绪维度（如：抑郁/焦虑/压力/自尊等）
 * - questionText: 问题文本
 * - isActive: 是否启用该题目
 * - createdAt: 创建时间（UTC）
 */
export const emotionQuestions = pgTable('emotion_questions', {
  id: serial('id').primaryKey(),
  dimension: text('dimension').notNull(),
  questionText: text('question_text').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 每日情绪检测结果表 - 存储用户每日情绪检测的回答结果
 *
 * 字段说明：
 * - id: 内部自增主键
 * - userId: 关联用户ID
 * - checkDate: 检测日期
 * - totalScore: 总分（每题 0-4 分，共 10 题，满分 40）
 * - questionsJson: 用户答题详情 JSON
 * - isBelowThreshold: 总分是否低于警戒阈值（默认 < 25）
 * - createdAt: 创建时间（UTC）
 * - deletedAt: 软删除时间（UTC）
 */
export const emotionDailyChecks = pgTable('emotion_daily_checks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  checkDate: date('check_date').notNull(),
  totalScore: integer('total_score').notNull(),
  questionsJson: jsonb('questions_json').notNull(),
  isBelowThreshold: boolean('is_below_threshold').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// 创建索引（在PostgreSQL中需要手动创建，这里schema定义不包含索引）
// 索引：
// - emotion_records(user_id)
// - emotion_records(record_date)
// - emotion_daily_checks(user_id)
// - emotion_daily_checks(check_date)
