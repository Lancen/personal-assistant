## ADDED Requirements

### Requirement: 情绪记录三要素结构化存储

系统 SHALL 允许已认证用户创建、查看、编辑、删除情绪记录。每条记录 MUST 包含三要素：事件（event）、情绪类型（emotionType）、情绪强度（emotionIntensity）、需求（need）。所有记录 MUST 通过 user_id 实现用户间数据隔离。

#### Scenario: 用户创建情绪记录成功

- **GIVEN** 用户已登录，且请求体包含有效的 event、emotionType、emotionIntensity（1-5）、need
- **WHEN** 用户提交 POST /api/emotion/records
- **THEN** 系统返回 201，响应包含 success: true 和完整的记录数据（包含自动生成的 recordId 和 recordDate 默认为当天）

#### Scenario: 创建记录时 emotionIntensity 超出范围

- **GIVEN** 用户已登录，emotionIntensity 值为 6（超出 1-5 范围）
- **WHEN** 用户提交 POST /api/emotion/records
- **THEN** 系统返回 400，响应包含 success: false 和错误描述"情绪强度必须在1-5之间"

#### Scenario: 创建记录时缺少必填字段

- **GIVEN** 用户已登录，请求体缺少 need 字段
- **WHEN** 用户提交 POST /api/emotion/records
- **THEN** 系统返回 400，响应包含 success: false 和错误描述"需求描述不能为空"

#### Scenario: 未登录用户创建记录

- **GIVEN** 请求未携带 Authorization header
- **WHEN** 用户提交 POST /api/emotion/records
- **THEN** 系统返回 401，响应包含 success: false 和错误描述"未授权，请先登录"

#### Scenario: 用户获取自己的情绪记录列表

- **GIVEN** 用户已登录，该用户有 25 条情绪记录
- **WHEN** 用户请求 GET /api/emotion/records?page=1&pageSize=20
- **THEN** 系统返回 200，data 数组包含 20 条记录，pagination.total 为 25，pagination.hasNext 为 true

#### Scenario: 用户获取情绪记录列表按日期降序排列

- **GIVEN** 用户已登录，有记录日期分别为 2026-04-26、2026-04-28、2026-04-27 的三条记录
- **WHEN** 用户请求 GET /api/emotion/records
- **THEN** 系统返回 200，data 数组中记录顺序为 2026-04-28、2026-04-27、2026-04-26

#### Scenario: 用户获取单条情绪记录

- **GIVEN** 用户已登录，存在属于该用户的 recordId 为 "abc-123" 的记录
- **WHEN** 用户请求 GET /api/emotion/records/abc-123
- **THEN** 系统返回 200，data 包含该条完整记录

#### Scenario: 用户访问不属于自己的情绪记录

- **GIVEN** 用户 A 已登录，recordId "xyz-789" 属于用户 B
- **WHEN** 用户 A 请求 GET /api/emotion/records/xyz-789
- **THEN** 系统返回 404，响应包含 success: false 和错误描述"记录不存在"

#### Scenario: 用户更新情绪记录

- **GIVEN** 用户已登录，存在属于该用户的 recordId 为 "abc-123" 的记录
- **WHEN** 用户提交 PUT /api/emotion/records/abc-123，body 为 { "emotionType": "快乐", "emotionIntensity": 4.5 }
- **THEN** 系统返回 200，data 中 emotionType 为 "快乐"，emotionIntensity 为 4.5，其他字段保持不变

#### Scenario: 用户软删除情绪记录

- **GIVEN** 用户已登录，存在属于该用户的 recordId 为 "abc-123" 的记录
- **WHEN** 用户提交 DELETE /api/emotion/records/abc-123
- **THEN** 系统返回 200，success: true；后续查询该记录返回 404；数据库中该记录 deleted_at 不为 NULL

#### Scenario: 用户指定记录日期创建记录

- **GIVEN** 用户已登录，请求体包含 recordDate 为 "2026-04-25"
- **WHEN** 用户提交 POST /api/emotion/records
- **THEN** 系统返回 201，data 中 recordDate 为 "2026-04-25"

### Requirement: 情绪记录双 ID 设计

系统 SHALL 为每条情绪记录生成两个 ID：内部自增 id（数据库主键）和外部 recordId（UUID 字符串）。对外 API MUST 只暴露 recordId，不暴露内部 id，防止 ID 被遍历。

#### Scenario: 创建记录时自动生成 recordId

- **GIVEN** 用户已登录
- **WHEN** 用户创建一条情绪记录
- **THEN** 返回的数据中包含 recordId 字段，值为 UUID 格式的字符串，且不包含内部自增 id 字段

### Requirement: 情绪记录前端表单

前端 SHALL 提供情绪记录的三要素录入表单，包含：事件文本域、情绪类型下拉选择、情绪强度滑块（1-5，步长 0.01，保留两位小数）、需求文本域。用户点击 AI 识别按钮时，MUST 调用 AI 情绪识别接口并展示建议结果。

#### Scenario: 用户填写并保存情绪记录

- **GIVEN** 用户在 /emotion/new 页面
- **WHEN** 用户填写事件"今天开会被批评"、选择情绪类型"焦虑"、拖动强度滑块到 3.5、填写需求"希望被理解"
- **THEN** 表单中各字段正确显示用户输入的值；点击保存后成功创建记录并跳转到 /emotion

#### Scenario: AI 识别建议可被采纳

- **GIVEN** 用户已填写事件和需求，AI 服务可用，用户设置中已配置 API Key
- **WHEN** 用户点击「AI 识别」按钮
- **THEN** 系统调用 POST /api/ai/recognize，返回后在表单中显示「AI 建议: 😔 悲伤 (强度 4.2)」，用户点击「采纳」后 emotionType 和 emotionIntensity 自动填充

#### Scenario: AI 识别服务不可用时不阻塞保存

- **GIVEN** 用户已填写事件和需求，AI 服务不可用
- **WHEN** 用户点击「AI 识别」按钮
- **THEN** 按钮显示「暂不可用」；用户仍可手动选择情绪类型和强度并成功保存记录

#### Scenario: 编辑已有情绪记录

- **GIVEN** 用户在 /emotion/[id] 页面，该记录已存在
- **WHEN** 页面加载
- **THEN** 表单自动填充该记录的事件、情绪类型、强度、需求字段；用户修改后点击保存成功更新

### Requirement: 情绪记录列表页

前端 SHALL 在 /emotion 页面展示当前用户的情绪记录列表，按记录日期降序排列，支持分页。

#### Scenario: 情绪记录列表展示

- **GIVEN** 用户已登录，有 15 条情绪记录
- **WHEN** 用户访问 /emotion 页面
- **THEN** 页面显示情绪记录列表，每条显示日期、情绪类型、强度、事件摘要；列表按日期降序排列；底部有分页控件

#### Scenario: 空状态展示

- **GIVEN** 用户已登录，没有情绪记录
- **WHEN** 用户访问 /emotion 页面
- **THEN** 页面显示空状态提示"还没有情绪记录"和「去记录」按钮，点击跳转 /emotion/new
