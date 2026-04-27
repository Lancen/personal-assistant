/** @type {import('visual-eyes').EyesConfig} */
const config = {
  // 应用名称
  appName: 'personal-assistant',

  // 测试文件匹配
  testDir: 'e2e',
  testPattern: '**/*.spec.ts',

  // 基线和截图目录
  baselineDir: 'e2e/baseline',
  screenshotDir: 'e2e/screenshots',
  diffDir: 'e2e/diffs',
  reportDir: 'e2e/report',

  // 图片匹配阈值 (0-1)
  // 0 = 完全匹配, 1 = 完全不匹配
  threshold: 0.1,

  // 忽略抗锯齿像素差异
  includeAA: false,

  // 失败时自动生成报告
  autoReport: true,

  // Playwright 浏览器配置
  browsers: ['chromium'],

  // 视口大小
  viewport: {
    width: 1920,
    height: 1080,
  },

  // 全局延迟 (ms) - 确保页面完全渲染
  delayBeforeScreenshot: 1000,

  // 是否在测试失败时停止
  failFast: false,
};

export default config;
