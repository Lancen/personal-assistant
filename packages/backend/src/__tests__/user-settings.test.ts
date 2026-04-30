import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, createTestUser, cleanupTestUser } from '../testHelpers';
import { db } from '../config/db';
import * as schema from '@personal-assistant/drizzle/src/schema';
import { eq } from 'drizzle-orm';

const app = createTestApp();

describe('AC-4: 用户设置与 API Key 加密', () => {
  let testUser: { user: any; token: string };

  beforeAll(async () => {
    testUser = await createTestUser({ name: 'Settings User' });
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.user.userId);
  });

  // V-4.1 默认值
  it('新用户获取默认设置', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${testUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.aiProvider).toBe('zhipu');
    expect(res.body.data.aiModel).toBe('glm-4');
    expect(res.body.data.hasApiKey).toBe(false);
    expect(res.body.data.emotionThreshold).toBe(25);
  });

  // V-4.2 API Key 加密存储 + 不返回明文
  it('API Key 加密存储，GET不返回明文', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        aiProvider: 'zhipu',
        aiModel: 'glm-4',
        apiKey: 'sk-test-secret-key-12345',
        emotionThreshold: 30,
      });

    expect(res.status).toBe(200);

    // 验证 GET 不返回明文
    const getRes = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${testUser.token}`);

    expect(getRes.body.data.hasApiKey).toBe(true);
    expect(getRes.body.data.apiKey).toBeUndefined();

    // 验证数据库中存储的是密文
    const [row] = await db
      .select()
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, testUser.user.userId));

    expect(row.aiApiKey).not.toBe('sk-test-secret-key-12345');
    expect(row.aiApiKey).toContain(':'); // AES-256-GCM 格式: iv:authTag:ciphertext
  });

  // V-4.3 ENCRYPTION_KEY 缺失 → 500 (V-6.2 性能：验证超时逻辑在 aiService 层)
  it('ENCRYPTION_KEY未配置时保存API Key返回 500', async () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;

    const noEncUser = await createTestUser({ name: 'No Encryption User' });

    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${noEncUser.token}`)
      .send({ apiKey: 'sk-another-key' });

    expect(res.status).toBe(500);

    // 恢复环境变量
    if (originalKey) process.env.ENCRYPTION_KEY = originalKey;
    await cleanupTestUser(noEncUser.user.userId);
  });

  // V-4.4 测试连接
  it('测试AI连接返回成功', async () => {
    const res = await request(app)
      .post('/api/settings/test-ai')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        aiProvider: 'zhipu',
        aiModel: 'glm-4',
        apiKey: 'sk-test-valid-key',
      });

    expect(res.status).toBe(200);
  });
});
