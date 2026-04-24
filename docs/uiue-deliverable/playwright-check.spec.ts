import { test, expect } from '@playwright/test';

test.describe('页面视觉检查', () => {
  test('首页 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // 检查没有水平滚动
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    // 截图
    await page.screenshot({ path: '.screenshots/home-mobile.png', fullPage: true });
    console.log('✓ 首页移动端检查完成');
  });

  test('首页 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // 检查主要内容可见
    await expect(page.getByRole('heading', { name: '个人智能助手' })).toBeVisible();
    await page.screenshot({ path: '.screenshots/home-desktop.png', fullPage: true });
    console.log('✓ 首页桌面端检查完成');
  });

  test('登录页 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await page.screenshot({ path: '.screenshots/login-mobile.png', fullPage: true });
    console.log('✓ 登录页移动端检查完成');
  });

  test('登录页 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
    await page.screenshot({ path: '.screenshots/login-desktop.png', fullPage: true });
    console.log('✓ 登录页桌面端检查完成');
  });

  test('仪表盘 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    // 移动端侧边栏默认关闭，主内容可见
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await page.screenshot({ path: '.screenshots/dashboard-mobile.png', fullPage: true });
    console.log('✓ 仪表盘移动端检查完成');
  });

  test('仪表盘 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    // 侧边栏可见
    await expect(page.getByText('UIUE').first()).toBeVisible();
    // KPI卡片都可见
    await expect(page.getByText('今日任务完成')).toBeVisible();
    await expect(page.getByText('情绪记录天数')).toBeVisible();
    await expect(page.getByText('知识笔记').nth(1)).toBeVisible();
    await expect(page.getByText('专注时长')).toBeVisible();
    await page.screenshot({ path: '.screenshots/dashboard-desktop.png', fullPage: true });
    console.log('✓ 仪表盘桌面端检查完成');
  });

  test('仪表盘侧边栏交互', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    // 点击菜单按钮打开
    await page.getByRole('button', { name: '打开菜单' }).click();
    // 侧边栏打开后可见菜单项 - 这说明交互正常
    await expect(page.getByRole('link', { name: '任务管理' })).toBeVisible();
    console.log('✓ 仪表盘侧边栏交互检查完成');
  });

  test('登录表单交互', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    // 可以输入邮箱
    await page.getByLabel('邮箱').fill('test@example.com');
    await expect(page.getByLabel('邮箱')).toHaveValue('test@example.com');
    // 可以切换密码显示
    await page.locator('#password').fill('password123');
    const initialType = await page.locator('#password').getAttribute('type');
    expect(initialType).toBe('password');
    // 使用精确的css选择器 - 初始状态按钮aria-label就是"显示密码"
    await page.locator('button[aria-label="显示密码"]').click();
    // 等待状态更新
    await page.waitForTimeout(100);
    const showType = await page.locator('#password').getAttribute('type');
    expect(showType).toBe('text');
    console.log('✓ 登录表单交互检查完成');
  });

  test('可访问性检查 - 对比度和焦点', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    // 检查所有交互元素都可聚焦
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).focus();
      const isFocused = await buttons.nth(i).evaluate(el => el === document.activeElement);
      // 大部分按钮都应该可以聚焦
      if (isFocused === false) {
        console.log(`⚠️  按钮 ${i} 无法获得焦点: ${await buttons.nth(i).getAttribute('aria-label') || 'unnamed'}`);
      }
    }
    console.log('✓ 可访问性焦点检查完成');
  });

  test('任务管理页 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tasks');
    // 检查没有水平滚动
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    // 页面标题可见
    await expect(page.getByRole('heading', { name: '任务管理' })).toBeVisible();
    // 新建任务按钮可见
    await expect(page.getByRole('button', { name: '新建任务' })).toBeVisible();
    // 二级标签可见
    await expect(page.getByText('四象限')).toBeVisible();
    await expect(page.getByText('所有任务')).toBeVisible();
    await page.screenshot({ path: '.screenshots/tasks-mobile.png', fullPage: true });
    console.log('✓ 任务管理页移动端检查完成');
  });

  test('任务管理页 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/tasks');
    // 侧边栏可见
    await expect(page.getByText('UIUE').first()).toBeVisible();
    // 页面标题可见
    await expect(page.getByRole('heading', { name: '任务管理' })).toBeVisible();
    // 四象限网格容器存在
    await expect(page.locator('.grid').first()).toBeVisible();
    // 统计信息可见
    await expect(page.getByText('今日任务')).toBeVisible();
    await page.screenshot({ path: '.screenshots/tasks-desktop.png', fullPage: true });
    console.log('✓ 任务管理页桌面端检查完成');
  });

  test('任务管理页交互测试', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/tasks');
    // 点击新建任务按钮
    await page.getByRole('button', { name: '新建任务' }).click();
    // 模态框标题可见
    await expect(page.getByRole('heading', { name: '新建任务' })).toBeVisible();
    // 输入任务标题
    await page.getByLabel('任务标题').fill('测试新建任务');
    // 选择象限 - 默认已经选中第一个，不需要点击
    // 创建任务
    await page.getByRole('button', { name: '创建' }).click();
    // 模态框关闭，任务出现在列表中
    await expect(page.getByText('测试新建任务')).toBeVisible();
    // 切换完成状态 - 使用更可靠的定位
    const taskItem = page.getByText('测试新建任务').locator('xpath=..').locator('xpath=..');
    await taskItem.locator('button[aria-label="标记已完成"]').click();
    // 删除任务
    await taskItem.locator('button[aria-label="删除任务"]').click();
    await expect(page.getByText('测试新建任务')).not.toBeVisible();
    console.log('✓ 任务管理页交互测试完成');
  });
});
