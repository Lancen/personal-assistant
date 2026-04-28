## ADDED Requirements

### Requirement: 用户设置数据模型

系统 SHALL 为每个用户维护一条设置记录，存储 AI 服务配置和偏好。设置 MUST 支持 upsert 语义（不存在则创建，存在则更新）。

#### Scenario: 新用户获取默认设置

- **GIVEN** 用户已登录，该用户从未设置过配置
- **WHEN** 用户请求 GET /api/settings
- **THEN** 系统返回 200，data 为默认值：{ aiProvider: "zhipu", aiModel: "glm-4", hasApiKey: false, emotionThreshold: 25, notificationEnabled: true }

#### Scenario: 用户更新 AI 配置

- **GIVEN** 用户已登录
- **WHEN** 用户提交 PUT /api/settings，body 为 { aiProvider: "deepseek", aiModel: "deepseek-chat", apiKey: "sk-xxx" }
- **THEN** 系统返回 200，success: true；API Key 被加密存储；后续 GET /api/settings 返回 hasApiKey 为 true，但不返回 apiKey 明文

#### Scenario: 用户部分更新设置

- **GIVEN** 用户已登录，当前 aiProvider 为 "zhipu"
- **WHEN** 用户提交 PUT /api/settings，body 仅为 { emotionThreshold: 30 }
- **THEN** 系统返回 200，success: true；aiProvider 仍为 "zhipu"，emotionThreshold 更新为 30

### Requirement: API Key 加密存储

系统 MUST 使用 AES-256-GCM 加密算法存储用户的 AI API Key。加密密钥 MUST 从环境变量 ENCRYPTION_KEY 读取。API Key 明文 MUST NOT 出现在任何 API 响应中。

#### Scenario: API Key 加密存储

- **GIVEN** 用户提交 apiKey "sk-1234567890abcdef"，ENCRYPTION_KEY 已配置
- **WHEN** 系统保存设置
- **THEN** 数据库中 api_key 字段存储的是 AES-256-GCM 加密后的密文（格式: iv:authTag:ciphertext），而非 "sk-1234567890abcdef"

#### Scenario: API Key 解密使用

- **GIVEN** 数据库中 api_key 字段存储了加密后的密文
- **WHEN** AI 服务层需要使用该 API Key 调用 LLM
- **THEN** 系统正确解密密文，得到原始 API Key 明文用于 API 调用

#### Scenario: API Key 不在响应中返回

- **GIVEN** 用户已配置 API Key
- **WHEN** 用户请求 GET /api/settings
- **THEN** 响应中包含 hasApiKey: true，但不包含 apiKey 或任何可推导 API Key 的字段

#### Scenario: ENCRYPTION_KEY 未配置

- **GIVEN** 环境变量 ENCRYPTION_KEY 未设置
- **WHEN** 用户尝试保存 API Key
- **THEN** 系统返回 500，响应包含 success: false 和错误描述"加密服务未配置"

### Requirement: 设置管理前端

前端 SHALL 在设置页面增加「AI 助手」配置区域，包含：服务商选择、模型选择、API Key 输入（密码类型）、测试连接按钮、情绪检测阈值滑块、每日提醒开关。

#### Scenario: 设置页展示 AI 配置区域

- **GIVEN** 用户已登录，访问 /settings 页面
- **WHEN** 页面加载完成
- **THEN** 页面中显示「AI 助手」配置分组，包含服务商下拉框、模型下拉框、API Key 输入框、测试连接按钮、阈值滑块、提醒开关

#### Scenario: 用户选择服务商后模型列表联动

- **GIVEN** 用户在设置页面，当前服务商为"智谱 AI"
- **WHEN** 用户将服务商切换为"DeepSeek"
- **THEN** 模型下拉框选项变为 DeepSeek 对应的模型列表（deepseek-chat、deepseek-reasoner），默认选中第一个

#### Scenario: 用户保存 AI 配置成功

- **GIVEN** 用户在设置页面填写了 API Key
- **WHEN** 用户点击保存
- **THEN** 系统调用 PUT /api/settings，成功后显示"保存成功"提示；API Key 输入框显示占位符"已设置"而非明文

#### Scenario: 测试连接成功提示

- **GIVEN** 用户在设置页面填写了 API Key
- **WHEN** 用户点击「测试连接」
- **THEN** 系统调用 POST /api/settings/test-ai，成功后按钮旁显示"✓ 连接测试成功"绿色提示

#### Scenario: 测试连接失败提示

- **GIVEN** 用户在设置页面填写了无效的 API Key
- **WHEN** 用户点击「测试连接」
- **THEN** 按钮旁显示"✗ 连接测试失败"红色提示
