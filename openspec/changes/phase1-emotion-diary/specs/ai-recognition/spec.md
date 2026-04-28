## ADDED Requirements

### Requirement: AI 情绪识别接口

系统 SHALL 提供情绪识别 API，接收用户文本，调用 LLM 返回情绪类型、强度和置信度。AI 识别为可选辅助功能，MUST NOT 阻塞情绪记录的正常创建。

#### Scenario: 智谱 AI 成功识别

- **WHEN** 已认证用户（aiProvider="zhipu"，有效 API Key）提交 POST /api/ai/recognize，body 为 { text: "今天开会被人批评了" }
- **THEN** 返回 200，data 含 emotionType、intensity(1-5)、confidence(0-1)

#### Scenario: DeepSeek 成功识别

- **WHEN** 已认证用户（aiProvider="deepseek"，有效 API Key）提交 POST /api/ai/recognize
- **THEN** 使用 DeepSeek API 返回相同格式的识别结果

#### Scenario: API Key 未配置

- **WHEN** 已认证用户未配置 API Key（hasApiKey=false）提交 POST /api/ai/recognize
- **THEN** 返回 403，success: false，错误描述"请先在设置中配置 AI API Key"

#### Scenario: AI 服务超时

- **WHEN** 已认证用户调用 POST /api/ai/recognize，LLM API 响应超过 30 秒
- **THEN** 返回 503，success: false，错误描述"AI 服务暂时不可用"

#### Scenario: AI 返回格式异常

- **WHEN** 已认证用户调用 POST /api/ai/recognize，LLM 返回无法解析为 JSON 的内容
- **THEN** 返回 502，success: false，错误描述"AI 响应格式异常"

#### Scenario: API Key 无效

- **WHEN** 已认证用户配置了无效 API Key 后调用 POST /api/ai/recognize
- **THEN** 返回 401，success: false，错误描述"API Key 无效"

### Requirement: AI Provider 统一抽象

系统 SHALL 通过 AIProvider 接口统一抽象不同 LLM 服务商。当前 MUST 支持智谱 AI 和 DeepSeek。根据用户 aiProvider 字段选择 Provider。

#### Scenario: 根据 aiProvider 选择智谱 AI

- **WHEN** 用户设置 aiProvider="zhipu"，系统执行 AI 识别
- **THEN** 使用 ZhipuAIProvider，调用 https://open.bigmodel.cn/api/paas/v4/chat/completions

#### Scenario: 根据 aiProvider 选择 DeepSeek

- **WHEN** 用户设置 aiProvider="deepseek"，系统执行 AI 识别
- **THEN** 使用 DeepSeekAIProvider，调用 https://api.deepseek.com/v1/chat/completions

### Requirement: AI 情绪识别 Prompt 模板

系统 SHALL 使用固定 Prompt 模板。Prompt MUST 包含预定义情绪列表（快乐、满足、平静、期待、感恩、焦虑、悲伤、愤怒、恐惧、厌恶、羞耻、内疚、惊讶、困惑），要求返回 JSON { emotionType, intensity, confidence }。

#### Scenario: Prompt 包含完整情绪列表

- **WHEN** 系统组装 AI 识别请求发送到 LLM
- **THEN** Prompt 中包含 14 种情绪列表和 JSON 格式要求

### Requirement: AI 连接测试

系统 SHALL 允许用户测试 AI 连接，验证 API Key 有效性，MUST NOT 存储测试结果。

#### Scenario: 测试连接成功

- **WHEN** 已认证用户提交 POST /api/settings/test-ai，含有效 provider、model、apiKey
- **THEN** 返回 200，data 为 { success: true, message: "连接测试成功" }

#### Scenario: 测试连接失败

- **WHEN** 已认证用户提交 POST /api/settings/test-ai，含无效 apiKey
- **THEN** 返回 200，data 为 { success: false, message: "API Key 无效或连接失败" }
