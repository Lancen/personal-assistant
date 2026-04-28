## Context

当前代码库已有用户体系（JWT 认证 + 管理员权限）、任务模块（四象限 CRUD）、笔记模块（标签+搜索），但缺少产品核心——情绪日记。本次变更补全 Phase 1 规划的全部情绪功能，包括三要素记录、每日检测、AI 情绪识别（双模型），以及用户 AI 配置管理。

现有技术约束：
- 后端 Express.js，路由注册在 `index.ts`
- 数据库 PostgreSQL + Drizzle ORM，schema 在 `packages/drizzle/src/schema.ts`
- 认证中间件 `authMiddleware` + `adminMiddleware` 已可用
- 前端 AuthContext 管理登录态，API 客户端在 `packages/frontend/src/lib/api.ts`
- 前端各页面内嵌独立侧边栏（navItems 硬编码），需逐一更新
- 唯一的情绪相关文件：`packages/backend/src/seed/emotion-questions.sql`（18 道种子题，但表尚未创建）

## Goals / Non-Goals

**Goals:**

- 情绪记录完整 CRUD 闭环（创建/列表/详情/编辑/删除）
- 每日情绪检测闭环（状态查询/出题/答题/评分/阈值提醒）
- AI 情绪识别可用（智谱 AI + DeepSeek V4 双模型，用户可切换）
- 用户可自行配置 AI 服务商、模型、API Key
- API Key 加密存储，响应中不暴露明文
- Dashboard 展示真实情绪数据和检测入口
- 侧边栏导航包含情绪日记入口

**Non-Goals:**

- 任务关联情绪记录（Phase 3）
- 多周期 AI 分析 + 决策辅助（Phase 4）
- 客户端加密（后续迭代）
- 移动端底部导航 BottomNav（可单独迭代）
- 对话模块改动（保持不动）
- 日历模块展示情绪数据（后续迭代）

## Decisions

### 决策 1: AI 服务层统一抽象

**选择**: AIProvider 接口 + ZhipuAIProvider / DeepSeekAIProvider 两个实现

**替代方案**:
- A) 直接在 aiService 中 if/else 切换 — 简单但扩展性差，加新模型需改 aiService
- B) 策略模式 + 工厂 — 过度设计，当前只有 2 个 Provider

**理由**: 接口抽象兼顾扩展性和简洁性，加新 Provider 只需新增一个实现类，不改现有代码。

```
┌─────────────────────────────────────────┐
│         aiService (统一入口)             │
│  recognizeEmotion(text, userId)          │
│  testConnection(provider, model, key)    │
├─────────────────────────────────────────┤
│          AIProviderFactory               │
│  create(provider, model, apiKey)         │
├──────────────┬──────────────────────────┤
│ ZhipuAI      │ DeepSeekAI              │
│ Provider     │ Provider                │
│ (glm-4,      │ (deepseek-chat,         │
│  glm-4-flash)│  deepseek-reasoner)     │
└──────────────┴──────────────────────────┘
```

### 决策 2: API Key 使用 AES-256-GCM 加密存储

**选择**: AES-256-GCM 对称加密，密钥从 `ENCRYPTION_KEY` 环境变量读取

**替代方案**:
- A) 明文存储 — 安全风险太大
- B) 非对称加密 — 密钥管理复杂，API Key 只需服务端解密，无需非对称
- C) 使用 KMS — 过度工程化，个人项目无此需求

**理由**: AES-256-GCM 提供认证加密（防篡改+加密），Node.js crypto 原生支持，密文格式 `iv:authTag:ciphertext` 便于存储和解析。

### 决策 3: 情绪检测出题幂等性 — 当日缓存方案

**选择**: 首次 generate 时将题目 ID 列表存入 `emotion_daily_checks` 表（questions_json 字段），再次 generate 时查询已有记录

**替代方案**:
- A) Redis 缓存 — 额外依赖，日级别数据量小不值得
- B) 前端缓存 — 不可靠，换设备后题目会变

**理由**: 利用已有的 emotion_daily_checks 表，questions_json 字段在 generate 阶段即可写入题目列表，submit 时更新答案和分数，无需额外存储。

### 决策 4: AI 识别为可选辅助，失败不阻塞

**选择**: 前端 AI 识别按钮独立于表单提交，AI 失败时按钮标灰，用户可手动选择情绪

**替代方案**:
- A) 自动识别（保存时触发）— 强依赖 AI 可用性，影响用户体验
- B) 降级使用规则引擎 — 额外开发成本，关键词匹配准确率低

**理由**: 用户主动触发 = 可控成本 + 可预期行为，符合 PRD 设计决策 #8。

### 决策 5: 侧边栏导航逐一更新

**选择**: 在每个页面组件的 navItems 数组中插入情绪日记项

**替代方案**:
- A) 提取共享侧边栏组件 — 理想方案但改动范围大，涉及所有现有页面重构
- B) 使用 Next.js layout 嵌套 — 需要改造现有页面结构

**理由**: 当前各页面已有独立内嵌侧边栏，提取共享组件是正确方向但属于独立重构任务。Phase 1 先保持现有模式插入新导航项，减少风险。

## Risks / Trade-offs

| 风险/权衡 | 缓解措施 |
|-----------|---------|
| LLM API 不可用或超时 → AI 识别失败 | AI 为可选功能，前端降级显示"暂不可用"；后端 30s 超时返回 503 |
| 双模型切换增加测试复杂度 | 统一 AIProvider 接口，mock 测试覆盖接口契约而非具体 API |
| API Key 加密依赖 ENCRYPTION_KEY 环境变量 | 启动时检查，未配置时相关功能返回明确错误 |
| 种子数据需手动执行 | 提供 SQL 文件 + 文档说明 |
| 侧边栏 navItems 分散在各页面 | 记录为技术债务，后续迭代提取共享组件 |
| 情绪检测 generate 阶段写入 daily_checks 表 | submit 时 update 同一条记录而非 insert，避免重复 |

## 数据库变更

新增 4 张表：

```
emotion_records
  id           serial PK
  record_id    text UNIQUE NOT NULL    -- UUID，对外暴露
  user_id      text NOT NULL INDEX     -- FK → users.user_id
  event        text NOT NULL
  emotion_type text NOT NULL
  emotion_intensity numeric(4,2) NOT NULL  -- 1.00-5.00
  need         text NOT NULL
  ai_recognized_emotion     text
  ai_recognized_intensity   numeric(4,2)
  record_date  date NOT NULL INDEX
  created_at   timestamp defaultNow()
  updated_at   timestamp defaultNow()
  deleted_at   timestamp               -- 软删除

emotion_questions
  id            serial PK
  dimension     text NOT NULL          -- 6 维度
  question_text text NOT NULL
  is_active     boolean default true
  created_at    timestamp defaultNow()

emotion_daily_checks
  id                serial PK
  check_id          text UNIQUE NOT NULL  -- UUID
  user_id           text NOT NULL INDEX
  check_date        date NOT NULL INDEX
  total_score       integer NOT NULL      -- 满分 50
  questions_json    jsonb NOT NULL        -- 题目+答案
  is_below_threshold boolean NOT NULL
  created_at        timestamp defaultNow()
  deleted_at        timestamp

user_settings
  id                 serial PK
  user_id            text UNIQUE NOT NULL
  ai_provider        text NOT NULL DEFAULT 'zhipu'
  ai_model           text NOT NULL DEFAULT 'glm-4'
  ai_api_key         text               -- AES-256-GCM 密文
  emotion_threshold  integer NOT NULL DEFAULT 25
  notification_enabled boolean default true
  created_at         timestamp defaultNow()
  updated_at         timestamp defaultNow()
```

## API 路由时序

情绪记录创建 + AI 识别的典型时序：

```
用户     前端              后端              AI 服务
 │        │                 │                  │
 │ 填写   │                 │                  │
 │ 三要素 │                 │                  │
 │        │                 │                  │
 │ 点击AI │──POST /ai/recognize──▶│             │
 │ 识别   │  {text}          │  读取user_settings│
 │        │                  │  解密apiKey      │
 │        │                  │──调用LLM API────▶│
 │        │                  │◀──返回情绪结果───│
 │        │◀─{emotionType,  │                  │
 │        │   intensity}     │                  │
 │ 采纳   │                 │                  │
 │ 建议   │                 │                  │
 │        │                 │                  │
 │ 点击   │──POST /emotion/records──▶│          │
 │ 保存   │  {event,type,   │  校验+存储       │
 │        │   intensity,need}│                  │
 │        │◀─201 {record}   │                  │
 │ 跳转   │                 │                  │
 │ /emotion│                │                  │
```

情绪检测答题时序：

```
用户     前端              后端
 │        │                 │
 │ 访问   │──GET /emotion-check/status──▶│
 │ 检测页 │◀─{completed:false}           │
 │        │                 │
 │ 生成   │──POST /emotion-check/generate─▶│
 │ 题目   │  随机抽取10题    │
 │        │◀─{questions[]}   │
 │        │                 │
 │ 逐题   │  (本地状态管理)   │
 │ 答题   │                 │
 │        │                 │
 │ 提交   │──POST /emotion-check/submit──▶│
 │        │  {answers[]}     │  计算总分
 │        │                  │  维度得分
 │        │◀─{totalScore,   │  阈值判断
 │        │   dimensionScores│
 │        │   isBelowThreshold│
 │        │   suggestion?}   │
 │ 查看   │                 │
 │ 结果   │                 │
```

## 文件清单

### 后端新增

```
packages/backend/src/
├── routes/emotion.ts, emotionCheck.ts, ai.ts, settings.ts
├── controllers/emotionController.ts, emotionCheckController.ts, aiController.ts, settingsController.ts
├── services/emotionService.ts, emotionCheckService.ts, aiService.ts, settingsService.ts
├── services/ai/types.ts, zhipuProvider.ts, deepseekProvider.ts
├── dao/emotionRecords.ts, emotionQuestions.ts, emotionDailyChecks.ts, userSettings.ts
└── crypto/aes.ts
```

### 后端修改

```
packages/backend/src/index.ts  — 注册 4 个新路由
packages/drizzle/src/schema.ts — 新增 4 张表
```

### 前端新增

```
packages/frontend/src/
├── app/emotion/page.tsx, new/page.tsx, [id]/page.tsx, check/page.tsx
├── app/emotion-analysis/page.tsx
├── components/emotion/EmotionRecordForm.tsx, EmotionCheckCard.tsx, EmotionCheckResult.tsx
```

### 前端修改

```
packages/frontend/src/
├── app/dashboard/page.tsx     — 接入 API + 情绪卡片
├── app/settings/page.tsx      — 增加 AI 配置区域
├── lib/api.ts                 — 增加新 API 方法
└── (各页面 navItems)          — 插入情绪日记导航项
```

### 共享包修改

```
packages/types/src/index.ts    — 新增情绪相关类型
```

## Open Questions

1. **ENCRYPTION_KEY 配置方式** — 建议添加到 .env.example 并在 README 中说明，是否需要在应用启动时校验？
2. **AI 模型费用控制** — 是否需要单用户每日 AI 调用次数限制？当前设计无限制。
