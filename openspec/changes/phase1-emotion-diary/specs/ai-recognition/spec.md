## ADDED Requirements

### Requirement: AI 情绪识别接口

系统 SHALL 提供情绪识别 API，接收用户文本输入，调用 LLM 返回情绪类型、强度和置信度。AI 识别为可选辅助功能，MUST NOT 阻塞情绪记录的正常创建流程。

#### Scenario: AI 成功识别情绪

- **GIVEN** 用户已登录，用户设置中已配置 AI provider 为 "zhipu"、model 为 "glm-4"、有效的 API Key
- **WHEN** 用户提交 POST /api/ai/recognize，body 为 { text: "今天开会被人批评了，心里很不好受，希望被人理解" }
- **THEN** 系统返回 200，data 包含 emotionType（如"悲伤"）、intensity（1-5 数字）、confidence（0-1 数字）

#### Scenario: 使用 DeepSeek 模型识别情绪

- **GIVEN** 用户已登录，用户设置中已配置 AI provider 为 "deepseek"、model 为 "deepseek-chat"、有效的 API Key
- **WHEN** 用户提交 POST /api/ai/recognize
- **THEN** 系统使用 DeepSeek API 完成识别，返回格式与智谱 AI 相同

#### Scenario: AI API Key 未配置

- **GIVEN** 用户已登录，用户设置中未配置 API Key（hasApiKey 为 false）
- **WHEN** 用户提交 POST /api/ai/recognize
- **THEN** 系统返回 403，响应包含 success: false 和错误描述"请先在设置中配置 AI API Key"

#### Scenario: AI 服务超时

- **GIVEN** 用户已登录，AI 配置正确，但 LLM API 响应超过 30 秒
- **WHEN** 用户提交 POST /api/ai/recognize
- **THEN** 系统返回 503，响应包含 success: false 和错误描述"AI 服务暂时不可用"

#### Scenario: AI 返回格式异常

- **GIVEN** 用户已登录，AI 配置正确，但 LLM 返回的内容无法解析为 JSON
- **WHEN** 用户提交 POST /api/ai/recognize
- **THEN** 系统返回 502，响应包含 success: false 和错误描述"AI 响应格式异常"

#### Scenario: AI API Key 无效

- **GIVEN** 用户已登录，用户设置中配置了无效的 API Key
- **WHEN** 用户提交 POST /api/ai/recognize
- **THEN** 系统返回 401，响应包含 success: false 和错误描述"API Key 无效"

### Requirement: AI Provider 统一抽象

系统 SHALL 通过 AIProvider 接口统一抽象不同的 LLM 服务商。当前 MUST 支持智谱 AI 和 DeepSeek 两个 Provider。根据用户设置中的 aiProvider 字段选择对应 Provider。

#### Scenario: 根据 aiProvider 选择智谱 AI

- **GIVEN** 用户设置中 aiProvider 为 "zhipu"
- **WHEN** 系统执行 AI 识别
- **THEN** 系统使用 ZhipuAIProvider，调用智谱 API 端点 https://open.bigmodel.cn/api/paas/v4/chat/completions

#### Scenario: 根据 aiProvider 选择 DeepSeek

- **GIVEN** 用户设置中 aiProvider 为 "deepseek"
- **WHEN** 系统执行 AI 识别
- **THEN** 系统使用 DeepSeekAIProvider，调用 DeepSeek API 端点 https://api.deepseek.com/v1/chat/completions

### Requirement: AI 情绪识别 Prompt 模板

系统 SHALL 使用固定 Prompt 模板调用 LLM。Prompt MUST 要求模型从预定义情绪列表中选择一个，给出 1-5 强度评分和 0-1 置信度，并以 JSON 格式返回。

#### Scenario: Prompt 包含完整情绪列表

- **GIVEN** 系统组装 AI 识别请求
- **WHEN** Prompt 被发送到 LLM
- **THEN** Prompt 中包含情绪列表：快乐、满足、平静、期待、感恩、焦虑、悲伤、愤怒、恐惧、厌恶、羞耻、内疚、惊讶、困惑；要求返回 JSON 格式 {"emotionType": "", "intensity": 0, "confidence": 0}

### Requirement: AI 连接测试

系统 SHALL 允许用户测试 AI 服务连接，验证 API Key 有效性，MUST NOT 存储测试请求的结果。

#### Scenario: 测试连接成功

- **GIVEN** 用户已登录，请求体包含 provider "zhipu"、model "glm-4"、有效的 apiKey
- **WHEN** 用户提交 POST /api/settings/test-ai
- **THEN** 系统返回 200，data 为 { success: true, message: "连接测试成功" }

#### Scenario: 测试连接失败

- **GIVEN** 用户已登录，请求体包含无效的 apiKey
- **WHEN** 用户提交 POST /api/settings/test-ai
- **THEN** 系统返回 200，data 为 { success: false, message: "API Key 无效或连接失败" }
