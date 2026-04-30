import { test, expect } from '@playwright/test';

test.describe('V-5: Dashboard 与导航 E2E 验收', () => {
  test('V-5.1 V-5.2 V-5.3 Dashboard 统计卡片、情绪入口、侧边栏导航 (PC端)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 开发模式自动登录，直接访问 dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 验证仪表盘标题
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();

    // V-5.1 统计卡片存在（标题可见即可，数据依赖 CORS）
    await expect(page.getByText('今日任务完成')).toBeVisible();
    await expect(page.getByText('知识笔记').first()).toBeVisible();
    await expect(page.getByText('情绪记录').first()).toBeVisible();

    // V-5.2 情绪卡片 — 检测入口
    await expect(page.getByText('情绪状态')).toBeVisible();
    await expect(page.getByRole('link', { name: /点击完成今日检测|去检测/ })).toBeVisible();

    // V-5.3 侧边栏导航 — 验证顺序和存在性
    const navLinks = page.locator('nav a');
    const expectedOrder = ['仪表盘', '情绪日记', '任务管理', '知识笔记', '日历', '设置'];

    for (let i = 0; i < expectedOrder.length; i++) {
      const link = navLinks.nth(i);
      await expect(link).toContainText(expectedOrder[i]);
    }

    // 导航链接目标正确
    await expect(page.getByRole('link', { name: '仪表盘' })).toHaveAttribute('href', '/dashboard');
    await expect(page.getByRole('link', { name: '情绪日记' })).toHaveAttribute('href', '/emotion');

    // 截图
    await page.screenshot({ path: 'e2e/screenshots/dashboard-pc.png', fullPage: true });
  });

  test('情绪检测入口跳转正确', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 点击"点击完成今日检测"链接
    const checkLink = page.getByRole('link', { name: /点击完成今日检测|去检测/ });
    if (await checkLink.isVisible()) {
      await checkLink.click();
      await expect(page).toHaveURL(/\/emotion\/check/);
    }
  });
});
