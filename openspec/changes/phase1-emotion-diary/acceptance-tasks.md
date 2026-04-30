## 验收任务 — 基于 proposal.md AC-1 ~ AC-6

> 前置依赖：V-0 全部完成后才能执行 V-1 ~ V-6

### V-0: 测试基础设施搭建

- [x] V-0.1 后端安装 Vitest + supertest，配置 `packages/backend/vitest.config.ts`，添加 test 脚本
- [x] V-0.2 后端配置测试数据库连接 + 事务回滚辅助工具（beforeAll 开事务 / afterAll 回滚）
- [x] V-0.3 前端安装 Vitest + @testing-library/react + jsdom 环境
- [x] V-0.4 前端配置 `packages/frontend/vitest.config.ts` + setup 文件，添加 test 脚本

### V-1: AC-1 情绪记录 CRUD

- [x] V-1.1 创建成功 — POST /api/emotion/records 提交有效三要素 → 201 + recordId(UUID) + recordDate(当天)
- [x] V-1.2 强度越界 — emotionIntensity=6 → 400 "情绪强度必须在1-5之间"
- [x] V-1.3 未登录 — 无 Authorization header → 401
- [x] V-1.4 数据隔离 — 用户A访问用户B的记录 → 404
- [x] V-1.5 分页列表 — 25条数据，page=1&pageSize=20 → 20条 + total=25 + recordDate降序
- [x] V-1.6 更新与软删除 — PUT 更新成功 + DELETE 软删除后 GET 返回 404

### V-2: AC-2 情绪健康检测

- [x] V-2.1 首次出题 — POST /api/emotion-check/generate → 10题 + 每维度≥1题
- [x] V-2.2 重复出题幂等 — 再次 generate → 返回相同题目
- [x] V-2.3 低分提交 — 总分20<阈值25 → isBelowThreshold=true + suggestion 包含"建议今天不做重大决策"
- [x] V-2.4 评分越界 — 某题评分=6 → 400 "评分必须在1-5之间"

### V-3: AC-3 AI 情绪识别（全部 mock）

- [x] V-3.1 智谱AI识别 — mock zhipuProvider → 返回 { emotionType, intensity, confidence }
- [x] V-3.2 DeepSeek识别 — aiProvider="deepseek"，mock deepseekProvider → 返回识别结果
- [x] V-3.3 未配置API Key → 403 "请先在设置中配置 AI API Key"
- [x] V-3.4 超时 — mock 30s+ 延迟 → 503 "AI 服务暂时不可用"
- [x] V-3.5 前端降级 — AI 不可用时按钮显示"暂不可用"，用户仍可手动选择情绪并保存

### V-4: AC-4 用户设置与 API Key 加密

- [x] V-4.1 默认值 — GET /api/settings → { aiProvider:"zhipu", aiModel:"glm-4", hasApiKey:false, emotionThreshold:25 }
- [x] V-4.2 API Key 加密 — PUT 含 apiKey → 数据库存 AES-256-GCM 密文；GET hasApiKey=true，不返回明文
- [x] V-4.3 ENCRYPTION_KEY 缺失 — 保存 API Key → 500 "加密服务未配置"
- [x] V-4.4 测试连接 — POST /api/settings/test-ai，mock AI Provider → 返回成功提示

### V-5: AC-5 Dashboard 与导航（Playwright E2E）

- [x] V-5.1 Dashboard 统计卡片 — 显示真实 API 数据（非硬编码），验证任务/笔记/情绪记录数
- [x] V-5.2 情绪卡片 — 今日未完成检测时显示"点击完成今日检测"入口
- [x] V-5.3 侧边栏导航 — 顺序为：仪表盘、情绪日记、任务管理、知识笔记、日历、设置

### V-6: AC-6 性能指标（自动化断言）

- [x] V-6.1 后端 CRUD API — Vitest 计时，expect(elapsed).toBeLessThan(500)
- [x] V-6.2 后端 AI 识别超时 — mock 验证 30s 超时阈值逻辑
- [x] V-6.3 前端翻页 — Playwright 计时，页面切换 < 1s
