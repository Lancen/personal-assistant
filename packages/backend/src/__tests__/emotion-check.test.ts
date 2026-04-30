import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, createTestUser, cleanupTestUser, cleanupAllTestData } from '../testHelpers';

const app = createTestApp();

describe('AC-2: 情绪健康检测', () => {
  let testUser: { user: any; token: string };

  beforeAll(async () => {
    testUser = await createTestUser({ name: 'Check User' });
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.user.userId);
  });

  // V-2.1 首次出题 → 10题 + 每维度≥1
  it('首次生成返回 10 题，每维度至少 1 题', async () => {
    const res = await request(app)
      .post('/api/emotion-check/generate')
      .set('Authorization', `Bearer ${testUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(10);

    const dimensions = new Set(res.body.data.questions.map((q: any) => q.dimension));
    expect(dimensions.size).toBeGreaterThanOrEqual(6);
  });

  // V-2.2 重复出题幂等
  it('重复生成返回相同题目（幂等）', async () => {
    const first = await request(app)
      .post('/api/emotion-check/generate')
      .set('Authorization', `Bearer ${testUser.token}`);

    const second = await request(app)
      .post('/api/emotion-check/generate')
      .set('Authorization', `Bearer ${testUser.token}`);

    const firstIds = first.body.data.questions.map((q: any) => q.id).sort();
    const secondIds = second.body.data.questions.map((q: any) => q.id).sort();
    expect(firstIds).toEqual(secondIds);
  });

  // V-2.3 低分提交 → isBelowThreshold=true + 建议
  it('总分低于阈值返回 isBelowThreshold=true + 建议', async () => {
    const genRes = await request(app)
      .post('/api/emotion-check/generate')
      .set('Authorization', `Bearer ${testUser.token}`);

    const questions = genRes.body.data.questions;
    // 每题答2分，总分20 < 阈值25
    const answers = questions.map((q: any) => ({
      questionId: q.id,
      score: 2,
    }));

    const res = await request(app)
      .post('/api/emotion-check/submit')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({ answers });

    expect(res.status).toBe(200);
    expect(res.body.data.isBelowThreshold).toBe(true);
    expect(res.body.data.suggestion).toContain('重大决策');
    expect(res.body.data.totalScore).toBe(20);
  });

  // V-2.4 评分越界 → 400
  it('某题评分=6 返回 400', async () => {
    const newUser = await createTestUser({ name: 'Score Bound User' });

    const genRes = await request(app)
      .post('/api/emotion-check/generate')
      .set('Authorization', `Bearer ${newUser.token}`);

    const questions = genRes.body.data.questions;
    const answers = questions.map((q: any, i: number) => ({
      questionId: q.id,
      score: i === 0 ? 6 : 3,
    }));

    const res = await request(app)
      .post('/api/emotion-check/submit')
      .set('Authorization', `Bearer ${newUser.token}`)
      .send({ answers });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('1-5');

    await cleanupTestUser(newUser.user.userId);
  });
});
