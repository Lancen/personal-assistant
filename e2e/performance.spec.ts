import { test, expect } from '@playwright/test';

test.describe('V-6: 性能指标 E2E', () => {
  test('V-6.3 情绪日记页面导航 < 1s', async ({ page }) => {
    // 从 dashboard 导航到情绪日记
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const start = Date.now();
    await page.getByRole('link', { name: '情绪日记' }).click();
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
    await expect(page).toHaveURL(/\/emotion/);
  });
});
