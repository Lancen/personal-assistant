# 任务清单：Phase 1 完善 — 情绪日记核心模块

## 1. 数据库与共享类型

- [ ] 1.1 在 `packages/drizzle/src/schema.ts` 新增 emotion_records 表定义（recordId UUID, userId, event, emotionType, emotionIntensity numeric(4,2), need, aiRecognizedEmotion, aiRecognizedIntensity, recordDate, timestamps, softDelete）
- [ ] 1.2 在 `packages/drizzle/src/schema.ts` 新增 emotion_questions 表定义（dimension, questionText, isActive, createdAt）
- [ ] 1.3 在 `packages/drizzle/src/schema.ts` 新增 emotion_daily_checks 表定义（checkId UUID, userId, checkDate, totalScore, questionsJson jsonb, isBelowThreshold, timestamps, softDelete）
- [ ] 1.4 在 `packages/drizzle/src/schema.ts` 新增 user_settings 表定义（userId UNIQUE, aiProvider, aiModel, apiKey, emotionThreshold, notificationEnabled, timestamps）
- [ ] 1.5 执行 drizzle 迁移生成 SQL 并应用到数据库
- [ ] 1.6 导入 emotion-questions.sql 种子数据（18 道题，6 个维度）
  - **验收**: GIVEN 问题表为空, WHEN 执行 seed SQL, THEN emotion_questions 表有 18 条记录，每个维度 3 题
- [ ] 1.7 在 `packages/types/src/index.ts` 新增 EmotionRecord、EmotionQuestion、EmotionDailyCheck、EmotionCheckStatus、EmotionCheckResult、AIRecognizeRequest、AIRecognizeResult、UserSettings、UpdateUserSettingsRequest、AIModelOption、AI_MODEL_OPTIONS 等类型
- [ ] 1.8 编译 types 包 (`pnpm --filter @stock/shared build`)，确保无类型错误

## 2. 后端 — 加密基础设施

- [ ] 2.1 新增 `packages/backend/src/crypto/aes.ts`，实现 encrypt(plaintext) 和 decrypt(ciphertext)，使用 AES-256-GCM，ENCRYPTION_KEY 从环境变量读取
  - **验收**: GIVEN ENCRYPTION_KEY 为有效 32 字节 hex 字符串, WHEN 调用 encrypt("test-key") 再 decrypt(密文), THEN 结果为 "test-key"
- [ ] 2.2 新增 ENCRYPTION_KEY 到 .env.example（记录需要添加的变量，不修改 .env）

## 3. 后端 — DAO 层

- [ ] 3.1 新增 `packages/backend/src/dao/emotionRecords.ts`：create, getById, getByUserId (分页+日期降序), update, softDelete
  - **验收**: GIVEN 用户创建一条记录, WHEN 调用 getByUserId, THEN 返回包含该记录的列表，按 recordDate 降序
- [ ] 3.2 新增 `packages/backend/src/dao/emotionQuestions.ts`：getActiveByDimension, getRandomForCheck (6 维度各至少 1 题，共 10 题)
  - **验收**: GIVEN 问题池有 18 道活跃题覆盖 6 维度, WHEN 调用 getRandomForCheck, THEN 返回 10 题，每个维度至少 1 题
- [ ] 3.3 新增 `packages/backend/src/dao/emotionDailyChecks.ts`：create, getByUserAndDate, getByUserId (分页+日期降序)
  - **验收**: GIVEN 用户今日有检测结果, WHEN 调用 getByUserAndDate(userId, today), THEN 返回该条检测记录
- [ ] 3.4 新增 `packages/backend/src/dao/userSettings.ts`：upsert, getByUserId
  - **验收**: GIVEN 用户无设置记录, WHEN 调用 upsert({ userId, aiProvider: 'deepseek' }), THEN 再调用 getByUserId 返回 aiProvider 为 'deepseek' 的记录

## 4. 后端 — AI 服务层

- [ ] 4.1 新增 `packages/backend/src/services/ai/types.ts`，定义 AIProvider 接口（recognizeEmotion, testConnection）和 AIRecognizeResult 类型
- [ ] 4.2 新增 `packages/backend/src/services/ai/zhipuProvider.ts`，实现 ZhipuAIProvider，调用智谱 API，解析 JSON 响应
  - **验收**: GIVEN 有效 API Key, WHEN 调用 recognizeEmotion("今天很焦虑"), THEN 返回 { emotionType, intensity, confidence }
- [ ] 4.3 新增 `packages/backend/src/services/ai/deepseekProvider.ts`，实现 DeepSeekAIProvider，调用 DeepSeek API，解析 JSON 响应
  - **验收**: GIVEN 有效 API Key, WHEN 调用 recognizeEmotion("今天很开心"), THEN 返回 { emotionType, intensity, confidence }
- [ ] 4.4 新增 `packages/backend/src/services/aiService.ts`，统一服务层：从 user_settings 读取配置，解密 API Key，根据 provider 选择 AIProvider 实现，超时 30s
  - **验收**: GIVEN 用户设置 aiProvider 为 "deepseek", WHEN 调用 aiService.recognizeEmotion(text, userId), THEN 使用 DeepSeekAIProvider 执行识别
  - **验收**: GIVEN 用户未配置 API Key, WHEN 调用 aiService.recognizeEmotion, THEN 抛出 "请先在设置中配置 AI API Key" 错误
  - **验收**: GIVEN AI API 超时超过 30s, WHEN 调用 aiService.recognizeEmotion, THEN 抛出 "AI 服务暂时不可用" 错误

## 5. 后端 — Service 层

- [ ] 5.1 新增 `packages/backend/src/services/emotionService.ts`：createRecord, getRecord, listRecords (分页), updateRecord, deleteRecord，数据隔离校验
  - **验收**: GIVEN 用户 A 创建的记录, WHEN 用户 B 尝试 getRecord, THEN 返回 null（记录不存在）
- [ ] 5.2 新增 `packages/backend/src/services/emotionCheckService.ts`：getCheckStatus, generateQuestions (幂等), submitAnswers (评分+阈值+维度得分), getHistory
  - **验收**: GIVEN 用户今日已生成题目, WHEN 再次调用 generateQuestions, THEN 返回相同题目
  - **验收**: GIVEN 10 道题答案总和 20 且阈值 25, WHEN 调用 submitAnswers, THEN isBelowThreshold 为 true，suggestion 不为空
  - **验收**: GIVEN 用户今日已完成检测, WHEN 再次调用 submitAnswers, THEN 返回已有结果，不重复创建
- [ ] 5.3 新增 `packages/backend/src/services/settingsService.ts`：getSettings (含默认值), updateSettings (upsert+API Key 加密), testAIConnection
  - **验收**: GIVEN 用户无设置记录, WHEN 调用 getSettings, THEN 返回默认值 { aiProvider: "zhipu", aiModel: "glm-4", hasApiKey: false, ... }
  - **验收**: GIVEN 用户提交 apiKey, WHEN 调用 updateSettings, THEN 数据库中 apiKey 为密文，GET 响应 hasApiKey 为 true

## 6. 后端 — Controller + Route

- [ ] 6.1 新增 `packages/backend/src/controllers/emotionController.ts`，实现 5 个 handler：getAll, getById, create, update, delete
- [ ] 6.2 新增 `packages/backend/src/controllers/emotionCheckController.ts`，实现 4 个 handler：getStatus, generate, submit, getHistory
- [ ] 6.3 新增 `packages/backend/src/controllers/aiController.ts`，实现 1 个 handler：recognize
- [ ] 6.4 新增 `packages/backend/src/controllers/settingsController.ts`，实现 3 个 handler：get, update, testAI
- [ ] 6.5 新增 `packages/backend/src/routes/emotion.ts`，注册 5 条路由，全部使用 authMiddleware
- [ ] 6.6 新增 `packages/backend/src/routes/emotionCheck.ts`，注册 4 条路由，全部使用 authMiddleware
- [ ] 6.7 新增 `packages/backend/src/routes/ai.ts`，注册 1 条路由，使用 authMiddleware
- [ ] 6.8 新增 `packages/backend/src/routes/settings.ts`，注册 3 条路由，使用 authMiddleware
- [ ] 6.9 修改 `packages/backend/src/index.ts`，注册 4 个新路由：/api/emotion、/api/emotion-check、/api/ai、/api/settings
  - **验收**: GIVEN 后端启动, WHEN 请求 GET /api/health, THEN 响应 status: ok

## 7. 前端 — API 客户端

- [ ] 7.1 在 `packages/frontend/src/lib/api.ts` 新增 api.emotion.records.list/get/create/update/delete 方法
- [ ] 7.2 在 `packages/frontend/src/lib/api.ts` 新增 api.emotionCheck.status/generate/submit/history 方法
- [ ] 7.3 在 `packages/frontend/src/lib/api.ts` 新增 api.ai.recognize 方法
- [ ] 7.4 在 `packages/frontend/src/lib/api.ts` 新增 api.settings.get/update/testAI 方法

## 8. 前端 — 情绪日记页面

- [ ] 8.1 新增 `/emotion/page.tsx` — 情绪记录列表页，调用 GET /api/emotion/records 展示分页列表，空状态展示"还没有情绪记录"+ 去记录按钮
  - **验收**: GIVEN 用户有 15 条记录, WHEN 访问 /emotion, THEN 列表按日期降序展示，底部有分页控件
- [ ] 8.2 新增 `components/emotion/EmotionRecordForm.tsx` — 三要素表单组件：事件文本域、情绪类型下拉（14 种）、强度滑块（1-5，步长 0.01）、需求文本域、AI 识别按钮
  - **验收**: GIVEN 用户填写事件和需求并点击 AI 识别, WHEN AI 返回成功, THEN 显示"AI 建议: 😔 悲伤 (强度 4.2)"和采纳按钮
  - **验收**: GIVEN AI 服务不可用, WHEN 用户点击 AI 识别, THEN 按钮显示"暂不可用"，用户仍可手动选择并保存
- [ ] 8.3 新增 `/emotion/new/page.tsx` — 新建情绪记录页，使用 EmotionRecordForm
  - **验收**: GIVEN 用户填写完整三要素, WHEN 点击保存, THEN 创建成功并跳转到 /emotion
- [ ] 8.4 新增 `/emotion/[id]/page.tsx` — 编辑情绪记录页，加载数据填充 EmotionRecordForm
  - **验收**: GIVEN 用户访问已有记录的编辑页, WHEN 页面加载, THEN 表单自动填充该记录数据
- [ ] 8.5 新增 `components/emotion/EmotionCheckCard.tsx` — 单题答题卡片：维度标签、问题文案、1-5 分选项按钮
- [ ] 8.6 新增 `components/emotion/EmotionCheckResult.tsx` — 检测结果展示：总分、维度得分条形图、阈值判断、建议文案、记录情绪按钮
- [ ] 8.7 新增 `/emotion/check/page.tsx` — 情绪健康检测答题页：一题一页交互 + 进度指示器 + 结果页
  - **验收**: GIVEN 用户有 10 道题, WHEN 逐题答题到第 10 题, THEN 提交后显示结果页，包含总分和维度得分
  - **验收**: GIVEN 用户今日已完成检测, WHEN 访问 /emotion/check, THEN 直接展示检测结果
  - **验收**: GIVEN 检测总分低于阈值, WHEN 结果页展示, THEN 显示"建议今天不做重大决策"和"记录一条情绪"按钮
- [ ] 8.8 新增 `/emotion-analysis/page.tsx` — 情绪分析回顾页：历史记录时间线 + 情绪类型分布 + 强度趋势图（Phase 1 简单可视化，不做 AI 分析）
  - **验收**: GIVEN 用户有近 30 天记录, WHEN 访问 /emotion-analysis, THEN 展示时间线和趋势图表
  - **验收**: GIVEN 用户无记录, WHEN 访问 /emotion-analysis, THEN 显示空状态引导

## 9. 前端 — 现有页面改造

- [ ] 9.1 修改 Dashboard `page.tsx`：替换硬编码统计为 API 调用、增加情绪状态卡片（今日记录数+检测状态+快捷入口）
  - **验收**: GIVEN 用户有 12 条任务(8 完成)、46 条笔记、2 条情绪记录, WHEN 访问 Dashboard, THEN 统计卡片显示真实数据
  - **验收**: GIVEN 用户今日未完成检测, WHEN Dashboard 加载, THEN 情绪卡片显示"点击完成今日检测"入口
- [ ] 9.2 修改 Settings `page.tsx`：增加「AI 助手」配置分组，包含服务商/模型联动选择、API Key 输入、测试连接按钮、阈值滑块、提醒开关
  - **验收**: GIVEN 用户切换服务商为 DeepSeek, WHEN 查看模型下拉框, THEN 选项为 deepseek-chat 和 deepseek-reasoner
  - **验收**: GIVEN 用户填写 API Key 并点击测试连接, WHEN 测试成功, THEN 显示"✓ 连接测试成功"绿色提示
- [ ] 9.3 更新所有页面侧边栏 navItems：在仪表盘和任务之间插入 { id: 'emotion', label: '情绪日记', icon: Heart, href: '/emotion' }
  - **验收**: GIVEN 用户在任意页面, WHEN 查看侧边栏, THEN 导航项顺序为：仪表盘、情绪日记、任务管理、知识笔记、日历、设置

## 10. 质量保障

- [ ] 10.1 运行 `pnpm typecheck`，确保全项目无类型错误
- [ ] 10.2 运行 `pnpm lint`，确保全项目无 lint 错误
- [ ] 10.3 端到端手动测试核心流程：
  - 登录 → Dashboard 看到情绪卡片 → 点击去检测 → 完成答题 → 查看结果 → 去记录情绪 → 填写三要素 → 点击 AI 识别 → 采纳建议 → 保存 → 回到列表看到新记录
- [ ] 10.4 端到端手动测试设置流程：
  - 进入设置 → 配置 AI 服务商和 API Key → 测试连接 → 保存 → 新建情绪记录点击 AI 识别 → 成功返回建议
