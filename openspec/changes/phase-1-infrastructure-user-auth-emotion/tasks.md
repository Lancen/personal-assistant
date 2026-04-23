# 任务分解：Phase 1 基础设施 + 用户体系 + 情绪日记

所有任务拆分不超过2小时，按开发顺序排列。

---

## 任务列表

### 1. 数据库层

- [x] **1.1** 在 `packages/drizzle` 中定义所有表schema
  - users 表
  - emotion_records 表
  - emotion_questions 表
  - emotion_daily_checks 表
  - 运行迁移生成SQL

- [x] **1.2** 在 `packages/types` 中添加业务类型定义
  - EmotionRecord 类型
  - EmotionCheck 类型
  - EmotionQuestion 类型

### 2. 后端基础

- [x] **2.1** 实现后端认证中间件 JWT 认证
  - JWT token 验证
  - 用户信息注入 Request
  - 管理员权限检查

- [x] **2.2** 实现用户认证 API
  - POST /api/auth/login
  - GET /api/auth/me
  - POST /api/auth/logout

- [x] **2.3** 实现管理员用户管理 API
  - GET /api/admin/users (列表)
  - POST /api/admin/users (新增)
  - PUT /api/admin/users/:id (更新)
  - DELETE /api/admin/users/:id (删除)

- [x] **2.4** 实现情绪记录 CRUD API
  - GET /api/emotion/records (列表分页)
  - GET /api/emotion/records/:id (单条)
  - POST /api/emotion/records (创建)
  - PUT /api/emotion/records/:id (更新)
  - DELETE /api/emotion/records/:id (删除)

- [x] **2.5** 实现 AI 情绪识别 API
  - POST /api/emotion/recognize
  - 调用大模型识别情绪

- [x] **2.6** 初始化情绪检测问题数据
  - 六个维度各插入至少2题
  - 总共至少15题（当前18题）

- [x] **2.7** 实现情绪检测 API
  - GET /api/emotion-check/status (今日状态)
  - POST /api/emotion-check/generate (抽题)
  - POST /api/emotion-check/submit (提交答案)
  - GET /api/emotion-check/history (历史)
  - GET /api/emotion-check/analysis (多周期分析数据)

- [x] **2.8** 实现后端 AI 服务层基类
  - 统一AI调用入口
  - 预留接口方便后续扩展

### 3. 前端共享组件和布局

- [x] **3.1** 创建响应式应用布局组件
  - AppLayout 容器组件
  - PC端 Sidebar 侧边栏导航
  - 移动端 BottomNav 底部导航
  - 认证保护逻辑

- [x] **3.2** 更新共享类型包导入

### 4. 前端页面 - 基础和仪表盘

- [x] **4.1** 创建仪表盘概览页
  - 显示统计卡片（情绪检测状态、最近记录数）
  - 最近情绪记录列表
  - 如果今日未检测，显示提示卡片去检测

### 5. 前端页面 - 情绪日记

- [x] **5.1** 创建情绪记录列表页
  - 列表展示，按日期倒序
  - 新建按钮
  - 分页加载

- [x] **5.2** 创建情绪记录表单组件
  - 事件输入框
  - 情绪类型选择 + 滑块强度选择
  - 需求输入框
  - AI识别按钮
  - AI识别结果展示

- [x] **5.3** 创建新建情绪记录页面

- [x] **5.4** 创建编辑情绪记录页面

### 6. 前端页面 - 情绪检测

- [x] **6.1** 创建情绪健康检测答题页
  - 一题一页布局
  - 进度条显示进度
  - 滑块选择分数（1-5分）
  - 上一题/下一题导航
  - 提交按钮

- [x] **6.2** 实现答题结果展示
  - 总分显示
  - 低于阈值时醒目的提醒文案
  - 建议调整任务的提示

### 7. 前端页面 - 情绪分析和管理

- [x] **7.1** 创建情绪分析回顾页
  - 周期选择标签（日/周/月/季度）
  - 得分趋势图表
  - 情绪统计分布
  - AI提炼总结

- [x] **7.2** 创建管理员用户管理页
  - 用户列表展示
  - 新增用户弹窗/表单
  - 编辑/删除操作

### 8. 导航路由整合

- [x] **8.1** 更新所有路由配置
  - 添加新页面路由
  - 确保未登录跳转到登录页

### 9. 收尾检查

- [ ] **9.1** 运行 `pnpm lint` 检查代码质量
- [ ] **9.2** 运行 `pnpm typecheck` 检查类型
- [ ] **9.3** 本地启动前后端，人工测试所有功能

---

## 依赖顺序

任务必须按顺序完成，因为：
1. 数据库schema必须先定义
2. 后端API依赖数据库schema
3. 前端页面依赖后端API和共享布局组件
4. 最后整合测试

总的任务数：**19个任务**，预估开发时间 1-2 天。
