# 设计文档：Phase 1 基础设施 + 用户体系 + 情绪日记

## 架构设计

整体遵循技术架构文档的分层设计：

```
┌─────────────────────────────────────────┐
│               前端Next.js                 │
├─────────────────────────────────────────┤
│  响应式布局：                            │
│  - PC: 侧边栏导航                        │
│  - 移动端: 底部图标导航                  │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│            Express 后端                   │
├─────────────────────────────────────────┤
│  认证中间件 → 路由 → 控制器 → 服务 → DAO │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          PostgreSQL + Drizzle ORM         │
└─────────────────────────────────────────┘
```

## 响应式导航设计

### 断点设计

| 断点 | 导航方式 |
|------|----------|
| `>= 768px` (PC/平板横屏) | 左侧固定侧边栏 |
| `< 768px` (手机) | 底部图标导航栏 |

### 导航菜单项

```
1. 📊 仪表盘  → /dashboard
2. 📝 情绪日记 → /emotion
3. ✅ 任务列表 → /tasks  (Phase 3，本阶段留空占位)
4. 💡 知识沉淀 → /knowledge  (Phase 5，本阶段留空占位)
5. 💬 对话 → /conversation  (已有)
```

### 侧边栏（PC）

- 固定宽度 220px
- 显示文字标签 + 图标
- 当前选中项高亮（背景色+边框）
- 底部显示用户信息和退出按钮

### 底部导航（移动端）

- 高度 60px
- 每个项显示图标 + 文字标签
- 选中项图标颜色高亮
- 五个菜单项均匀分布

## 数据库设计

### 用户表 `users`

| 字段 | 类型 | 说明 | 约束 | 索引 |
|------|------|------|------|------|
| id | serial | 自增主键 | PK | PK |
| user_id | text | 外部唯一ID，对外暴露 | UNIQUE NOT NULL | UNIQUE |
| email | text | 用户邮箱 | UNIQUE NOT NULL | UNIQUE |
| password_hash | text | 密码bcrypt哈希 | NOT NULL | - |
| name | text | 用户昵称 | NOT NULL | - |
| is_admin | boolean | 是否管理员 | DEFAULT false | - |
| is_active | boolean | 是否启用 | DEFAULT true | - |
| created_at | timestamp (UTC) | 创建时间 | DEFAULT now() | - |
| updated_at | timestamp (UTC) | 更新时间 | DEFAULT now() | - |
| deleted_at | timestamp (UTC) | 软删除时间 | NULL = 未删除 | - |

**设计决策**:
- 双ID设计：内部自增id + 对外字符串user_id，防止ID被遍历
- 软删除：保留deleted_at字段，不真正删除数据

### 情绪记录表 `emotion_records`

| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | serial | PK | PK |
| user_id | text | 用户ID，FK → users.user_id | ✅ INDEX |
| event | text | 事件描述（客观发生了什么）| - |
| emotion_type | text | 情绪类型（如：焦虑/快乐/悲伤/愤怒）| ❌ 第一阶段不加索引 |
| emotion_intensity | decimal(4,2) | 情绪强度 1-5，保留两位小数 | - |
| need | text | 需求描述（真正想要什么）| - |
| ai_recognized_emotion | text | AI识别出的情绪 | - |
| ai_recognized_intensity | decimal(4,2) | AI识别出的强度 | - |
| record_date | date | 记录日期 | ✅ INDEX |
| created_at | timestamp (UTC) | 创建时间 | - |
| updated_at | timestamp (UTC) | 更新时间 | - |
| deleted_at | timestamp (UTC) | 软删除时间 | NULL = 未删除 | - |

**设计决策**:
- 情绪类型用text，灵活可扩展，不限制枚举
- 时区：数据库存UTC，前端转本地时区
- 软删除

### 情绪检测问题表 `emotion_questions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | PK |
| dimension | text | 维度（精力/情绪稳定性/愉悦感/压力/睡眠/自信）|
| question_text | text | 问题文案 |
| is_active | boolean | 是否启用 | DEFAULT true |
| created_at | timestamp (UTC) | 创建时间 |

六个维度：精力水平、情绪稳定性、愉悦感、压力水平、睡眠质量、自信心

六个维度：精力水平、情绪稳定性、愉悦感、压力水平、睡眠质量、自信心

### 每日情绪检测结果表 `emotion_daily_checks`

| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | serial | PK | PK |
| user_id | text | 用户ID | ✅ INDEX |
| check_date | date | 检测日期 | ✅ INDEX |
| total_score | integer | 总分（满分50）| - |
| questions_json | jsonb | 问题列表和用户答案 | - |
| is_below_threshold | boolean | 是否低于阈值 | - |
| created_at | timestamp (UTC) | 创建时间 | - |
| deleted_at | timestamp (UTC) | 软删除时间 | NULL = 未删除 | - |

**设计决策**:
- 问题和答案存在jsonb里，灵活不需要额外关联表
- 软删除
- 时区存UTC

### 初始化数据

情绪检测问题表需要初始化10+题，每个维度至少2题。

## 后端API设计

### 认证模块 `POST /api/auth/*`

- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 登出

### 用户管理模块 `GET /api/admin/users`

- `GET /api/admin/users` - 获取用户列表（管理员）
- `POST /api/admin/users` - 新增用户（管理员）
- `PUT /api/admin/users/:id` - 更新用户（管理员）
- `DELETE /api/admin/users/:id` - 删除用户（管理员）

### 情绪日记模块 `GET /api/emotion/*`

- `GET /api/emotion/records` - 获取情绪记录列表（分页）
- `GET /api/emotion/records/:id` - 获取单条记录
- `POST /api/emotion/records` - 创建记录
- `PUT /api/emotion/records/:id` - 更新记录
- `DELETE /api/emotion/records/:id` - 删除记录
- `POST /api/emotion/recognize` - AI识别情绪（输入文本，返回识别结果）

### 情绪检测模块 `GET /api/emotion-check/*`

- `GET /api/emotion-check/status` - 获取今日检测状态
- `POST /api/emotion-check/generate` - 生成今日检测题目（动态抽取10题）
- `POST /api/emotion-check/submit` - 提交检测答案，计算结果
- `GET /api/emotion-check/history` - 获取历史检测结果（分页）
- `GET /api/emotion-check/analysis` - 获取多周期分析数据

## 前端页面结构

```
src/app/
├── dashboard/
│   └── page.tsx              # 仪表盘概览页
├── emotion/
│   ├── page.tsx              # 情绪记录列表页
│   ├── new/
│   │   └── page.tsx          # 新建情绪记录
│   ├── [id]/
│   │   └── page.tsx          # 编辑情绪记录
│   └── check/
│       └── page.tsx          # 情绪健康检测答题页
├── emotion-analysis/
│   └── page.tsx              # 情绪分析回顾页
├── admin/
│   └── users/
│       └── page.tsx          # 管理员用户管理页
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # PC侧边栏
│   │   ├── BottomNav.tsx     # 移动端底部导航
│   │   └── AppLayout.tsx     # 响应式布局容器
│   └── emotion/
│       ├── EmotionRecordForm.tsx
│       └── EmotionCheckCard.tsx
```

## AI服务设计

### 情绪识别接口

```typescript
interface AIService {
  recognizeEmotion(text: string): Promise<{
    emotionType: string;
    intensity: number;
  }>;
}
```

- 后端调用大模型API分析文本情绪
- 返回推荐的情绪类型和强度
- 用户可以接受或修改

提示词设计要点：
- 要求从常见情绪列表中选择一个
- 强度在1-5之间打分
- 返回JSON格式

### 情绪分析提炼接口（多周期回顾）

```typescript
interface AIAnalysisRequest {
  records: EmotionRecord[];
  period: 'day' | 'week' | 'month' | 'quarter';
}

interface AIAnalysisResult {
  commonEmotions: Array<{emotion: string; percentage: number}>;
  commonTriggers: string[];
  summary: string;
  suggestions: string[];
}
```

## 加密设计（本阶段不实现，仅预留位置）

在DAO层预留加密/解密钩子：

```typescript
interface EncryptionService {
  encrypt(plaintext: string, key: string): string;
  decrypt(ciphertext: string, key: string): string;
}
```

本阶段加密服务为noop（不加密），后续迭代替换实现即可。

## 依赖关系

```
用户认证 ← 基础依赖
    ↓
情绪日记 ← 依赖用户认证
    ↓
情绪检测 ← 依赖情绪日记 + 用户认证
    ↓
管理员用户管理 ← 依赖用户认证
```

本阶段独立，可以开始开发。
