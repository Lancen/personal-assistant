## 1. 数据库与共享类型

- [ ] 1.1 在 `packages/drizzle/src/schema.ts` 新增 emotion_records 表（recordId UUID, userId, event, emotionType, emotionIntensity numeric(4,2), need, aiRecognizedEmotion, aiRecognizedIntensity, recordDate, timestamps, softDelete）
- [ ] 1.2 在 `packages/drizzle/src/schema.ts` 新增 emotion_questions 表（dimension, questionText, isActive, createdAt）
- [ ] 1.3 在 `packages/drizzle/src/schema.ts` 新增 emotion_daily_checks 表（checkId UUID, userId, checkDate, totalScore, questionsJson jsonb, isBelowThreshold, timestamps, softDelete）
- [ ] 1.4 在 `packages/drizzle/src/schema.ts` 新增 user_settings 表（userId UNIQUE, aiProvider, aiModel, apiKey, emotionThreshold, notificationEnabled, timestamps）
- [ ] 1.5 执行 drizzle 迁移生成 SQL 并应用到数据库
- [ ] 1.6 导入 emotion-questions.sql 种子数据（18 题 6 维度）
- [ ] 1.7 在 `packages/types/src/index.ts` 新增所有情绪相关类型（EmotionRecord, EmotionQuestion, EmotionDailyCheck, EmotionCheckStatus, EmotionCheckResult, AIRecognizeRequest, AIRecognizeResult, UserSettings, UpdateUserSettingsRequest, AIModelOption, AI_MODEL_OPTIONS）
- [ ] 1.8 编译 types 包确保无类型错误

## 2. 后端加密切件

- [ ] 2.1 新增 `packages/backend/src/crypto/aes.ts`，实现 encrypt/decrypt（AES-256-GCM，ENCRYPTION_KEY 从环境变量读取）
- [ ] 2.2 编写加密切件单元测试：加密后解密还原明文

## 3. 后端 DAO 层

- [ ] 3.1 新增 `packages/backend/src/dao/emotionRecords.ts`（create, getById, getByUserId 分页+日期降序, update, softDelete）
- [ ] 3.2 新增 `packages/backend/src/dao/emotionQuestions.ts`（getActiveByDimension, getRandomForCheck 6维度各至少1题共10题）
- [ ] 3.3 新增 `packages/backend/src/dao/emotionDailyChecks.ts`（create, getByUserAndDate, update, getByUserId 分页）
- [ ] 3.4 新增 `packages/backend/src/dao/userSettings.ts`（upsert, getByUserId）

## 4. 后端 AI 服务层

- [ ] 4.1 新增 `packages/backend/src/services/ai/types.ts`，定义 AIProvider 接口（recognizeEmotion, testConnection）
- [ ] 4.2 新增 `packages/backend/src/services/ai/zhipuProvider.ts`，调用智谱 API，解析 JSON 响应
- [ ] 4.3 新增 `packages/backend/src/services/ai/deepseekProvider.ts`，调用 DeepSeek API，解析 JSON 响应
- [ ] 4.4 新增 `packages/backend/src/services/aiService.ts`（从 user_settings 读取配置，解密 API Key，根据 provider 选择 Provider，30s 超时）

## 5. 后端 Service 层

- [ ] 5.1 新增 `packages/backend/src/services/emotionService.ts`（createRecord, getRecord, listRecords, updateRecord, deleteRecord，数据隔离校验）
- [ ] 5.2 新增 `packages/backend/src/services/emotionCheckService.ts`（getCheckStatus, generateQuestions 幂等, submitAnswers 评分+阈值+维度得分, getHistory）
- [ ] 5.3 新增 `packages/backend/src/services/settingsService.ts`（getSettings 含默认值, updateSettings upsert+加密, testAIConnection）

## 6. 后端 Controller + Route

- [ ] 6.1 新增 `packages/backend/src/controllers/emotionController.ts`（getAll, getById, create, update, delete）
- [ ] 6.2 新增 `packages/backend/src/controllers/emotionCheckController.ts`（getStatus, generate, submit, getHistory）
- [ ] 6.3 新增 `packages/backend/src/controllers/aiController.ts`（recognize）
- [ ] 6.4 新增 `packages/backend/src/controllers/settingsController.ts`（get, update, testAI）
- [ ] 6.5 新增 `packages/backend/src/routes/emotion.ts`，注册 5 条路由，全部 authMiddleware
- [ ] 6.6 新增 `packages/backend/src/routes/emotionCheck.ts`，注册 4 条路由，全部 authMiddleware
- [ ] 6.7 新增 `packages/backend/src/routes/ai.ts`，注册 1 条路由，authMiddleware
- [ ] 6.8 新增 `packages/backend/src/routes/settings.ts`，注册 3 条路由，authMiddleware
- [ ] 6.9 修改 `packages/backend/src/index.ts`，注册 4 个新路由（/api/emotion, /api/emotion-check, /api/ai, /api/settings）

## 7. 后端 API 测试

- [ ] 7.1 测试情绪记录 CRUD：创建成功返回 recordId、强度校验 400、必填字段校验 400、未登录 401、数据隔离 404、列表分页降序、更新、软删除（覆盖 AC-1）
- [ ] 7.2 测试情绪检测：首次出题 10 题每维度 1 题、重复出题幂等、提交评分+阈值判断、评分范围校验 400、答案数量校验 400、重复提交返回已有结果（覆盖 AC-2）
- [ ] 7.3 测试 AI 识别：双模型调用、API Key 未配置 403、超时 503、格式异常 502、Key 无效 401（覆盖 AC-3 成功+错误场景）
- [ ] 7.4 测试用户设置：默认值、upsert 更新、API Key 加密存储、hasApiKey 不返回明文、ENCRYPTION_KEY 缺失 500（覆盖 AC-4）

## 8. 前端 API 客户端

- [ ] 8.1 在 `packages/frontend/src/lib/api.ts` 新增 api.emotion.records.list/get/create/update/delete
- [ ] 8.2 在 `packages/frontend/src/lib/api.ts` 新增 api.emotionCheck.status/generate/submit/history
- [ ] 8.3 在 `packages/frontend/src/lib/api.ts` 新增 api.ai.recognize
- [ ] 8.4 在 `packages/frontend/src/lib/api.ts` 新增 api.settings.get/update/testAI

## 9. 前端情绪日记页面

- [ ] 9.1 新增 `/emotion/page.tsx` — 情绪记录列表页，分页+日期降序，空状态引导
- [ ] 9.2 新增 `components/emotion/EmotionRecordForm.tsx` — 三要素表单：事件文本域、情绪类型下拉(14种)、强度滑块(1-5步长0.01)、需求文本域、AI 识别按钮+采纳
- [ ] 9.3 新增 `/emotion/new/page.tsx` — 新建情绪记录页，使用 EmotionRecordForm
- [ ] 9.4 新增 `/emotion/[id]/page.tsx` — 编辑情绪记录页，加载数据填充表单
- [ ] 9.5 新增 `components/emotion/EmotionCheckCard.tsx` — 单题答题卡片（维度标签+问题+1-5分选项）
- [ ] 9.6 新增 `components/emotion/EmotionCheckResult.tsx` — 检测结果展示（总分+维度条形图+阈值建议+记录情绪按钮）
- [ ] 9.7 新增 `/emotion/check/page.tsx` — 情绪检测答题页（一题一页+进度指示器+结果页）
- [ ] 9.8 新增 `/emotion-analysis/page.tsx` — 情绪分析回顾页（时间线+趋势图，空状态引导）

## 10. 前端现有页面改造

- [ ] 10.1 修改 Dashboard `page.tsx`：替换硬编码统计为 API 调用，增加情绪状态卡片（记录数+检测状态+快捷入口）
- [ ] 10.2 修改 Settings `page.tsx`：增加 AI 助手配置分组（服务商/模型联动、API Key 输入、测试连接、阈值滑块、提醒开关）
- [ ] 10.3 更新所有页面侧边栏 navItems，在仪表盘和任务之间插入情绪日记导航项

## 11. 前端组件测试

- [ ] 11.1 EmotionRecordForm 表单校验测试：必填字段、强度范围、AI 识别成功显示建议+采纳、AI 不可用降级（覆盖 AC-3 前端场景）
- [ ] 11.2 EmotionCheckCard 答题交互测试：选择分数、翻页、提交结果展示（覆盖 AC-2 前端场景）
- [ ] 11.3 Settings AI 配置联动测试：服务商切换模型列表、保存成功、测试连接成功/失败提示（覆盖 AC-4 前端场景）

## 12. 质量保障

- [ ] 12.1 运行 `pnpm typecheck` 确保全项目无类型错误
- [ ] 12.2 运行 `pnpm lint` 确保全项目无 lint 错误
- [ ] 12.3 端到端手动测试：登录→Dashboard 情绪卡片→去检测→答题→结果→去记录→三要素表单→AI 识别→采纳→保存→列表查看
- [ ] 12.4 端到端手动测试：设置→配置 AI 服务商+API Key→测试连接→保存→新建记录点 AI 识别→成功返回
