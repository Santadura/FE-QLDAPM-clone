import { test, expect } from '@playwright/test';

const roles = {
  cs001: '/cs',
  teacher001: '/teacher',
  tc001: '/tc',
  cm001: '/cm',
  admin: '/admin',
};

for (const [username, route] of Object.entries(roles)) {
  test('seeded login redirects to correct role: ' + username, async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-identifier').fill(username);
    await page.locator('#login-password').fill(process.env.E2E_SEED_PASSWORD || '123456');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(route + '(?:/|$)'));
    await expect(page.locator('nav')).toBeVisible();
  });
}
