import { test, expect } from '@playwright/test';

// Scrollbars are intentionally hidden, but scrolling must still work.
// Uses the actual app and browser, without changing business records.
test('class and student screens retain scrolling with hidden native scrollbars', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#login-identifier').fill('admin');
  await page.locator('#login-password').fill(process.env.E2E_SEED_PASSWORD || '123456');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin(?:\/|$)/);

  async function assertHiddenAndScrollable(selector) {
    const result = await page.locator(selector).first().evaluate((element) => {
      const styles = getComputedStyle(element);
      const webkitStyle = getComputedStyle(element, '::-webkit-scrollbar');
      const placeholder = document.createElement('div');
      placeholder.style.height = '1800px';
      placeholder.style.minHeight = '1800px';
      placeholder.setAttribute('aria-hidden', 'true');
      element.appendChild(placeholder);
      const hasOverflow = element.scrollHeight > element.clientHeight;
      element.scrollTop = 200;
      const scrolled = element.scrollTop > 0;
      element.scrollTop = 0;
      placeholder.remove();
      return {
        scrollbarWidth: styles.scrollbarWidth,
        webkitScrollbarDisplay: webkitStyle.display,
        hasOverflow, scrolled,
      };
    });
    expect(result.scrollbarWidth).toBe('none');
    expect(result.webkitScrollbarDisplay).toBe('none');
    expect(result.hasOverflow).toBe(true);
    expect(result.scrolled).toBe(true);
  }

  await page.goto('/admin/classes');
  await expect(page.getByRole('textbox', { name: 'Search classes' })).toBeVisible();
  await assertHiddenAndScrollable('main');
  await page.locator('table tbody tr').first().click();
  await expect(page.locator('aside[aria-label="Class Detail"]')).toBeVisible();
  await assertHiddenAndScrollable('aside[aria-label="Class Detail"] > div.overflow-y-auto');

  await page.getByRole('button', { name: 'Create Class' }).click();
  await expect(page.getByRole('dialog', { name: 'Create Class' })).toBeVisible();
  await assertHiddenAndScrollable('[role="dialog"][aria-label="Create Class"] > div.overflow-y-auto');
  await page.getByRole('dialog', { name: 'Create Class' })
    .getByRole('button', { name: 'Close Create Class' }).click();

  await page.goto('/admin/students');
  await expect(page.getByRole('textbox', { name: 'Search students' })).toBeVisible();
  await assertHiddenAndScrollable('section[aria-label="Students"] > div.overflow-auto');
  await page.locator('table tbody tr').first().click();
  await expect(page.locator('aside[aria-label="Student Detail"]')).toBeVisible();
  await assertHiddenAndScrollable('aside[aria-label="Student Detail"] > div.overflow-y-auto');
});
