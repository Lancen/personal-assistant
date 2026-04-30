import request from 'supertest';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './config/db';
import * as schema from '@personal-assistant/drizzle/src/schema';
import { eq } from 'drizzle-orm';
import authRoutes from './routes/auth';
import emotionRoutes from './routes/emotion';
import emotionCheckRoutes from './routes/emotionCheck';
import aiRoutes from './routes/ai';
import settingsRoutes from './routes/settings';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 创建测试用 Express app（不启动 listen）
export function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/emotion/records', emotionRoutes);
  app.use('/api/emotion-check', emotionCheckRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/settings', settingsRoutes);

  return app;
}

// 生成测试用 JWT token
export function generateTestToken(user: {
  id: number;
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
}): string {
  return jwt.sign(
    {
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 创建测试用户并返回用户信息 + token
export async function createTestUser(overrides?: {
  email?: string;
  name?: string;
  isAdmin?: boolean;
}) {
  const userId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = overrides?.email || `${userId}@test.com`;

  const [user] = await db.insert(schema.users).values({
    userId,
    email,
    passwordHash: '$2a$10$test.hash.not.real.but.ok',
    name: overrides?.name || 'Test User',
    isAdmin: overrides?.isAdmin ?? false,
  }).returning();

  const token = generateTestToken({
    id: user.id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  });

  return { user, token };
}

// 清理测试用户及其关联数据
export async function cleanupTestUser(userId: string) {
  await db.delete(schema.emotionRecords).where(eq(schema.emotionRecords.userId, userId));
  await db.delete(schema.emotionDailyChecks).where(eq(schema.emotionDailyChecks.userId, userId));
  await db.delete(schema.userSettings).where(eq(schema.userSettings.userId, userId));
  await db.delete(schema.users).where(eq(schema.users.userId, userId));
}

// 清理所有测试相关表数据（按外键依赖顺序）
export async function cleanupAllTestData() {
  await db.delete(schema.emotionRecords);
  await db.delete(schema.emotionDailyChecks);
  await db.delete(schema.userSettings);
}
