import { test, expect } from '@playwright/test';

test.describe('页面视觉检查 - UIUE 设计稿', () => {
  test('首页 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await page.screenshot({ path: 'e2e/screenshots/home-mobile.png', fullPage: true });
    console.log('✓ 首页移动端检查完成');
  });

  test('首页 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '个人智能助手' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/home-desktop.png', fullPage: true });
    console.log('✓ 首页桌面端检查完成');
  });

  test('登录页 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await page.screenshot({ path: 'e2e/screenshots/login-mobile.png', fullPage: true });
    console.log('✓ 登录页移动端检查完成');
  });

  test('登录页 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/login-desktop.png', fullPage: true });
    console.log('✓ 登录页桌面端检查完成');
  });

  test('登录表单交互', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('test@example.com');
    await expect(page.getByLabel('邮箱')).toHaveValue('test@example.com');
    await page.locator('#password').fill('password123');
    const initialType = await page.locator('#password').getAttribute('type');
    expect(initialType).toBe('password');
    await page.locator('button[aria-label="显示密码"]').click();
    await page.waitForTimeout(100);
    const showType = await page.locator('#password').getAttribute('type');
    expect(showType).toBe('text');
    console.log('✓ 登录表单交互检查完成');
  });

  test('仪表盘 - 桌面端 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByText('UIUE').first()).toBeVisible();
    await expect(page.getByText('今日任务完成')).toBeVisible();
    await expect(page.getByText('知识笔记').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/dashboard-desktop.png', fullPage: true });
    console.log('✓ 仪表盘桌面端检查完成');
  });

  test('仪表盘 - 移动端 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await page.screenshot({ path: 'e2e/screenshots/dashboard-mobile.png', fullPage: true });
    console.log('✓ 仪表盘移动端检查完成');
  });

  test('任务管理页 - 桌面端 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/tasks');
    await expect(page.getByRole('heading', { name: '今日任务' })).toBeVisible();
    await expect(page.getByRole('button', { name: '新建任务' })).toBeVisible();
    await expect(page.getByText('四象限')).toBeVisible();
    await expect(page.getByText('所有任务')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/tasks-desktop.png', fullPage: true });
    console.log('✓ 任务管理页桌面端检查完成');
  });

  test('任务管理页 - 移动端 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/tasks');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
    await expect(page.getByRole('button', { name: '新建任务' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/tasks-mobile.png', fullPage: true });
    console.log('✓ 任务管理页移动端检查完成');
  });

  test('任务管理页交互测试 - 创建和删除任务', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/tasks');
    await page.getByRole('button', { name: '新建任务' }).click();
    await expect(page.getByRole('heading', { name: '新建任务' })).toBeVisible();
    await page.getByLabel('任务标题').fill('测试新建任务');
    await page.getByRole('button', { name: '创建' }).click();
    await expect(page.getByText('测试新建任务')).toBeVisible();
    const taskItem = page.getByText('测试新建任务').locator('xpath=..').locator('xpath=..');
    await taskItem.locator('button[aria-label="标记已完成"]').click();
    await taskItem.locator('button[aria-label="删除任务"]').click();
    await expect(page.getByText('测试新建任务')).not.toBeVisible();
    console.log('✓ 任务管理页交互测试完成');
  });

  test('笔记页面 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/notes');
    await expect(page.getByRole('heading', { name: '我的笔记' })).toBeVisible();
    await expect(page.getByRole('button', { name: '新建笔记' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/notes-desktop.png', fullPage: true });
    console.log('✓ 笔记页面检查完成');
  });

  test('日历页面 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: '日历' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/calendar-desktop.png', fullPage: true });
    console.log('✓ 日历页面检查完成');
  });

  test('设置页面 - 登录后访问', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/settings-desktop.png', fullPage: true });
    console.log('✓ 设置页面检查完成');
  });
});
