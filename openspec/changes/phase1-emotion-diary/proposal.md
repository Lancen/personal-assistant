## Why

Phase 1 提案规划了情绪日记作为产品核心模块，但实际开发中只交付了基础设施（用户体系+认证+管理后台）和样式调试产物（tasks/notes/calendar），情绪日记——"事件+情绪+需求"三要素结构化记录、情绪健康检测、AI 情绪识别——完全没有落地。这是产品的灵魂功能，需要补全。

## What Changes

- 新增 3 张数据库表：emotion_records（情绪记录）、emotion_questions（检测问题池）、emotion_daily_checks（每日检测结果）
- 新增 1 张数据库表：user_settings（用户 AI 配置和偏好）
- 新增后端情绪日记 CRUD API（/api/emotion/records）
- 新增后端情绪健康检测 API（/api/emotion-check，含出题、提交、评分、阈值提醒）
- 新增后端 AI 服务层（统一抽象，支持智谱 AI + DeepSeek V4 双模型）
- 新增后端 AI 情绪识别 API（/api/ai/recognize）
- 新增后端设置管理 API（/api/settings，含 API Key 加密存储和连接测试）
- 新增前端 5 个情绪页面：记录列表、新建、编辑、检测答题、分析回顾
- 修改前端 Dashboard：接入真实 API，增加情绪状态卡片和检测快捷入口
- 修改前端 Settings：增加 AI 助手配置区域（服务商/模型/API Key/阈值/测试连接）
- 修改前端侧边栏导航：增加情绪日记入口
- 新增共享类型：情绪相关类型定义

## Capabilities

### New Capabilities

- `emotion-records`: 情绪记录三要素（事件+情绪+需求）的 CRUD，双 ID 设计，数据隔离
- `emotion-check`: 每日情绪健康检测（6 维度问题池、出题、答题、评分、阈值提醒）
- `ai-recognition`: AI 情绪识别服务（智谱 AI + DeepSeek V4 双 Provider、Prompt 模板、连接测试）
- `user-settings`: 用户 AI 配置和偏好管理（API Key 加密存储、upsert 语义、前端 AI 配置 UI）

### Modified Capabilities

- `dashboard-emotion`: Dashboard 接入真实 API 替换硬编码数据，增加情绪状态卡片和检测快捷入口；侧边栏导航增加情绪日记菜单项；新增情绪分析回顾页

## Impact

- **数据库**: 4 张新表，需执行 drizzle 迁移和种子数据导入
- **后端**: 新增 4 组路由（emotion, emotion-check, ai, settings），新增 AI 服务层和加密模块，修改 index.ts 注册路由
- **前端**: 新增 5 个页面和 3 个组件，修改 Dashboard 和 Settings 页面，修改所有页面侧边栏导航
- **共享包**: types 新增约 15 个类型定义
- **环境变量**: 新增 ENCRYPTION_KEY（API Key 加密用）
- **外部依赖**: 需要智谱 AI 或 DeepSeek 的 API Key 才能使用 AI 识别功能

## 验收标准 (Acceptance Criteria)

### AC-1: 情绪记录 CRUD

- **GIVEN** 用户已登录，提交有效的三要素数据（事件、情绪类型、强度 1-5、需求）
- **WHEN** 用户调用 POST /api/emotion/records
- **THEN** 返回 201，data 包含自动生成的 recordId (UUID) 和 recordDate (当天)

- **GIVEN** 用户已登录，emotionIntensity 值为 6
- **WHEN** 用户调用 POST /api/emotion/records
- **THEN** 返回 400，错误描述"情绪强度必须在1-5之间"

- **GIVEN** 请求未携带 Authorization header
- **WHEN** 用户调用 POST /api/emotion/records
- **THEN** 返回 401

- **GIVEN** 用户 A 已登录，recordId 属于用户 B
- **WHEN** 用户 A 调用 GET /api/emotion/records/:id
- **THEN** 返回 404

- **GIVEN** 用户有 25 条记录
- **WHEN** 用户调用 GET /api/emotion/records?page=1&pageSize=20
- **THEN** 返回 20 条，pagination.total=25，按 recordDate 降序

### AC-2: 情绪健康检测

- **GIVEN** 今日未完成检测，问题池有 18 道活跃题
- **WHEN** 用户调用 POST /api/emotion-check/generate
- **THEN** 返回 10 题，每维度至少 1 题

- **GIVEN** 今日已生成过题目
- **WHEN** 用户再次调用 POST /api/emotion-check/generate
- **THEN** 返回相同题目（幂等）

- **GIVEN** 10 题答案总和 20，阈值 25
- **WHEN** 用户调用 POST /api/emotion-check/submit
- **THEN** isBelowThreshold=true，suggestion 包含"建议今天不做重大决策"

- **GIVEN** 答案中某题评分为 6
- **WHEN** 用户调用 POST /api/emotion-check/submit
- **THEN** 返回 400，错误描述"评分必须在1-5之间"

### AC-3: AI 情绪识别

- **GIVEN** 用户已配置智谱 AI 的有效 API Key
- **WHEN** 用户调用 POST /api/ai/recognize
- **THEN** 返回 { emotionType, intensity, confidence }

- **GIVEN** 用户已配置 DeepSeek 的有效 API Key，aiProvider="deepseek"
- **WHEN** 用户调用 POST /api/ai/recognize
- **THEN** 使用 DeepSeek API 返回识别结果

- **GIVEN** 用户未配置 API Key
- **WHEN** 用户调用 POST /api/ai/recognize
- **THEN** 返回 403，错误描述"请先在设置中配置 AI API Key"

- **GIVEN** AI 服务超时（>30s）
- **WHEN** 用户调用 POST /api/ai/recognize
- **THEN** 返回 503，错误描述"AI 服务暂时不可用"

- **GIVEN** AI 服务不可用
- **WHEN** 用户在前端点击 AI 识别按钮
- **THEN** 按钮显示"暂不可用"，用户仍可手动选择情绪并保存

### AC-4: 用户设置与 API Key 加密

- **GIVEN** 用户从未配置设置
- **WHEN** 用户调用 GET /api/settings
- **THEN** 返回默认值 { aiProvider: "zhipu", aiModel: "glm-4", hasApiKey: false, emotionThreshold: 25 }

- **GIVEN** 用户提交 apiKey
- **WHEN** 用户调用 PUT /api/settings
- **THEN** 数据库中 apiKey 为 AES-256-GCM 密文；GET 响应 hasApiKey=true，不返回明文

- **GIVEN** ENCRYPTION_KEY 未配置
- **WHEN** 用户尝试保存 API Key
- **THEN** 返回 500，错误描述"加密服务未配置"

- **GIVEN** 用户填写有效 API Key 并点击测试连接
- **WHEN** 前端调用 POST /api/settings/test-ai
- **THEN** 显示"✓ 连接测试成功"绿色提示

### AC-5: Dashboard 与导航

- **GIVEN** 用户有 12 条任务(8 完成)、46 条笔记、2 条情绪记录
- **WHEN** 用户访问 /dashboard
- **THEN** 统计卡片显示真实 API 数据，非硬编码

- **GIVEN** 用户今日未完成检测
- **WHEN** 用户访问 /dashboard
- **THEN** 情绪卡片显示"点击完成今日检测"入口

- **GIVEN** 用户在任意页面
- **WHEN** 用户查看侧边栏
- **THEN** 导航顺序为：仪表盘、情绪日记、任务管理、知识笔记、日历、设置

### AC-6: 性能指标

- **GIVEN** 正常网络条件
- **WHEN** 用户调用任何情绪记录或检测 API
- **THEN** 响应时间 < 500ms

- **GIVEN** AI 服务可用
- **WHEN** 用户调用 POST /api/ai/recognize
- **THEN** 响应时间 < 30s（超时阈值）

- **GIVEN** 情绪记录列表页
- **WHEN** 用户翻页加载
- **THEN** 页面切换 < 1s

### 自动化测试覆盖范围

- **后端 API 测试**: 情绪记录 CRUD（AC-1 全部场景）、情绪检测出题+提交（AC-2 成功场景+幂等性）、AI 识别错误场景（AC-3 403/503/502）、设置 upsert+加密（AC-4 成功场景）
- **前端组件测试**: EmotionRecordForm 表单校验+AI 识别集成、EmotionCheckCard 答题交互、Settings AI 配置联动
- **不覆盖**: AI Provider 实际 LLM 调用（使用 mock）、端到端流程（手动测试）
