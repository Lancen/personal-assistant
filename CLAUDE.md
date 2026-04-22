# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本代码仓库中的工作提供指导。

## 常用命令

- `pnpm install` - 安装所有包的依赖
- `pnpm dev` - 同时启动前后端开发服务器
- `pnpm dev:backend` - 只启动后端
- `pnpm dev:frontend` - 只启动前端
- `pnpm build` - 构建所有包（shared → backend → frontend）
- `pnpm lint` - 运行 ESLint 代码质量检查
- `pnpm typecheck` - 运行 TypeScript 类型检查

## 架构说明

这是一个 **Monorepo** 项目，使用 pnpm workspace 管理：
- **frontend**: Next.js 16.2.4，使用 App Router 模式，React 19 + TypeScript + Tailwind CSS v4
- **backend**: Express.js Node.js 后端 API 服务
- **shared**: 前后端共享类型定义和工具函数

关键点：
- 前后端可以独立部署，也可以一起部署
- 类型定义在 shared 包，前后端共享
- 前端运行在 `http://localhost:3000`，后端运行在 `http://localhost:3001`

## 项目结构

```
personal-assistant/
├── packages/
│   ├── shared/             # 共享类型和工具
│   │   └── src/index.ts    # 导出共享类型
│   ├── backend/            # Express 后端 API
│   │   ├── src/
│   │   │   ├── controllers/ # 控制器
│   │   │   ├── services/    # 业务逻辑
│   │   │   ├── routes/      # API 路由
│   │   │   ├── middleware/  # 中间件
│   │   │   ├── utils/       # 工具函数
│   │   │   └── index.ts     # 入口文件
│   │   └── package.json
│   └── frontend/           # Next.js 前端
│       ├── src/
│       │   ├── app/        # Next.js 页面路由
│       │   ├── components/ # 可复用 UI 组件
│       │   ├── context/    # React 上下文（AuthContext）
│       │   └── lib/        # 前端工具（API 客户端）
│       ├── public/         # 静态资源
│       └── package.json
├── pnpm-workspace.yaml     # pnpm 工作区配置
└── package.json            # 根目录统一脚本
```
