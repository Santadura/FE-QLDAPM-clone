import { test, expect } from '@playwright/test';

const api = process.env.E2E_API_URL || 'http://localhost:8080/api';
const password = process.env.E2E_SEED_PASSWORD || '123456';
test.describe.configure({ retries: 0, timeout: 180_000 });

function dateOffset(days) {
  const now = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
    now.getUTCDate() + days)).toISOString().slice(0, 10);
}

test('Admin adds/removes class roster, detects overlapping classes, confirms student status', async ({ page, request }) => {
  const login = await request.post(api + '/auth/login', {
    data: { username: 'admin', password },
  });
  expect(login.ok()).toBe(true);
  const { token } = await login.json();
  const headers = { Authorization: 'Bearer ' + token };
  async function create(path, data) {
    const response = await request.post(api + path, { headers, data });
    expect(response.status(), path + ': ' + await response.text()).toBe(201);
    return response.json();
  }

  const suffix = Date.now().toString(36).toUpperCase().slice(-8);
  const studentName = 'QA Roster ' + suffix;
  const student = await create('/students', {
    studentCode: 'QA-S-' + suffix, fullName: studentName,
    email: null, phone: null, level: null,
    targets: { 'course-ielts': { OVERALL_BAND: 6.5 } },
  });
  expect(student.studentId).toBeTruthy();
  const date = dateOffset(180);
  const createClass = (letter, startTime, endTime) => create('/classes', {
    courseId: 'course-ielts', classCode: 'QA-R-' + letter + suffix,
    name: 'Roster test ' + letter, startDate: date, endDate: date,
    targetRequirements: [{ targetType: 'OVERALL_BAND', requiredTarget: 5.5 }],
    plannedSessions: [{ date, startTime, endTime }],
  });
  const first = await createClass('A', '18:00', '20:00');
  const second = await createClass('B', '19:00', '21:00');

  await page.goto('/login');
  await page.locator('#login-identifier').fill('admin');
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin(?:\/|$)/);

  await page.goto('/admin/classes');
  await page.getByRole('textbox', { name: 'Search classes' }).fill(first.classCode);
  await page.getByText(first.classCode, { exact: true }).first().click();
  await page.getByRole('tab', { name: 'Students' }).click();
  await page.getByRole('button', { name: 'Add Students' }).click();

  const addDialog = page.getByRole('dialog', { name: 'Add students · ' + first.classCode });
  await expect(addDialog.getByText(studentName, { exact: true })).toBeVisible();
  await addDialog.locator('label').filter({ hasText: studentName }).getByRole('checkbox').check();
  await addDialog.getByRole('button', { name: 'Add Students', exact: true }).click();
  await expect(addDialog).toHaveCount(0);
  await expect(page.getByText(studentName, { exact: true })).toBeVisible();

  await page.goto('/admin/students');
  await page.getByRole('textbox', { name: 'Search students' }).fill(studentName);
  await page.getByRole('checkbox', { name: 'Select ' + student.studentId }).check();
  await page.getByRole('button', { name: 'Add to Class' }).click();
  const assignDialog = page.getByRole('dialog', { name: 'Thêm học sinh vào lớp' });
  await assignDialog.getByLabel('Lớp', { exact: true }).selectOption(second.classId);
  await expect(assignDialog.getByText('Không đủ điều kiện')).toBeVisible();
  await expect(assignDialog.getByRole('button', { name: 'Thêm vào lớp' })).toBeDisabled();
  await assignDialog.getByRole('button', { name: 'Quay lại' }).click();

  await page.goto('/admin/classes');
  await page.getByRole('textbox', { name: 'Search classes' }).fill(first.classCode);
  await page.getByText(first.classCode, { exact: true }).first().click();
  await page.getByRole('tab', { name: 'Students' }).click();
  await page.getByText(studentName, { exact: true }).locator('xpath=../..').getByRole('button', { name: 'Remove' }).click();
  const removeDialog = page.getByRole('dialog', { name: 'Xác nhận đưa học sinh ra khỏi lớp' });
  await expect(removeDialog).toBeVisible();
  await removeDialog.getByRole('button', { name: 'Đưa ra khỏi lớp', exact: true }).click();
  await expect(removeDialog).toHaveCount(0);
  await expect(page.getByText(studentName, { exact: true })).toHaveCount(0);

  // Re-enroll so the status action must deactivate a real active membership.
  const addResponse = await request.post(api + '/classes/' + first.classId + '/students', {
    headers, data: { studentIds: [student.studentId] },
  });
  expect(addResponse.status()).toBe(200);
  await page.goto('/admin/students');
  await page.getByRole('textbox', { name: 'Search students' }).fill(studentName);
  await page.getByText(studentName, { exact: true }).first().click();
  await page.getByRole('button', { name: 'Put On Leave' }).click();
  const statusDialog = page.getByRole('dialog', { name: 'Xác nhận đổi trạng thái học sinh' });
  await expect(statusDialog).toContainText('không tự khôi phục');
  await statusDialog.getByRole('button', { name: 'Đổi trạng thái', exact: true }).click();
  await expect(statusDialog).toHaveCount(0);
  const details = await request.get(api + '/students/' + student.studentId, { headers });
  expect(details.ok()).toBe(true);
  const updated = await details.json();
  expect(updated.status).toBe('On Leave');
  expect(updated.classes.find((x) => x.classId === first.classId)?.membershipStatus).toBe('INACTIVE');
});
