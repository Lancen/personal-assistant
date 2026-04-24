import { test, expect } from '@playwright/test';

test.describe('登录流程和仪表盘页面测试', () => {
  test('登录成功后跳转到仪表盘，仪表盘正常显示 (PC端布局)', async ({ page }) => {
    // 设置 PC 端视窗宽度，确保 md 断点生效 (>= 768px)
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. 访问登录页
    await page.goto('/login');

    // 2. 验证登录页标题正确
    await expect(page).toHaveTitle(/Personal Assistant/);

    // 3. 输入邮箱和密码
    await page.getByLabel('邮箱').fill('longlieyan0@163.com');
    await page.getByLabel('密码').fill('lcz123123');

    // 4. 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click();

    // 5. 验证成功跳转到仪表盘
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // 6. 验证仪表盘标题正确显示
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();

    // 7. 验证欢迎文本显示
    await expect(page.getByText('欢迎回来，查看你的近期状态')).toBeVisible();

    // 8. PC端布局验证 - 侧边栏应该可见 (md 断点 >= 768px)
    // 现在使用自定义 CSS 类 .sidebar-layout
    const sidebar = page.locator('div.sidebar-layout').first();

    // 调试：获取 outerHTML 确认类名正确
    const html = await sidebar.evaluate(el => el.outerHTML);
    console.log('Sidebar outerHTML:', html);

    // 调试：打印当前视窗宽度和元素 computed display 值
    const viewportSize = page.viewportSize();
    const display = await sidebar.evaluate(el => getComputedStyle(el).display);
    console.log(`Viewport: ${viewportSize?.width}x${viewportSize?.height}`);
    console.log(`Sidebar computed display: ${display}`);

    // 获取所有样式表文本检查是否包含 md:block 规则
    const hasMdBlockRule = await page.evaluate(() => {
      let found = false;
      for (const sheet of document.styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('min-width') && rule.conditionText.includes('768px')) {
              if (rule.cssText.includes('.md:block')) {
                found = true;
                console.log('Found md:block rule:', rule.cssText.slice(0, 100));
              }
            }
          }
        } catch {}
      }
      return found;
    });
    console.log(`Found @media (min-width: 768px) containing .md:block: ${hasMdBlockRule}`);

    // 也检查一下 document.styleSheets 总数
    const sheetCount = await page.evaluate(() => document.styleSheets.length);
    console.log(`Total styleSheets: ${sheetCount}`);

    // 打印出所有 md 相关规则帮助调试
    await page.evaluate(() => {
      console.log('=== All media rules containing md ===');
      for (const sheet of document.styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE && rule.cssText.includes('md')) {
              console.log('Media rule:', rule.conditionText);
            }
          }
        } catch {}
      }
    });

    await expect(sidebar).toBeVisible();

    // 9. 如果有"今日还未完成情绪检测"提示，验证它可见
    const uncompletedCheck = page.getByText('今日还未完成情绪检测');
    if (await uncompletedCheck.isVisible()) {
      await expect(uncompletedCheck).toBeVisible();
      await expect(page.getByRole('link', { name: '去检测' })).toBeVisible();
    }

    // 10. 验证统计卡片区域显示
    await expect(page.getByText('今日情绪检测')).toBeVisible();
    await expect(page.getByText('情绪记录')).toBeVisible();

    // 11. 验证最近记录区域显示（精确匹配标题）
    await expect(page.getByRole('heading', { name: '最近记录' })).toBeVisible();

    // 12. 截图保存（完整页面）
    await page.screenshot({ path: 'e2e/screenshots/dashboard-pc.png', fullPage: true });

    // 13. 截图保存（只截图可见区域，显示布局）
    await page.screenshot({ path: 'e2e/screenshots/dashboard-pc-viewport.png', fullPage: false });

    console.log('✓ 测试完成：登录成功，PC端布局正确，仪表盘正常显示');
  });

  test('未登录访问仪表盘自动跳转登录页 (移动端视窗)', async ({ page }) => {
    // 设置移动端视窗宽度 (< 768px)
    await page.setViewportSize({ width: 375, height: 667 });

    // 直接访问仪表盘
    await page.goto('/dashboard');

    // 应该自动跳转到登录页
    await page.waitForURL('/login');
    await expect(page).toHaveURL(/\/login/);

    // 登录表单可见
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();
  });
});
