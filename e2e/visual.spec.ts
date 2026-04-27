import { test, expect } from '@playwright/test';
import { createEyes } from 'visual-eyes';

test.describe('UIUE 视觉测试', () => {
  let eyes: Awaited<ReturnType<typeof createEyes>>;

  test.beforeAll(async () => {
    eyes = await createEyes();
  });

  test.afterAll(async () => {
    await eyes.finalizeRun();
  });

  test('首页 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '个人智能助手' })).toBeVisible();

    await eyes.check(page, {
      name: 'home-desktop',
      fullPage: true,
      tags: ['home', 'desktop'],
    });
  });

  test('首页 - 移动端视觉检查', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await eyes.check(page, {
      name: 'home-mobile',
      fullPage: true,
      tags: ['home', 'mobile'],
    });
  });

  test('登录页 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();

    await eyes.check(page, {
      name: 'login-desktop',
      fullPage: true,
      tags: ['login', 'desktop'],
    });
  });

  test('登录页 - 移动端视觉检查', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');

    await eyes.check(page, {
      name: 'login-mobile',
      fullPage: true,
      tags: ['login', 'mobile'],
    });
  });

  test('仪表盘 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByText('UIUE').first()).toBeVisible();

    await eyes.check(page, {
      name: 'dashboard-desktop',
      fullPage: true,
      tags: ['dashboard', 'desktop'],
    });
  });

  test('任务管理 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/tasks');
    await expect(page.getByText('四象限')).toBeVisible();

    await eyes.check(page, {
      name: 'tasks-desktop',
      fullPage: true,
      tags: ['tasks', 'desktop'],
    });
  });

  test('知识笔记 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/notes');
    await expect(page.getByRole('button', { name: '新建笔记' })).toBeVisible();

    await eyes.check(page, {
      name: 'notes-desktop',
      fullPage: true,
      tags: ['notes', 'desktop'],
    });
  });

  test('日历 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: '日历' })).toBeVisible();

    await eyes.check(page, {
      name: 'calendar-desktop',
      fullPage: true,
      tags: ['calendar', 'desktop'],
    });
  });

  test('设置 - 桌面端视觉检查', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.locator('#password').fill('lcz123123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/dashboard');
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();

    await eyes.check(page, {
      name: 'settings-desktop',
      fullPage: true,
      tags: ['settings', 'desktop'],
    });
  });
});
