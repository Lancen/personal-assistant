## ADDED Requirements

### Requirement: 每日情绪检测状态查询

系统 SHALL 允许已认证用户查询今日检测完成状态。返回 MUST 包含 completed、checkDate、totalScore。

#### Scenario: 今日未完成检测

- **WHEN** 已认证用户请求 GET /api/emotion-check/status，今日未完成检测
- **THEN** 返回 200，data 为 { completed: false, checkDate: null, totalScore: null }

#### Scenario: 今日已完成检测

- **WHEN** 已认证用户请求 GET /api/emotion-check/status，今日已完成检测且总分 35
- **THEN** 返回 200，data 为 { completed: true, checkDate: "2026-04-28", totalScore: 35 }

### Requirement: 每日情绪检测出题

系统 SHALL 从 6 维度问题池随机抽取 10 道活跃题目（每维度至少 1 题）。同一天多次生成 MUST 返回相同题目（幂等性）。

#### Scenario: 首次生成题目

- **WHEN** 已认证用户提交 POST /api/emotion-check/generate，今日未生成，问题池有 18 道活跃题
- **THEN** 返回 200，data.questions 含 10 题，每维度至少 1 题；data.checkDate 为今日

#### Scenario: 重复生成返回相同题目

- **WHEN** 已认证用户今日已生成题目后再次提交 POST /api/emotion-check/generate
- **THEN** 返回与首次相同的 10 道题目

#### Scenario: 已完成检测后不再生成新题目

- **WHEN** 已认证用户今日已完成检测后提交 POST /api/emotion-check/generate
- **THEN** 返回已完成检测的结果，不生成新题目

### Requirement: 提交情绪检测答案

系统 SHALL 接收 10 道题评分（每题 1-5），计算总分（满分 50），判断阈值，存储结果。

#### Scenario: 总分高于阈值

- **WHEN** 已认证用户提交 POST /api/emotion-check/submit，10 题总分 35，阈值 25
- **THEN** 返回 200，data.totalScore=35，data.isBelowThreshold=false，data.suggestion 不存在；data.dimensionScores 含 6 维度得分

#### Scenario: 总分低于阈值

- **WHEN** 已认证用户提交 POST /api/emotion-check/submit，10 题总分 20，阈值 25
- **THEN** 返回 200，data.isBelowThreshold=true，data.suggestion="你当前情绪状态偏低，建议今天不做重大决策"

#### Scenario: 评分超出 1-5 范围

- **WHEN** 已认证用户提交 POST /api/emotion-check/submit，某题评分为 6
- **THEN** 返回 400，success: false，错误描述"评分必须在1-5之间"

#### Scenario: 答案数量不匹配

- **WHEN** 已认证用户提交 POST /api/emotion-check/submit，今日 10 题但只提交 8 个答案
- **THEN** 返回 400，success: false，错误描述"答案数量与题目数量不匹配"

#### Scenario: 重复提交当日检测

- **WHEN** 已认证用户今日已完成检测后再次提交 POST /api/emotion-check/submit
- **THEN** 返回 200，返回当日已有结果，不重复创建

### Requirement: 情绪检测历史查询

系统 SHALL 允许用户查询历史检测结果，按日期降序，支持分页。

#### Scenario: 查询历史检测结果

- **WHEN** 已认证用户请求 GET /api/emotion-check/history?page=1&pageSize=20，有 30 条历史
- **THEN** 返回 200，data 含 20 条，pagination.total=30，pagination.hasNext=true

### Requirement: 情绪检测前端答题页

前端 SHALL 在 /emotion/check 提供一题一页答题交互。答完最后一题展示检测结果。

#### Scenario: 逐题答题流程

- **WHEN** 用户访问 /emotion/check，今日已生成 10 题
- **THEN** 显示第 1 题含维度标签、问题文案、1-5 分选项，进度指示器"1/10"

#### Scenario: 答题翻页

- **WHEN** 用户在第 3 题选择 4 分后点击「下一题」
- **THEN** 页面切换到第 4 题，进度指示器"4/10"

#### Scenario: 答完最后一题提交结果

- **WHEN** 用户在第 10 题选择分数后点击「提交」
- **THEN** 调用 POST /api/emotion-check/submit，展示结果页含总分、维度得分、阈值判断

#### Scenario: 今日已完成检测直接展示结果

- **WHEN** 用户访问 /emotion/check，今日已完成检测
- **THEN** 直接展示今日检测结果，不显示答题界面

#### Scenario: 低分结果引导情绪记录

- **WHEN** 检测结果 isBelowThreshold=true
- **THEN** 结果页显示"记录一条情绪"按钮，点击跳转 /emotion/new
