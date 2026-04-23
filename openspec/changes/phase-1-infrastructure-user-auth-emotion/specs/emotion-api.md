# API规格：情绪日记模块

## 基础信息

- **基础路径**: `/api/emotion`
- **认证**: 需要认证
- **数据隔离**: 所有数据按 `user_id` 隔离

---

## 数据结构

### EmotionRecord

```typescript
{
  id: string;
  userId: string;
  event: string;          // 事件描述
  emotionType: string;    // 情绪类型
  emotionIntensity: number;  // 1-5，保留两位小数
  need: string;           // 需求描述
  aiRecognizedEmotion?: string;   // AI识别结果
  aiRecognizedIntensity?: number; // AI识别强度
  recordDate: string;     // YYYY-MM-DD
  createdAt: string;      // ISO时间
  updatedAt: string;      // ISO时间
}
```

---

## 接口列表

### GET /api/emotion/records

获取情绪记录列表（分页）。

**查询参数**:
- `page` (optional): 页码，默认 1
- `pageSize` (optional): 每页条数，默认 20
- `startDate` (optional): 开始日期过滤
- `endDate` (optional): 结束日期过滤

**响应**:
```json
{
  "success": true,
  "data": [EmotionRecord],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /api/emotion/records/:id

获取单条情绪记录详情。

**响应**:
```json
{
  "success": true,
  "data": {
    "record": EmotionRecord
  }
}
```

---

### POST /api/emotion/records

创建情绪记录。

**请求体**:
```json
{
  "event": "string",
  "emotionType": "string",
  "emotionIntensity": "number",
  "need": "string",
  "aiRecognizedEmotion": "string (optional)",
  "aiRecognizedIntensity": "number (optional)",
  "recordDate": "string (YYYY-MM-DD, optional, 默认今天)"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "record": EmotionRecord
  }
}
```

---

### PUT /api/emotion/records/:id

更新情绪记录。

**请求体**: 同创建，所有字段可选

**响应**:
```json
{
  "success": true,
  "data": {
    "record": EmotionRecord
  }
}
```

---

### DELETE /api/emotion/records/:id

删除情绪记录。

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```

---

### POST /api/emotion/recognize

AI识别情绪（输入文本，返回识别结果）。

**请求体**:
```json
{
  "text": "string"  // 用户输入的事件文本
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "emotionType": "string",   // 识别出的情绪类型
    "intensity": "number"      // 1-5 强度
  }
}
```

情绪类型可选值：`快乐`, `平静`, `兴奋`, `焦虑`, `紧张`, `悲伤`, `愤怒`, `沮丧`, `惊讶`, `厌恶`
