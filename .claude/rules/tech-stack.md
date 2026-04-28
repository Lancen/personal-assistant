# 技术选型规范

## 整体架构

- **架构模式**: Monorepo 前后端分离，pnpm workspace 管理
- **包管理**: pnpm（禁止使用 npm/yarn）
- **数据访问规则**: 前端只允许通过 API 获取后端数据，禁止直接访问数据库

## 前端技术栈

- 框架: Next.js 16.2.4
- React 版本: 19
- 语言: TypeScript（严格模式）
- 样式: Tailwind CSS v4 + @tailwindcss/postcss
- 路由: Next.js App Router

## 后端技术栈

- 框架: Express.js 4.x
- 语言: TypeScript（严格模式）
- 数据库: PostgreSQL
- ORM: Drizzle ORM
- 数据库客户端: pg
- 缓存: Redis
- API 设计: RESTful API 规范
- 分页约定: 默认分页大小为 20 条数据每页

## API 响应结构规范

所有后端 API 必须遵循统一的响应结构规范：

**成功响应：**
```typescript
{
  success: true,
  data: T,              // 业务数据（必填）
  message?: string      // 成功提示信息（可选）
}
```

**失败响应：**
```typescript
{
  success: false,
  error: string         // 错误描述信息（必填）
}
```

**分页响应：**
```typescript
{
  success: true,
  data: T[],            // 当前页数据数组
  pagination: {
    page: number,       // 当前页码（从 1 开始）
    pageSize: number,   // 每页条数，默认 20
    total: number,      // 总记录数
    totalPages: number, // 总页数
    hasNext: boolean,   // 是否有下一页
    hasPrev: boolean    // 是否有上一页
  }
}
```

**类型定义：**
所有响应结构在 `@personal-assistant/types` 包中定义，前后端共享：
- `ApiResponse<T>` - 统一 API 响应（联合类型）
- `SuccessResponse<T>` - 成功响应
- `ErrorResponse` - 失败响应
- `PaginatedResponse<T>` - 分页响应
- `PaginationInfo` - 分页信息
- `DEFAULT_PAGE_SIZE = 20` - 默认分页大小

**工具函数：**
使用 `packages/backend/src/utils/response.ts` 中的工具函数构造响应：
- `success(data, message?)` - 创建成功响应
- `error(message)` - 创建错误响应
- `paginated(data, page, total, pageSize?)` - 创建分页响应
- `getPaginationOffset(page, pageSize?)` - 计算分页偏移量

## 共享包

- 内容: 前后端共享类型定义
- 编译: TypeScript 编译到 dist 目录

## 依赖原则

- 不要随意新增依赖，必须明确要求才能安装
- 优先使用轻量级、维护活跃的包
- 共享类型使用 `@personal-assistant/types`，前后端不要重复定义
