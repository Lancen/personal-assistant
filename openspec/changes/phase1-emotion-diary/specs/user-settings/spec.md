## ADDED Requirements

### Requirement: 用户设置数据模型

系统 SHALL 为每个用户维护一条设置记录，存储 AI 服务配置和偏好。MUST 支持 upsert 语义。

#### Scenario: 新用户获取默认设置

- **WHEN** 未设置过配置的已认证用户请求 GET /api/settings
- **THEN** 返回 200，data 为 { aiProvider: "zhipu", aiModel: "glm-4", hasApiKey: false, emotionThreshold: 25, notificationEnabled: true }

#### Scenario: 更新 AI 配置

- **WHEN** 已认证用户提交 PUT /api/settings，body 为 { aiProvider: "deepseek", aiModel: "deepseek-chat", apiKey: "sk-xxx" }
- **THEN** 返回 200，success: true；API Key 被加密存储；后续 GET 返回 hasApiKey=true，不返回明文

#### Scenario: 部分更新设置

- **WHEN** 已认证用户（当前 aiProvider="zhipu"）提交 PUT /api/settings，body 仅为 { emotionThreshold: 30 }
- **THEN** 返回 200；aiProvider 仍为 "zhipu"，emotionThreshold 更新为 30

### Requirement: API Key 加密存储

系统 MUST 使用 AES-256-GCM 加密存储 AI API Key。加密密钥从环境变量 ENCRYPTION_KEY 读取。API Key 明文 MUST NOT 出现在任何 API 响应中。

#### Scenario: API Key 加密存储

- **WHEN** 用户提交 apiKey="sk-1234567890abcdef"，ENCRYPTION_KEY 已配置
- **THEN** 数据库 api_key 字段存储 AES-256-GCM 密文（格式 iv:authTag:ciphertext），非明文

#### Scenario: API Key 解密使用

- **WHEN** AI 服务层需要使用已加密存储的 API Key
- **THEN** 系统正确解密密文得到原始明文用于 API 调用

#### Scenario: API Key 不在响应中返回

- **WHEN** 已配置 API Key 的用户请求 GET /api/settings
- **THEN** 响应含 hasApiKey: true，不含 apiKey 或任何可推导字段

#### Scenario: ENCRYPTION_KEY 未配置

- **WHEN** 环境变量 ENCRYPTION_KEY 未设置时用户尝试保存 API Key
- **THEN** 返回 500，success: false，错误描述"加密服务未配置"

### Requirement: 设置管理前端

前端 SHALL 在设置页增加「AI 助手」配置区域：服务商选择、模型选择（联动）、API Key 输入、测试连接按钮、阈值滑块、提醒开关。

#### Scenario: 设置页展示 AI 配置区域

- **WHEN** 已认证用户访问 /settings
- **THEN** 页面显示「AI 助手」分组，含服务商下拉框、模型下拉框、API Key 输入框、测试连接按钮、阈值滑块、提醒开关

#### Scenario: 服务商切换模型联动

- **WHEN** 用户将服务商从"智谱 AI"切换为"DeepSeek"
- **THEN** 模型下拉框选项变为 DeepSeek 模型列表（deepseek-chat、deepseek-reasoner），默认选中第一个

#### Scenario: 保存 AI 配置

- **WHEN** 用户填写 API Key 后点击保存
- **THEN** 调用 PUT /api/settings 成功后显示"保存成功"；API Key 输入框显示占位符"已设置"

#### Scenario: 测试连接成功提示

- **WHEN** 用户填写有效 API Key 后点击「测试连接」
- **THEN** 按钮旁显示"✓ 连接测试成功"绿色提示

#### Scenario: 测试连接失败提示

- **WHEN** 用户填写无效 API Key 后点击「测试连接」
- **THEN** 按钮旁显示"✗ 连接测试失败"红色提示
