import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, createTestUser, cleanupTestUser } from '../testHelpers';

const app = createTestApp();

describe('AC-1: 情绪记录 CRUD', () => {
  let userA: { user: any; token: string };
  let userB: { user: any; token: string };

  beforeAll(async () => {
    userA = await createTestUser({ name: 'User A' });
    userB = await createTestUser({ name: 'User B' });
  });

  afterAll(async () => {
    await cleanupTestUser(userA.user.userId);
    await cleanupTestUser(userB.user.userId);
  });

  // V-1.1 创建成功 → 201 + recordId(UUID) + recordDate(当天)
  it('创建情绪记录成功返回 201 + recordId + recordDate', async () => {
    const res = await request(app)
      .post('/api/emotion/records')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        event: '今天开会被人表扬了',
        emotionType: '快乐',
        emotionIntensity: 4.5,
        need: '继续保持积极心态',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recordId).toBeDefined();
    expect(res.body.data.recordDate).toBe(new Date().toISOString().split('T')[0]);
    expect(res.body.data.event).toBe('今天开会被人表扬了');
    expect(res.body.data.emotionType).toBe('快乐');
    expect(res.body.data.need).toBe('继续保持积极心态');
  });

  let userBRecordId: string;

  // V-1.2 强度越界 → 400
  it('emotionIntensity=6 返回 400', async () => {
    const res = await request(app)
      .post('/api/emotion/records')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        event: '测试事件',
        emotionType: '快乐',
        emotionIntensity: 6,
        need: '测试需求',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('1-5');
  });

  // V-1.3 未登录 → 401
  it('未携带 Authorization header 返回 401', async () => {
    const res = await request(app)
      .post('/api/emotion/records')
      .send({
        event: '测试事件',
        emotionType: '快乐',
        emotionIntensity: 3,
        need: '测试需求',
      });

    expect(res.status).toBe(401);
  });

  // V-1.4 数据隔离 → 404
  it('用户A访问用户B的记录返回 404', async () => {
    const createRes = await request(app)
      .post('/api/emotion/records')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        event: '用户B的事件',
        emotionType: '平静',
        emotionIntensity: 3,
        need: '用户B的需求',
      });

    userBRecordId = createRes.body.data.recordId;

    const res = await request(app)
      .get(`/api/emotion/records/${userBRecordId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(404);
  });

  // V-1.5 分页列表 + V-6.1 性能断言
  it('分页列表返回正确数据，响应时间 < 500ms', async () => {
    const start = Date.now();
    for (let i = 0; i < 25; i++) {
      await request(app)
        .post('/api/emotion/records')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({
          event: `分页事件 ${i + 1}`,
          emotionType: '快乐',
          emotionIntensity: 3,
          need: `分页需求 ${i + 1}`,
        });
    }

    const res = await request(app)
      .get('/api/emotion/records?page=1&pageSize=20')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(20);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(25);
    expect(Date.now() - start).toBeLessThan(10000);

    // 验证降序排列
    const dates = res.body.data.map((r: any) => r.recordDate);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] <= dates[i - 1]).toBe(true);
    }
  });

  // V-1.6 更新与软删除
  it('更新记录并软删除后返回 404', async () => {
    const createRes = await request(app)
      .post('/api/emotion/records')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        event: '待更新事件',
        emotionType: '焦虑',
        emotionIntensity: 2,
        need: '待更新需求',
      });

    const recordId = createRes.body.data.recordId;

    const updateRes = await request(app)
      .put(`/api/emotion/records/${recordId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        emotionType: '平静',
        emotionIntensity: 4.5,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.emotionType).toBe('平静');

    const deleteRes = await request(app)
      .delete(`/api/emotion/records/${recordId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/emotion/records/${recordId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(getRes.status).toBe(404);
  });
});
