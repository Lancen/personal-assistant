## MODIFIED Requirements

### Requirement: Dashboard 展示情绪状态卡片

Dashboard 页面 SHALL 展示用户今日情绪状态概览，包含：今日情绪记录数量、今日检测完成状态和快捷入口。所有统计数据 MUST 从后端 API 实时获取，MUST NOT 使用硬编码假数据。

#### Scenario: Dashboard 展示情绪状态卡片

- **GIVEN** 用户已登录，今日已记录 2 条情绪，尚未完成检测
- **WHEN** 用户访问 /dashboard 页面
- **THEN** 页面顶部显示情绪状态卡片，左侧显示"今日已记录 2 条情绪"，右侧显示"点击完成今日检测"按钮和跳转链接

#### Scenario: Dashboard 展示已完成检测状态

- **GIVEN** 用户已登录，今日已完成检测，总分为 35
- **WHEN** 用户访问 /dashboard 页面
- **THEN** 情绪状态卡片显示"今日检测 35/50"，不显示检测入口按钮

#### Scenario: Dashboard 统计数据来自真实 API

- **GIVEN** 用户已登录，有 12 条任务（8 条已完成）、46 条笔记
- **WHEN** 用户访问 /dashboard 页面
- **THEN** 统计卡片中的任务完成数显示"8/12"，笔记数显示"46"，数据来自 API 调用而非硬编码

### Requirement: 导航菜单包含情绪日记入口

所有页面的侧边栏导航 MUST 包含「情绪日记」菜单项，位于「仪表盘」和「任务管理」之间。

#### Scenario: 侧边栏显示情绪日记导航项

- **GIVEN** 用户已登录，在任意页面
- **WHEN** 用户查看侧边栏
- **THEN** 导航菜单从上到下依次为：仪表盘、情绪日记、任务管理、知识笔记、日历、设置

#### Scenario: 点击情绪日记导航跳转

- **GIVEN** 用户在 Dashboard 页面
- **WHEN** 用户点击侧边栏的「情绪日记」
- **THEN** 页面跳转到 /emotion，情绪日记导航项高亮

### Requirement: 情绪分析回顾页

前端 SHALL 在 /emotion-analysis 页面展示用户情绪记录的时间线和简单趋势。Phase 1 仅展示历史记录的可视化，不做 AI 多周期分析。

#### Scenario: 情绪分析页展示历史趋势

- **GIVEN** 用户已登录，有近 30 天的情绪记录
- **WHEN** 用户访问 /emotion-analysis 页面
- **THEN** 页面展示情绪记录时间线（按日期排列），包含情绪类型分布和强度趋势的简单图表

#### Scenario: 情绪分析页空状态

- **GIVEN** 用户已登录，没有情绪记录
- **WHEN** 用户访问 /emotion-analysis 页面
- **THEN** 页面显示空状态提示"暂无情绪记录数据"，引导用户去创建记录
