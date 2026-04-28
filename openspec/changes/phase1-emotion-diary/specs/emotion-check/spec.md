## ADDED Requirements

### Requirement: 每日情绪检测状态查询

系统 SHALL 允许已认证用户查询今日情绪检测完成状态。返回 MUST 包含今日是否已完成检测、检测日期、总分。

#### Scenario: 今日未完成检测

- **GIVEN** 用户已登录，今日尚未完成情绪检测
- **WHEN** 用户请求 GET /api/emotion-check/status
- **THEN** 系统返回 200，data 为 { completed: false, checkDate: null, totalScore: null }

#### Scenario: 今日已完成检测

- **GIVEN** 用户已登录，今日已完成情绪检测且总分为 35
- **WHEN** 用户请求 GET /api/emotion-check/status
- **THEN** 系统返回 200，data 为 { completed: true, checkDate: "2026-04-28", totalScore: 35 }

### Requirement: 每日情绪检测出题

系统 SHALL 从 6 个维度的问题池中随机抽取 10 道活跃题目，每维度至少 1 题。同一天内多次生成 MUST 返回相同的题目（幂等性）。

#### Scenario: 首次生成今日题目

- **GIVEN** 用户已登录，今日尚未生成题目，问题池中有 18 道活跃题目覆盖 6 个维度
- **WHEN** 用户提交 POST /api/emotion-check/generate
- **THEN** 系统返回 200，data.questions 包含 10 道题目，每个维度至少出现 1 题；data.checkDate 为今日日期

#### Scenario: 重复生成返回相同题目

- **GIVEN** 用户已登录，今日已生成过题目（题目 ID 为 [1,3,5,7,9,11,13,15,17,2]）
- **WHEN** 用户再次提交 POST /api/emotion-check/generate
- **THEN** 系统返回 200，data.questions 包含与首次相同的 10 道题目

#### Scenario: 已完成检测后不再生成新题目

- **GIVEN** 用户已登录，今日已完成检测并提交了答案
- **WHEN** 用户提交 POST /api/emotion-check/generate
- **THEN** 系统返回 200，data 包含已完成检测的结果，不再生成新题目

### Requirement: 提交情绪检测答案

系统 SHALL 接收用户对 10 道题目的评分（每题 1-5 分），计算总分（满分 50），判断是否低于阈值，并存储结果。

#### Scenario: 提交答案且总分高于阈值

- **GIVEN** 用户已登录，今日已生成题目，用户对 10 道题的评分总和为 35，阈值为 25
- **WHEN** 用户提交 POST /api/emotion-check/submit，body 包含 10 个 { questionId, score } 对
- **THEN** 系统返回 200，data.totalScore 为 35，data.isBelowThreshold 为 false，data.suggestion 不存在；data.dimensionScores 包含 6 个维度的得分明细

#### Scenario: 提交答案且总分低于阈值

- **GIVEN** 用户已登录，今日已生成题目，用户对 10 道题的评分总和为 20，阈值为 25
- **WHEN** 用户提交 POST /api/emotion-check/submit
- **THEN** 系统返回 200，data.isBelowThreshold 为 true，data.suggestion 为"你当前情绪状态偏低，建议今天不做重大决策"

#### Scenario: 答案中评分超出 1-5 范围

- **GIVEN** 用户已登录，某道题的评分为 6
- **WHEN** 用户提交 POST /api/emotion-check/submit
- **THEN** 系统返回 400，响应包含 success: false 和错误描述"评分必须在1-5之间"

#### Scenario: 答案数量与题目数量不匹配

- **GIVEN** 用户已登录，今日生成了 10 道题，但用户只提交了 8 个答案
- **WHEN** 用户提交 POST /api/emotion-check/submit
- **THEN** 系统返回 400，响应包含 success: false 和错误描述"答案数量与题目数量不匹配"

#### Scenario: 重复提交当日检测

- **GIVEN** 用户已登录，今日已完成检测
- **WHEN** 用户再次提交 POST /api/emotion-check/submit
- **THEN** 系统返回 200，返回当日已有的检测结果，不重复计算

### Requirement: 情绪检测历史查询

系统 SHALL 允许用户查询历史情绪检测结果，按检测日期降序排列，支持分页。

#### Scenario: 查询历史检测结果

- **GIVEN** 用户已登录，有 30 条历史检测结果
- **WHEN** 用户请求 GET /api/emotion-check/history?page=1&pageSize=20
- **THEN** 系统返回 200，data 数组包含 20 条记录，pagination.total 为 30，pagination.hasNext 为 true

### Requirement: 情绪检测前端答题页

前端 SHALL 在 /emotion/check 页面提供一题一页的答题交互。用户 MUST 逐题作答，每题显示维度标签、问题文案、1-5 分选项。答完最后一题后展示检测结果。

#### Scenario: 逐题答题流程

- **GIVEN** 用户在 /emotion/check 页面，今日已生成 10 道题目
- **WHEN** 页面加载
- **THEN** 显示第 1 题，包含维度标签、问题文案、1-5 分选项按钮，进度指示器显示"1/10"

#### Scenario: 答完一题跳转下一题

- **GIVEN** 用户在第 3 题，选择了 4 分
- **WHEN** 用户点击「下一题」
- **THEN** 页面切换到第 4 题，进度指示器显示"4/10"

#### Scenario: 答完最后一题提交结果

- **GIVEN** 用户在第 10 题，选择了 3 分
- **WHEN** 用户点击「提交」
- **THEN** 系统调用 POST /api/emotion-check/submit，页面切换到结果展示，显示总分、维度得分明细、是否低于阈值及建议

#### Scenario: 今日已完成检测时直接展示结果

- **GIVEN** 用户今日已完成检测
- **WHEN** 用户访问 /emotion/check
- **THEN** 页面直接展示今日检测结果，不显示答题界面

#### Scenario: 检测结果页面引导情绪记录

- **GIVEN** 用户刚完成检测，总分低于阈值
- **WHEN** 结果页面展示建议
- **THEN** 页面显示「记录一条情绪」按钮，点击跳转 /emotion/new
