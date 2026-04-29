# Personal Assistant

个人私有 AI 智能助手，集成情绪管理、知识沉淀、任务管理三大核心能力，通过 AI 辅助个人成长，帮助用户记录生活、提炼价值观、优化决策质量。

## 功能概览

- **情绪管理** — 记录每日情绪与事件，长期追踪情绪模式和价值观变化；情绪不佳时自动提醒，避免低落时做重大决策
- **知识沉淀** — 导入微信读书划线笔记，定期复习对比，追踪长时间跨度的认知变化
- **任务管理** — 今日任务优先级结合情绪状态，合理安排工作量
- **想法聚合** — 快速记录零散想法，自动聚合相似主题，从想法沉淀出明确项目

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + App Router |
| 后端 | Express.js 4.x + TypeScript + PostgreSQL + Drizzle ORM + Redis |
| 共享类型 | `@personal-assistant/types` |
| 数据库 | PostgreSQL 15+ / Drizzle ORM |
| 测试 | Vitest + supertest（后端）/ Playwright（E2E） |
| 构建 | pnpm workspace（Monorepo） |

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend (Next.js 16)                       │
│              localhost:3000                              │
│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 情绪日记  │ │ 知识沉淀  │ │ 任务管理 │ │ 想法聚合 │ │
│  └───────────┘ └───────────┘ └──────────┘ └──────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Express.js 4.x)                    │
│              localhost:3001                              │
│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ │
│  │  路由层   │ │  控制器   │ │  服务层  │ │ 中间件   │ │
│  └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └──────────┘ │
│        └──────────────┴────────────┘                     │
└────────────┬──────────────────────┬──────────────────────┘
             │                      │
             ▼                      ▼
┌────────────────────┐  ┌─────────────────────────────────┐
│  PostgreSQL 15+    │  │           Redis                  │
│  ┌──────────────┐  │  │  ┌───────────┐ ┌─────────────┐ │
│  │  情绪记录    │  │  │  │  会话缓存 │ │  速率限制   │ │
│  │  知识笔记    │  │  │  └───────────┘ └─────────────┘ │
│  │  任务数据    │  │  └─────────────────────────────────┘
│  │  用户信息    │  │
│  └──────────────┘  │
│  Drizzle ORM       │
└────────────────────┘

         ┌──────────────────────────────┐
         │   @personal-assistant/types  │
         │   前后端共享类型定义          │
         └──────────────────────────────┘
```

## 项目结构

```
personal-assistant/
├── packages/
│   ├── frontend/     # Next.js 前端应用
│   ├── backend/      # Express.js 后端 API
│   ├── types/        # 前后端共享类型定义
│   └── drizzle/      # 数据库 ORM schema 与配置
├── e2e/              # Playwright E2E 测试
├── openspec/         # OpenSpec 变更管理
├── docs/             # 项目文档
└── design-system/    # 设计系统
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm
- PostgreSQL 15+
- Redis

### 安装与运行

```bash
# 安装依赖
pnpm install

# 配置环境变量（复制模板后填写）
cp .env.example .env

# 启动开发服务器（前后端同时启动）
pnpm dev

# 或分别启动
pnpm dev:backend   # 后端 → http://localhost:3001
pnpm dev:frontend  # 前端 → http://localhost:3000
```

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 构建所有包（types → drizzle → backend → frontend）
pnpm lint             # ESLint 代码检查
pnpm typecheck        # TypeScript 类型检查
```

## API 规范

后端 API 遵循统一的响应结构：

- 成功：`{ success: true, data: T, message?: string }`
- 失败：`{ success: false, error: string }`
- 分页：`{ success: true, data: T[], pagination: { page, pageSize, total, totalPages, hasNext, hasPrev } }`

分页默认 20 条/页，类型定义在 `@personal-assistant/types`。

## 许可证

ISC
