## MODIFIED Requirements

### Requirement: Dashboard 展示情绪状态卡片

Dashboard 页面 SHALL 展示用户今日情绪状态概览，包含今日情绪记录数量、今日检测完成状态和快捷入口。所有统计数据 MUST 从后端 API 实时获取，MUST NOT 使用硬编码假数据。

#### Scenario: 展示情绪状态卡片

- **WHEN** 已认证用户（今日已记录 2 条情绪，未完成检测）访问 /dashboard
- **THEN** 页面顶部显示情绪状态卡片，左侧"今日已记录 2 条情绪"，右侧"点击完成今日检测"按钮

#### Scenario: 已完成检测状态展示

- **WHEN** 已认证用户（今日已完成检测，总分 35）访问 /dashboard
- **THEN** 情绪卡片显示"今日检测 35/50"，不显示检测入口按钮

#### Scenario: 统计数据来自真实 API

- **WHEN** 已认证用户（12 条任务 8 完成、46 条笔记）访问 /dashboard
- **THEN** 统计卡片中任务完成数"8/12"、笔记数"46"来自 API 调用而非硬编码

### Requirement: 导航菜单包含情绪日记入口

所有页面的侧边栏导航 MUST 包含「情绪日记」菜单项，位于「仪表盘」和「任务管理」之间。

#### Scenario: 侧边栏显示情绪日记导航项

- **WHEN** 已认证用户在任意页面查看侧边栏
- **THEN** 导航顺序为：仪表盘、情绪日记、任务管理、知识笔记、日历、设置

#### Scenario: 点击情绪日记导航跳转

- **WHEN** 用户点击侧边栏「情绪日记」
- **THEN** 页面跳转到 /emotion，情绪日记导航项高亮

### Requirement: 情绪分析回顾页

前端 SHALL 在 /emotion-analysis 展示用户情绪记录时间线和简单趋势。Phase 1 仅展示历史记录可视化，不做 AI 多周期分析。

#### Scenario: 展示历史趋势

- **WHEN** 已认证用户（近 30 天有记录）访问 /emotion-analysis
- **THEN** 展示情绪记录时间线（按日期排列）、情绪类型分布和强度趋势图表

#### Scenario: 空状态

- **WHEN** 已认证用户（无记录）访问 /emotion-analysis
- **THEN** 显示"暂无情绪记录数据"，引导去创建记录
