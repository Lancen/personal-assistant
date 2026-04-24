# UIUE - 个人智能助手

> 注重隐私的个人成长工具 · 任务管理 · 知识沉淀 · 日历视图 · 系统设置

---

## 项目概述

**UIUE** 是一个面向知识工作者的个人智能助手应用，注重隐私保护，所有数据存储在本地设备。设计追求极简、专注、治愈系体验。

### 核心设计理念

- **隐私优先**：所有数据仅存储在用户本地设备，不会上传到任何服务器
- **极简主义**：大量留白，低饱和度莫兰迪色系，轻拟态设计
- **专注体验**：减少干扰，让用户专注于任务和思考
- **温暖友好**：柔和的圆角、舒缓的色彩，提供治愈系体验

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Framework** | Next.js 14 (App Router) | React 全栈框架 |
| **Language** | TypeScript | 类型安全 |
| **Styling** | Tailwind CSS | 原子化CSS |
| **Icons** | Lucide React | 优雅简洁SVG图标 |
| **Design System** | 自定义莫兰迪低饱和色系 | 项目专属设计系统 |
| **Testing** | Playwright | 端到端测试 |

---

## 设计系统

### 色彩规范 (莫兰迪低饱和色系)

| 色彩 | 色值 | 用途 |
|------|------|------|
| **primary** | `#7F8C7F` | 鼠尾草绿 - 主色，安抚情绪 |
| **accent** | `#8FB4C7` | 淡蓝色 - 强调色，平静舒缓 |
| **background** | `#F5F5F0` | 暖米色 - 背景色 |
| **card** | `#FFFFFF` | 白色 - 卡片背景 |
| **border** | `#E5E5E0` | 浅灰色 - 边框 |

### 象限色彩 (任务四象限)

| 象限 | 背景色 | 文字色 |
|------|--------|--------|
| 重要紧急 | `bg-red-100/40 border-red-200/60` | `text-red-800` |
| 重要不紧急 | `bg-green-100/40 border-green-200/60` | `text-green-800` |
| 紧急不重要 | `bg-amber-100/40 border-amber-200/60` | `text-amber-800` |
| 不重要不紧急 | `bg-blue-100/40 border-blue-200/60` | `text-blue-800` |

### 设计规范

- **圆角**：大圆角 `xl: 1rem / 1.5rem`
- **阴影**：轻拟柔和阴影 `shadow-soft-md`
- **字体**：Inter + PingFang SC，清晰无衬线
- **间距**：Mobile-first 响应式，4px 增量间距系统

---

## 页面结构

### 当前包含页面

| 路由 | 页面 | 说明 | 状态 |
|------|------|------|------|
| `/` | 首页 | 欢迎页，跳转登录 | ✅ 完成 |
| `/login` | 登录页 | 用户登录 | ✅ 完成 |
| `/dashboard` | 仪表盘 | 概览面板 | ✅ 完成 |
| `/tasks` | 任务管理 | 四象限任务管理 + 所有任务列表 | ✅ 完成 |
| `/notes` | 知识笔记 | 笔记增删改查，搜索，标签，置顶 | ✅ 完成 |
| `/calendar` | 日历 | 月度日历，聚合各模块活动 | ✅ 完成 |
| `/settings` | 设置 | 外观、通知、数据、隐私设置 | ✅ 完成 |
| `/mood` | 情绪记录 | **已删除** 按需求删除 | ⚪ 删除 |

### 布局结构

```
┌─────────────────────────────────┐
│ 侧边栏 (左侧)                   │
│ - Logo                         │
│ - 导航菜单                      │
│               ┌───────────────┐ │
│               │ 顶部导航栏     │ │
│               │ - 移动端菜单   │ │
│               │ - 页面标题     │ │
│               │ - 通知+用户菜单 │ │
│               ├───────────────┤ │
│               │ 主内容区       │ │
│               │               │ │
│               │               │ │
│               │               │ │
│               │               │ │
│               │               │ │
│               └───────────────┘ │
└─────────────────────────────────┘
```

**响应式行为**：
- **桌面端 (>lg)**：侧边栏常驻，多列布局
- **移动端 (<=lg)**：侧边栏抽屉式，点击汉堡按钮滑入

---

## 核心功能

### 任务管理 (`/tasks`)

#### 四象限视图 (艾森豪威尔矩阵)

按照重要性和紧急性将任务分为四个象限：

1. **重要紧急** - 立即处理
2. **重要不紧急** - 计划进行
3. **紧急不重要** - 可授权他人
4. **不重要不紧急** - 有空再做

**功能特性**：
- 点击勾选框切换完成状态
- 编辑/删除任务
- 支持关联情绪记录和知识笔记
- 新建任务弹窗表单

#### 所有任务列表视图

- **关键词搜索**：搜索任务标题和描述
- **象限筛选**：按优先级象限筛选
- **创建时间筛选**：全部 / 今天 / 近7天 / 近30天
- **完成时间筛选**：全部 / 今天 / 近7天 / 近30天
- 列表显示：创建时间 + 完成时间 + 优先级标签

**数据结构**：

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: Quadrant;
  completed: boolean;
  createdAt: string;      // 创建日期
  completedAt?: string;    // 完成日期
  linkedMood?: string;
  linkedNote?: string;
}
```

---

### 知识笔记 (`/notes`)

**功能特性**：

- 📝 **CRUD**：创建/阅读/编辑/删除笔记
- 🔍 **实时搜索**：关键词搜索标题和内容
- 🏷️ **标签管理**：添加多个标签，按标签筛选
- 📌 **置顶功能**：重要笔记可以置顶，显示在最前面
- 👁️ **视图切换**：卡片视图 / 列表视图 切换
- 📱 **响应式网格**：移动端 1列 → 平板 2列 → 桌面 3列

---

### 日历 (`/calendar`)

**功能特性**：

- 📅 **月度日历网格**：显示当月所有日期
- 🎯 **点击日期查看详情**：显示该日期所有活动
- 🔗 **跨模块聚合**：聚合来自任务、情绪、笔记的活动
- 📊 **月度统计**：显示总活动数按类型分类统计
- ⬅️➡️ **月份导航**：支持切换到任意月份

---

### 设置 (`/settings`)

**功能分组**：

1. **外观** - 深色模式切换
2. **通知** - 每日提醒开关
3. **数据** - 自动保存开关 / 导出所有数据 / 清除所有数据
4. **安全与隐私** - 隐私说明
5. **关于** - 版本信息
6. **退出登录** - 退出当前账户

---

## 项目文件结构

```
uiue/
├── app/
│   ├── globals.css           # 全局样式和设计系统变量
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页
│   ├── dashboard/
│   │   └── page.tsx          # 仪表盘
│   ├── login/
│   │   └── page.tsx          # 登录页
│   ├── tasks/
│   │   └── page.tsx          # 任务管理 ✨ 当前文档焦点
│   ├── notes/
│   │   └── page.tsx          # 知识笔记
│   ├── calendar/
│   │   └── page.tsx          # 日历
│   ├── settings/
│   │   └── page.tsx          # 设置
│   └── (mood/ deleted)       # 情绪记录已删除
│
├── public/                   # 静态资源
├── .next/                    # 构建输出
├── node_modules/             # 依赖
├── package.json              # 依赖配置
├── tailwind.config.ts        # Tailwind 配置
├── next.config.js            # Next.js 配置
├── playwright-check.spec.ts  # Playwright 端到端测试
└── CLAUDE.md                 # 项目说明 (Claude Code)
```

---

## 核心代码亮点

### 四象限颜色设计 (莫兰迪低饱和)

```typescript
const quadrantConfig = {
  "important-urgent": {
    title: "重要紧急",
    color: "bg-red-100/40 border-red-200/60",
    headerColor: "text-red-800",
    description: "立即处理",
  },
  "important-not-urgent": {
    title: "重要不紧急",
    color: "bg-green-100/40 border-green-200/60",
    headerColor: "text-green-800",
    description: "计划进行",
  },
  // ...
};
```

使用 Tailwind CSS 透明度实现低饱和效果，保持对比度符合可访问性标准。

### 双重时间筛选逻辑

```typescript
// 过滤所有任务
const filteredTasks = tasks.filter(task => {
  const matchesSearch = !searchQuery ||
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesQuadrant = filterQuadrant === "all" || task.quadrant === filterQuadrant;
  const matchesCreatedTime = isInTimeRange(task.createdAt, createdTimeFilter);
  const matchesCompletedTime = isInTimeRange(task.completedAt, completedTimeFilter);
  return matchesSearch && matchesQuadrant && matchesCreatedTime && matchesCompletedTime;
});

// 时间范围判断
const isInTimeRange = (dateStr: string | undefined, filter: TimeFilterOption): boolean => {
  if (filter === "all") return true;
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  switch (filter) {
    case "today": return diffDays === 0;
    case "week": return diffDays <= 7;
    case "month": return diffDays <= 30;
    default: return true;
  }
};
```

### 任务完成时间自动设置

```typescript
const toggleTaskCompleted = (id: string) => {
  setTasks(tasks.map(task =>
    task.id === id
      ? {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString().split('T')[0] : undefined,
        }
      : task
  ));
};
```

勾选完成时自动设置完成日期为今天，取消完成时清空。

---

## 运行说明

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000`

### 生产构建

```bash
npm run build
npm start
```

### 运行 Playwright 测试

```bash
npx playwright test
```

---

## 可访问性合规

- ✅ 所有图标按钮都有 `aria-label`
- ✅ 色彩对比度符合 WCAG 2.1 AA 标准 (4.5:1)
- ✅ 支持键盘导航，所有交互元素可聚焦
- ✅ 尊重 `prefers-reduced-motion` 设置
- ✅ 正确的标题层级 `h1` → `h2` → `h3`

---

## 响应式测试

| 设备 | 宽度 | 布局 | 测试结果 |
|------|------|------|----------|
| 手机 | 375px | 单列 + 抽屉侧边栏 | ✅ 通过 |
| 平板 | 768px | 单列 + 抽屉侧边栏 | ✅ 通过 |
| 桌面 | 1440px | 侧边栏 + 主内容 | ✅ 通过 |

---

## 更新日志

### v1.1.0 (2026-04-24)

- ✅ 删除情绪记录页面 (按需求)
- ✅ 任务管理：删除周任务汇总标签页
- ✅ 任务管理：所有任务列表增加 **创建时间筛选** + **完成时间筛选** 双筛选器
- ✅ 任务列表显示 **创建时间** 和 **完成时间**
- ✅ 任务模型增加 `completedAt` 字段存储完成日期
- ✅ 调整四象限配色为更低饱和莫兰迪风格
- ✅ 所有测试通过 (12/12)

### v1.0.0 (2026-04-23)

- ✅ 创建登录页面
- ✅ 创建仪表盘页面
- ✅ 创建任务管理 (四象限艾森豪威尔矩阵)
- ✅ 创建知识笔记 (搜索+标签+置顶+视图切换)
- ✅ 创建日历 (月度聚合视图)
- ✅创建设置页面
- ✅ 侧边栏用户信息迁移到右上角用户下拉菜单
- ✅ 任务管理增加二级标签：四象限 / 所有任务

---

## 项目统计

- **页面总数**：10 个静态页面
- **代码行数**：~ 800 行 (任务管理页面)
- **测试**：12/12 Playwright 测试通过
- **构建状态**：✅ 成功

---

## 许可证

MIT - 个人项目，注重隐私开源

---

**💚 UIUE - 让思考更清晰，让成长可追踪**
