## ADDED Requirements

### Requirement: 情绪记录三要素 CRUD

系统 SHALL 允许已认证用户创建、查看、编辑、删除情绪记录。每条记录 MUST 包含三要素：事件（event）、情绪类型（emotionType）、情绪强度（emotionIntensity，1-5 保留两位小数）、需求（need）。所有记录 MUST 通过 user_id 实现用户间数据隔离。

#### Scenario: 创建情绪记录成功

- **WHEN** 已认证用户提交 POST /api/emotion/records，请求体包含有效的 event、emotionType、emotionIntensity(1-5)、need
- **THEN** 系统返回 201，data 包含自动生成的 recordId(UUID) 和 recordDate(当天)，以及其他完整记录数据

#### Scenario: 创建记录时强度超出范围

- **WHEN** 已认证用户提交 POST /api/emotion/records，emotionIntensity 为 6
- **THEN** 系统返回 400，success: false，错误描述"情绪强度必须在1-5之间"

#### Scenario: 创建记录时缺少必填字段

- **WHEN** 已认证用户提交 POST /api/emotion/records，缺少 need 字段
- **THEN** 系统返回 400，success: false，错误描述"需求描述不能为空"

#### Scenario: 未登录用户创建记录

- **WHEN** 未携带 Authorization header 提交 POST /api/emotion/records
- **THEN** 系统返回 401，success: false，错误描述"未授权，请先登录"

#### Scenario: 获取情绪记录列表

- **WHEN** 已认证用户请求 GET /api/emotion/records?page=1&pageSize=20，该用户有 25 条记录
- **THEN** 系统返回 200，data 数组含 20 条记录，pagination.total=25，pagination.hasNext=true，按 recordDate 降序

#### Scenario: 获取单条情绪记录

- **WHEN** 已认证用户请求 GET /api/emotion/records/:id，该记录属于该用户
- **THEN** 系统返回 200，data 包含完整记录

#### Scenario: 访问不属于自己的记录

- **WHEN** 用户 A 请求 GET /api/emotion/records/:id，该记录属于用户 B
- **THEN** 系统返回 404，success: false，错误描述"记录不存在"

#### Scenario: 更新情绪记录

- **WHEN** 已认证用户提交 PUT /api/emotion/records/:id，body 为 { emotionType: "快乐", emotionIntensity: 4.5 }
- **THEN** 系统返回 200，data 中 emotionType="快乐"、emotionIntensity=4.5，其他字段不变

#### Scenario: 软删除情绪记录

- **WHEN** 已认证用户提交 DELETE /api/emotion/records/:id，该记录属于该用户
- **THEN** 系统返回 200，success: true；后续查询返回 404；数据库 deleted_at 不为 NULL

#### Scenario: 指定记录日期创建

- **WHEN** 已认证用户提交 POST /api/emotion/records，body 包含 recordDate="2026-04-25"
- **THEN** 系统返回 201，data.recordDate="2026-04-25"

### Requirement: 情绪记录双 ID 设计

系统 SHALL 为每条记录生成两个 ID：内部自增 id（数据库主键）和外部 recordId(UUID)。对外 API MUST 只暴露 recordId，不暴露内部 id，防止 ID 被遍历。

#### Scenario: 创建记录返回 recordId 不返回内部 id

- **WHEN** 已认证用户创建一条情绪记录
- **THEN** 返回数据包含 recordId(UUID 格式)，不包含内部自增 id 字段

### Requirement: 情绪记录前端表单

前端 SHALL 提供三要素录入表单：事件文本域、情绪类型下拉（14 种）、情绪强度滑块（1-5 步长 0.01）、需求文本域。用户点击 AI 识别按钮时 MUST 调用 /api/ai/recognize 并展示建议。

#### Scenario: 填写并保存情绪记录

- **WHEN** 用户在 /emotion/new 填写事件、选择情绪类型、拖动强度滑块、填写需求后点击保存
- **THEN** 成功创建记录并跳转到 /emotion

#### Scenario: AI 识别建议可采纳

- **WHEN** 用户填写事件和需求后点击「AI 识别」按钮，AI 返回 { emotionType: "悲伤", intensity: 4.2 }
- **THEN** 表单显示"AI 建议: 😔 悲伤 (强度 4.2)"和「采纳」按钮；点击采纳后 emotionType 和 emotionIntensity 自动填充

#### Scenario: AI 不可用时不阻塞保存

- **WHEN** 用户点击「AI 识别」按钮但 AI 服务不可用
- **THEN** 按钮显示"暂不可用"；用户仍可手动选择情绪类型和强度并成功保存

#### Scenario: 编辑已有情绪记录

- **WHEN** 用户访问 /emotion/[id]，该记录已存在
- **THEN** 表单自动填充该记录的事件、情绪类型、强度、需求；修改后可保存更新

### Requirement: 情绪记录列表页

前端 SHALL 在 /emotion 展示当前用户的情绪记录列表，按记录日期降序，支持分页。

#### Scenario: 列表展示

- **WHEN** 用户访问 /emotion，有 15 条记录
- **THEN** 列表显示每条记录的日期、情绪类型、强度、事件摘要；按日期降序；底部有分页控件

#### Scenario: 空状态

- **WHEN** 用户访问 /emotion，无记录
- **THEN** 显示"还没有情绪记录"和「去记录」按钮，点击跳转 /emotion/new
