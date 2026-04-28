# 设计文档：Phase 1 完善 — 情绪日记核心模块

## 架构设计

在现有分层架构上新增情绪模块和 AI 服务层：

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 Next.js                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  /emotion/*  │  /emotion-   │  /dashboard  │  /settings     │
│  情绪日记5页  │  analysis    │  情绪卡片    │  AI配置区域    │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────────┘
       │              │              │              │
       │ REST API     │ REST API     │ REST API     │ REST API
       ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express 后端                               │
├──────────┬───────────┬──────────┬──────────┬────────────────┤
│ /api/    │ /api/     │ /api/    │ /api/    │ /api/          │
│ emotion  │ emotion-  │ ai/      │ settings │ (现有路由不变)  │
│ /records │ check     │ recognize│          │                │
│          │           │          │          │                │
├──────────┴───────────┴──────────┴──────────┴────────────────┤
│  Services                                                    │
│  emotionService · emotionCheckService · aiService ·          │
│  settingsService                                             │
├──────────────────────────────────────────────────────────────┤
│  DAO                                                         │
│  emotionRecords · emotionQuestions · emotionDailyChecks ·     │
│  userSettings                                                │
├──────────────────────────────────────────────────────────────┤
│  AI Service Layer (统一抽象)                                  │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │ 智谱 AI     │  │ DeepSeek V4 │                            │
│  │ (glm-4)     │  │ (deepseek-  │                            │
│  │             │  │  chat)      │                            │
│  └─────────────┘  └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│              PostgreSQL + Drizzle ORM                         │
│  users · tasks · notes · emotion_records · emotion_questions │
│  emotion_daily_checks · user_settings                        │
└─────────────────────────────────────────────────────────────┘
```

## 数据库设计

### 情绪记录表 `emotion_records`

| 字段 | 类型 | 说明 | 约束 | 索引 |
|------|------|------|------|------|
| id | serial | 自增主键 | PK | PK |
| record_id | text | 外部唯一ID (UUID) | UNIQUE NOT NULL | UNIQUE |
| user_id | text | 用户ID，FK → users.user_id | NOT NULL | INDEX |
| event | text | 事件描述（客观发生了什么）| NOT NULL | - |
| emotion_type | text | 情绪类型（如：焦虑/快乐/悲伤/愤怒）| NOT NULL | - |
| emotion_intensity | numeric(4,2) | 情绪强度 1-5，保留两位小数 | NOT NULL | - |
| need | text | 需求描述（真正想要什么）| NOT NULL | - |
| ai_recognized_emotion | text | AI识别出的情绪 | NULL | - |
| ai_recognized_intensity | numeric(4,2) | AI识别出的强度 | NULL | - |
| record_date | date | 记录日期 | NOT NULL | INDEX |
| created_at | timestamp (UTC) | 创建时间 | DEFAULT now() | - |
| updated_at | timestamp (UTC) | 更新时间 | DEFAULT now() | - |
| deleted_at | timestamp (UTC) | 软删除时间 | NULL = 未删除 | - |

### 情绪检测问题表 `emotion_questions`

| 字段 | 类型 | 说明 | 约束 | 索引 |
|------|------|------|------|------|
| id | serial | 自增主键 | PK | PK |
| dimension | text | 维度名称 | NOT NULL | - |
| question_text | text | 问题文案 | NOT NULL | - |
| is_active | boolean | 是否启用 | DEFAULT true | - |
| created_at | timestamp (UTC) | 创建时间 | DEFAULT now() | - |

六个维度：精力水平、情绪稳定性、愉悦感、压力水平、睡眠质量、自信心

### 每日情绪检测结果表 `emotion_daily_checks`

| 字段 | 类型 | 说明 | 约束 | 索引 |
|------|------|------|------|------|
| id | serial | 自增主键 | PK | PK |
| check_id | text | 外部唯一ID (UUID) | UNIQUE NOT NULL | UNIQUE |
| user_id | text | 用户ID | NOT NULL | INDEX |
| check_date | date | 检测日期 | NOT NULL | INDEX |
| total_score | integer | 总分（满分50）| NOT NULL | - |
| questions_json | jsonb | 问题列表和用户答案 | NOT NULL | - |
| is_below_threshold | boolean | 是否低于阈值 | NOT NULL | - |
| created_at | timestamp (UTC) | 创建时间 | DEFAULT now() | - |
| deleted_at | timestamp (UTC) | 软删除时间 | NULL = 未删除 | - |

### 用户设置表 `user_settings`

| 字段 | 类型 | 说明 | 约束 | 索引 |
|------|------|------|------|------|
| id | serial | 自增主键 | PK | PK |
| user_id | text | 用户ID | UNIQUE NOT NULL | UNIQUE |
| ai_provider | text | AI 服务商 (zhipu / deepseek) | NOT NULL DEFAULT 'zhipu' | - |
| ai_model | text | 模型名称 | NOT NULL DEFAULT 'glm-4' | - |
| ai_api_key | text | API Key（加密存储）| NULL | - |
| emotion_threshold | integer | 情绪检测提醒阈值 | NOT NULL DEFAULT 25 | - |
| notification_enabled | boolean | 每日提醒开关 | DEFAULT true | - |
| created_at | timestamp (UTC) | 创建时间 | DEFAULT now() | - |
| updated_at | timestamp (UTC) | 更新时间 | DEFAULT now() | - |

**设计决策**:
- AI API Key 加密存储（使用 AES-256，密钥从 .env 的 ENCRYPTION_KEY 读取）
- 每个用户一条设置记录，upsert 语义
- 默认使用智谱 AI（国内访问稳定）

## 后端 API 设计

### 情绪日记模块 `/api/emotion/records`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/emotion/records | 获取情绪记录列表（分页，按 record_date 降序）|
| GET | /api/emotion/records/:id | 获取单条记录 |
| POST | /api/emotion/records | 创建记录 |
| PUT | /api/emotion/records/:id | 更新记录 |
| DELETE | /api/emotion/records/:id | 软删除记录 |

**创建记录请求体**：
```typescript
{
  event: string;           // 事件描述
  emotionType: string;     // 情绪类型
  emotionIntensity: number; // 强度 1-5，保留两位小数
  need: string;            // 需求描述
  recordDate?: string;     // 记录日期，默认今天，格式 YYYY-MM-DD
}
```

### AI 情绪识别 `/api/ai/recognize`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/ai/recognize | AI 识别情绪（输入文本，返回情绪类型+强度）|

**请求体**：
```typescript
{
  text: string;  // 用户输入的事件+需求文本
}
```

**响应体**：
```typescript
{
  success: true,
  data: {
    emotionType: string;    // 识别的情绪类型
    intensity: number;      // 识别的强度 1-5
    confidence: number;     // 置信度 0-1
  }
}
```

**错误降级**：AI 服务不可用时返回 503，前端将识别按钮标记为暂不可用，不阻塞记录创建。

### 情绪检测模块 `/api/emotion-check`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/emotion-check/status | 获取今日检测状态（是否已完成）|
| POST | /api/emotion-check/generate | 生成今日检测题目（6维度随机抽10题）|
| POST | /api/emotion-check/submit | 提交检测答案，计算结果 |
| GET | /api/emotion-check/history | 获取历史检测结果（分页）|

**生成题目响应体**：
```typescript
{
  success: true,
  data: {
    checkDate: string;
    questions: Array<{
      id: number;
      dimension: string;
      questionText: string;
    }>;
  }
}
```

**提交请求体**：
```typescript
{
  answers: Array<{
    questionId: number;
    score: number;  // 1-5 分
  }>;
}
```

**提交响应体**：
```typescript
{
  success: true,
  data: {
    checkId: string;
    totalScore: number;        // 满分 50
    isBelowThreshold: boolean; // 是否低于阈值
    dimensionScores: Array<{
      dimension: string;
      score: number;
      maxScore: number;
    }>;
    suggestion?: string;       // 低于阈值时的建议文案
  }
}
```

### 设置管理模块 `/api/settings`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings | 获取当前用户设置 |
| PUT | /api/settings | 更新设置（upsert 语义）|
| POST | /api/settings/test-ai | 测试 AI 连接（验证 API Key 有效性）|

**设置响应体**：
```typescript
{
  success: true,
  data: {
    aiProvider: 'zhipu' | 'deepseek';
    aiModel: string;
    hasApiKey: boolean;       // 不返回 key 明文，只返回是否已设置
    emotionThreshold: number;
    notificationEnabled: boolean;
  }
}
```

**更新请求体**：
```typescript
{
  aiProvider?: 'zhipu' | 'deepseek';
  aiModel?: string;
  apiKey?: string;            // 传入时加密存储，不传时保持原值
  emotionThreshold?: number;
  notificationEnabled?: boolean;
}
```

### AI 模型配置

| 服务商 | 模型 | API 端点 | 备注 |
|--------|------|----------|------|
| 智谱 AI | glm-4 | https://open.bigmodel.cn/api/paas/v4/chat/completions | 默认选项 |
| 智谱 AI | glm-4-flash | 同上 | 轻量快速 |
| DeepSeek | deepseek-chat | https://api.deepseek.com/v1/chat/completions | DeepSeek V4 |
| DeepSeek | deepseek-reasoner | 同上 | 推理增强 |

**AI 服务层抽象**：
```typescript
interface AIProvider {
  recognizeEmotion(text: string): Promise<{
    emotionType: string;
    intensity: number;
    confidence: number;
  }>;
  testConnection(apiKey: string): Promise<boolean>;
}
```

两个 Provider 实现：`ZhipuAIProvider` 和 `DeepSeekAIProvider`，统一接口。

**Prompt 模板**（情绪识别）：
```
你是一个情绪分析助手。根据用户输入的文本，识别其中的情绪。

请从以下情绪列表中选择最匹配的一个：
快乐、满足、平静、期待、感恩、焦虑、悲伤、愤怒、恐惧、厌恶、羞耻、内疚、惊讶、困惑

同时给出情绪强度评分（1-5，1=轻微，5=极强）。

用户文本：
{text}

请以JSON格式返回：
{"emotionType": "情绪名称", "intensity": 数字, "confidence": 0-1之间的数字}
```

## 前端页面结构

### 新增页面

```
src/app/
├── emotion/
│   ├── page.tsx              # 情绪记录列表页
│   ├── new/
│   │   └── page.tsx          # 新建情绪记录（三要素表单 + AI识别按钮）
│   ├── [id]/
│   │   └── page.tsx          # 编辑情绪记录
│   └── check/
│       └── page.tsx          # 情绪健康检测答题页（一题一页）
├── emotion-analysis/
│   └── page.tsx              # 情绪分析回顾页（Phase 1 仅展示历史记录趋势，不做 AI 分析）
```

### 情绪记录表单交互设计

```
┌──────────────────────────────────────────────────────┐
│  新建情绪记录                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📅 2026-04-28                                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 📖 事件                                        │  │
│  │ 客观描述发生了什么                              │  │
│  │ [                                              ]│  │
│  │ [                                              ]│  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 💭 情绪                    [✨ AI 识别]        │  │
│  │                                                │  │
│  │ 类型: [焦虑 ▼]  (下拉选择)                     │  │
│  │                                                │  │
│  │ 强度: ───●──────── 3.50                        │  │
│  │       1              5                          │  │
│  │                                                │  │
│  │  AI建议: 😔 悲伤 (强度 4.2) [采纳]             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🎯 需求                                        │  │
│  │ 你真正想要什么                                  │  │
│  │ [                                              ]│  │
│  │ [                                              ]│  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [取消]                            [保存记录]        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**AI 识别流程**：
1. 用户填写事件+需求后，点击「✨ AI 识别」按钮
2. 前端调用 POST /api/ai/recognize，传入 event + need 文本
3. 返回情绪类型+强度，在表单中显示为「AI 建议」
4. 用户可点击「采纳」自动填充，也可忽略手动选择
5. AI 识别失败时，按钮显示「暂不可用」，不阻塞保存

### 情绪检测答题页交互

```
┌──────────────────────────────────────────────────────┐
│  情绪健康检测                      3/10              │
│                                                      │
│  ═══════●════════════════                            │
│                                                      │
│  🧠 情绪稳定性                                       │
│                                                      │
│  今天你容易被小事激怒吗？                             │
│                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │               │
│  │很少│ │偶尔│ │一般│ │较常│ │经常│               │
│  └────┘ └────┘ └────┘ └────┘ └────┘               │
│                                                      │
│           [上一题]        [下一题 →]                  │
│                                                      │
└──────────────────────────────────────────────────────┘

                    ↓ 答完最后一题

┌──────────────────────────────────────────────────────┐
│  🎯 检测结果                                         │
│                                                      │
│  总分: 32 / 50                                       │
│  ████████████░░░░░░░░                                │
│                                                      │
│  ⚠️ 你的情绪状态偏低，建议今天不做重大决策。          │
│                                                      │
│  维度得分：                                           │
│  精力水平    ████░░  12/15                           │
│  情绪稳定性  ██░░░░   6/15  ⚠️                      │
│  愉悦感      ███░░░   9/15                           │
│  压力水平    ██░░░░   7/15                           │
│  睡眠质量    ████░░  14/15  ✓                        │
│  自信心      ███░░░  10/15                           │
│                                                      │
│  [完成检测]    [记录一条情绪]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Dashboard 情绪卡片

在现有 Dashboard 顶部 stats 区域增加情绪状态卡片：

```
┌─────────────────────────────────────────────┐
│  😊 今日情绪状态                             │
│                                             │
│  ┌───────────┐  ┌───────────────────────┐   │
│  │  📝 记录   │  │  🎯 检测              │   │
│  │  今日已记录 │  │  点击完成今日检测      │   │
│  │  1 条      │  │  [去检测 →]           │   │
│  └───────────┘  └───────────────────────┘   │
│                                             │
│  最近情绪: 😔 悲伤 3.5  😊 快乐 4.0  ...   │
└─────────────────────────────────────────────┘
```

### 设置页 AI 配置区域

在现有设置页增加「AI 助手」分组：

```
┌──────────────────────────────────────────────┐
│  🤖 AI 助手                                   │
│  配置情绪识别的 AI 服务                       │
│                                              │
│  服务商   [智谱 AI ▼]                         │
│  模型     [glm-4 ▼]                          │
│  API Key  [••••••••••••]  [测试连接]          │
│                                              │
│  检测提醒阈值  ───●──── 25/50                │
│  每日提醒      [开启 ●]                       │
│                                              │
│  ✓ 连接测试成功                               │
└──────────────────────────────────────────────┘
```

### 导航结构更新

PC 侧边栏（6 项）：
```
📊 仪表盘      /dashboard
📝 情绪日记    /emotion        ← 新增
✅ 任务管理    /tasks
📖 知识笔记    /notes
📅 日历        /calendar
⚙️ 设置        /settings
```

移动端顶部导航栏 + 汉堡菜单（不改动现有移动端逻辑，侧边栏菜单项同步更新即可）。

## 共享类型定义（packages/types/src/index.ts 新增）

```typescript
// 情绪类型枚举
export type EmotionType =
  | '快乐' | '满足' | '平静' | '期待' | '感恩'
  | '焦虑' | '悲伤' | '愤怒' | '恐惧' | '厌恶'
  | '羞耻' | '内疚' | '惊讶' | '困惑';

// 情绪记录
export interface EmotionRecord {
  id: number;
  recordId: string;
  userId: string;
  event: string;
  emotionType: EmotionType;
  emotionIntensity: number;
  need: string;
  aiRecognizedEmotion: string | null;
  aiRecognizedIntensity: number | null;
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmotionRecordRequest {
  event: string;
  emotionType: string;
  emotionIntensity: number;
  need: string;
  recordDate?: string;
}

export interface UpdateEmotionRecordRequest {
  event?: string;
  emotionType?: string;
  emotionIntensity?: number;
  need?: string;
  recordDate?: string;
}

// 情绪检测问题
export interface EmotionQuestion {
  id: number;
  dimension: string;
  questionText: string;
  isActive: boolean;
}

// 情绪检测
export interface EmotionCheckQuestion {
  id: number;
  dimension: string;
  questionText: string;
}

export interface EmotionCheckAnswer {
  questionId: number;
  score: number;
}

export interface EmotionDailyCheck {
  id: number;
  checkId: string;
  userId: string;
  checkDate: string;
  totalScore: number;
  questionsJson: EmotionCheckAnswer[];
  isBelowThreshold: boolean;
  createdAt: string;
}

export interface EmotionCheckStatus {
  completed: boolean;
  checkDate: string | null;
  totalScore: number | null;
}

export interface EmotionCheckResult {
  checkId: string;
  totalScore: number;
  isBelowThreshold: boolean;
  dimensionScores: Array<{
    dimension: string;
    score: number;
    maxScore: number;
  }>;
  suggestion?: string;
}

// AI 识别
export interface AIRecognizeRequest {
  text: string;
}

export interface AIRecognizeResult {
  emotionType: string;
  intensity: number;
  confidence: number;
}

// 用户设置
export interface UserSettings {
  aiProvider: 'zhipu' | 'deepseek';
  aiModel: string;
  hasApiKey: boolean;
  emotionThreshold: number;
  notificationEnabled: boolean;
}

export interface UpdateUserSettingsRequest {
  aiProvider?: 'zhipu' | 'deepseek';
  aiModel?: string;
  apiKey?: string;
  emotionThreshold?: number;
  notificationEnabled?: boolean;
}

// AI 模型选项
export interface AIModelOption {
  provider: 'zhipu' | 'deepseek';
  model: string;
  label: string;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  { provider: 'zhipu', model: 'glm-4', label: '智谱 GLM-4' },
  { provider: 'zhipu', model: 'glm-4-flash', label: '智谱 GLM-4 Flash' },
  { provider: 'deepseek', model: 'deepseek-chat', label: 'DeepSeek V4' },
  { provider: 'deepseek', model: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
];
```

## AI 服务层设计

### 架构

```
┌──────────────────────────────────────────────────┐
│              AI Service (统一入口)                │
│  recognizeEmotion(text, userId)                  │
│  testConnection(provider, model, apiKey)          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐     ┌─────────────────┐        │
│  │ AIProvider  │     │ AIProvider       │        │
│  │ Factory     │     │ Config           │        │
│  └──────┬──────┘     │ (from user_     │        │
│         │            │  settings)      │        │
│    ┌────┴────┐       └────────┬────────┘        │
│    ▼         ▼                 │                 │
│ ┌──────┐ ┌──────────┐         │                 │
│ │Zhipu │ │DeepSeek  │◄────────┘                 │
│ │AI    │ │AI        │  (用户配置的 provider/model │
│ └──────┘ └──────────┘   + API key)              │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 调用流程

1. 前端调用 `POST /api/ai/recognize`
2. 后端从 `user_settings` 表读取用户的 AI 配置（provider, model, api_key）
3. 解密 API Key
4. 根据 provider 选择对应 AIProvider 实现
5. 调用 LLM API，解析 JSON 响应
6. 返回识别结果

### 错误处理

- API Key 未配置 → 403 "请先在设置中配置 AI API Key"
- API 调用超时（30s）→ 503 "AI 服务暂时不可用"
- API 返回非 JSON → 502 "AI 响应格式异常"
- API Key 无效 → 401 "API Key 无效"

## 加密设计（API Key 存储）

```typescript
// packages/backend/src/crypto/aes.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32字节 hex 字符串

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

## 依赖关系

```
数据库 Schema (3 张新表 + 1 张设置表)
    ↓
共享类型定义 (packages/types)
    ↓
DAO 层 (emotionRecords, emotionQuestions, emotionDailyChecks, userSettings)
    ↓
AI 服务层 (aiService + 加密模块) ← 依赖 userSettings DAO
    ↓
Service 层 (emotionService, emotionCheckService, settingsService)
    ↓
Controller 层 (emotion, emotionCheck, ai, settings)
    ↓
Route 注册 (index.ts)
    ↓
前端页面 + 组件
```

## 文件清单

### 后端新增文件

```
packages/backend/src/
├── routes/
│   ├── emotion.ts              # 情绪记录路由
│   ├── emotionCheck.ts         # 情绪检测路由
│   ├── ai.ts                   # AI 识别路由
│   └── settings.ts             # 设置管理路由
├── controllers/
│   ├── emotionController.ts
│   ├── emotionCheckController.ts
│   ├── aiController.ts
│   └── settingsController.ts
├── services/
│   ├── emotionService.ts
│   ├── emotionCheckService.ts
│   ├── aiService.ts            # AI 统一服务层
│   ├── settingsService.ts
│   └── ai/                    # AI Provider 实现
│       ├── types.ts            # AIProvider 接口
│       ├── zhipuProvider.ts    # 智谱 AI
│       └── deepseekProvider.ts # DeepSeek V4
├── dao/
│   ├── emotionRecords.ts
│   ├── emotionQuestions.ts
│   ├── emotionDailyChecks.ts
│   └── userSettings.ts
├── crypto/
│   └── aes.ts                  # AES-256-GCM 加解密
└── seed/
    └── emotion-questions.sql   # 已存在，需执行
```

### 后端修改文件

```
packages/backend/src/index.ts   # 注册 4 个新路由
packages/drizzle/src/schema.ts  # 新增 4 张表定义
```

### 前端新增文件

```
packages/frontend/src/
├── app/
│   ├── emotion/
│   │   ├── page.tsx            # 情绪记录列表
│   │   ├── new/page.tsx        # 新建情绪记录
│   │   ├── [id]/page.tsx       # 编辑情绪记录
│   │   └── check/page.tsx      # 情绪健康检测
│   └── emotion-analysis/
│       └── page.tsx            # 情绪分析回顾
├── components/
│   └── emotion/
│       ├── EmotionRecordForm.tsx   # 三要素表单 + AI 识别
│       ├── EmotionCheckCard.tsx    # 单题答题卡片
│       └── EmotionCheckResult.tsx  # 检测结果展示
```

### 前端修改文件

```
packages/frontend/src/
├── app/dashboard/page.tsx      # 接入 API + 情绪卡片
├── app/settings/page.tsx       # 增加 AI 配置区域
├── lib/api.ts                  # 增加 emotion/ai/settings 方法
└── (各页面侧边栏 navItems)     # 增加情绪日记导航项
```

### 共享包修改

```
packages/types/src/index.ts     # 新增情绪相关类型定义
```
