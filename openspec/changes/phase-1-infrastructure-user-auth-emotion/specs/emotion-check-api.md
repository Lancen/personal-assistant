# API规格：情绪健康检测模块

## 基础信息

- **基础路径**: `/api/emotion-check`
- **认证**: 需要认证

---

## 数据结构

### EmotionQuestion

```typescript
{
  id: number;
  dimension: string;
  questionText: string;
}
```

六个维度：`精力水平`, `情绪稳定性`, `愉悦感`, `压力水平`, `睡眠质量`, `自信心`

### EmotionDailyCheck

```typescript
{
  id: number;
  userId: string;
  checkDate: string;
  totalScore: number;
  isBelowThreshold: boolean;
  questions: Array<{
    questionId: number;
    questionText: string;
    dimension: string;
    score: number;
  }>;
  createdAt: string;
}
```

---

## 接口列表

### GET /api/emotion-check/status

获取今日检测状态，检查用户今天是否已经完成检测。

**响应**:
```json
{
  "success": true,
  "data": {
    "alreadyCompleted": boolean,
    "existingCheck": EmotionDailyCheck | null
  }
}
```

---

### POST /api/emotion-check/generate

生成今日检测题目，从问题池中动态抽取10题（每个维度至少1题）。

**响应**:
```json
{
  "success": true,
  "data": {
    "questions": EmotionQuestion[]  // 长度 = 10
  }
}
```

抽题逻辑：
1. 六个维度各抽1题（共6题）
2. 根据用户近期情绪数据，在情绪异常维度多抽
3. 剩余随机抽取凑够10题

---

### POST /api/emotion-check/submit

提交检测答案，计算总分和判断是否低于阈值。

**请求体**:
```json
{
  "answers": [
    {
      "questionId": "number",
      "score": "number (1-5)"
    }
  ]
}
```
- answers 长度必须是 10

**响应**:
```json
{
  "success": true,
  "data": {
    "check": EmotionDailyCheck,
    "threshold": number,  // 默认阈值 25
    "message": string  // 提示信息
  }
}
```

如果总分低于阈值，返回提醒信息："你当前情绪状态偏低，建议今天不做重大决策"

---

### GET /api/emotion-check/history

获取历史检测记录列表。

**查询参数**:
- `page`: 页码，默认 1
- `pageSize`: 每页条数，默认 20

**响应**:
```json
{
  "success": true,
  "data": [EmotionDailyCheck],
  "pagination": { ... }
}
```

---

### GET /api/emotion-check/analysis

获取多周期分析数据。

**查询参数**:
- `period`: `day` | `week` | `month` | `quarter`

**响应**:
```json
{
  "success": true,
  "data": {
    trendData: Array<{
      date: string;
      score: number;
    }>;
    emotionDistribution: Array<{
      emotion: string;
      count: number;
      percentage: number;
    }>;
    aiSummary: {
      commonTriggers: string[];
      conclusion: string;
      suggestions: string[];
    };
  }
}
```

`trendData` 是按日期排序的得分趋势，用于绘制折线图。
