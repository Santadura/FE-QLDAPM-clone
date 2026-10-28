import { test, expect } from '@playwright/test';

// Real Spring Boot + migrated PostgreSQL are required. No API mocks.
// Every CI job receives a disposable, newly seeded database.
const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api';
const password = process.env.E2E_SEED_PASSWORD || '123456';
// This test writes real DB records: never retry against the same CI database.
test.describe.configure({ retries: 0, timeout: 180_000 });

function vietnamDate(offset) {
  // UTC+7 has no DST. Using a day number avoids the runner's UTC day boundary.
  const now = new Date(Date.now() + 7 * 3600_000);
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
    now.getUTCDate() + offset));
  return day.toISOString().slice(0, 10);
}

const dayCodes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function weekday(date) { return dayCodes[new Date(date + 'T00:00:00Z').getUTCDay()]; }

async function jsonOrFail(response, context) {
  const body = await response.text();
  if (!response.ok()) throw new Error(context + ' => HTTP ' +
    response.status() + ': ' + body.slice(0, 1500));
  try { return JSON.parse(body); } catch { throw new Error(context + ': invalid JSON ' + body); }
}

test('create class, approve availability, staff the course and mark a past teacher lesson', async ({ page, request }) => {
  const token = {};
  for (const role of ['cs001', 'cs003', 'teacher003', 'tc001', 'cm001']) {
    const response = await request.post(apiBase + '/auth/login', {
      data: { username: role, password },
    });
    const credentials = await jsonOrFail(response, 'login ' + role);
    token[role] = credentials.token;
    expect(token[role], 'Bearer token from ' + role).toBeTruthy();
  }
  const headers = (role) => ({ Authorization: 'Bearer ' + token[role] });
  async function call(role, method, path, data, message) {
    const response = await request.fetch(apiBase + path, {
      method, headers: headers(role),
      ...(data === undefined ? {} : { data }),
    });
    return jsonOrFail(response, message || role + ' ' + method + ' ' + path);
  }

  const past = vietnamDate(-7);
  const future = vietnamDate(7);
  const plannedSessions = [past, future].map((date) => ({
    date, startTime: '09:00', endTime: '11:00',
  }));
  const code = 'QA-E2E-' + Date.now().toString(36).toUpperCase().slice(-11);
  const cls = await call('cs001', 'POST', '/classes', {
    courseId: 'course-ielts', classCode: code,
    name: 'Playwright Teacher Attendance ' + code,
    startDate: vietnamDate(-8), endDate: vietnamDate(8),
    targetRequirements: [{ targetType: 'OVERALL_BAND', requiredTarget: 5 }],
    plannedSessions,
  }, 'CS creates class with two lessons');
  expect(cls.status).toBe('DRAFT');
  expect(cls.csAccessLevel).toBe('CREATOR');
  const classId = cls.classId;

  const lessons = await call('cs001', 'GET', '/classes/' + classId + '/planned-sessions');
  expect(lessons).toHaveLength(2);
  const ids = lessons.map((x) => x.id);
  await call('cs001', 'PATCH', '/classes/' + classId + '/status', { status: 'READY' });

  // One recurring approval must cover BOTH last week's and next week's lesson.
  const dow = weekday(past);
  async function approveRecurring(employee, reviewer) {
    const registration = await call(employee, 'POST', '/availabilities', {
      availableDate: null, dayOfWeek: dow, shift: 'MORNING',
      startTime: '08:30', endTime: '11:30', availabilityType: 'RECURRING',
      campus: 'Cơ sở chính', note: 'isolated CI E2E',
    }, 'register recurring availability for ' + employee);
    expect(registration.status).toBe('PENDING');
    const review = await call(reviewer, 'PATCH',
      '/availabilities/' + registration.id + '/review', { status: 'APPROVED' });
    expect(review.status).toBe('APPROVED');
  }
  await approveRecurring('teacher003', 'tc001');
  await approveRecurring('cs003', 'cm001');

  const teacherResult = await call('tc001', 'POST',
    '/class-planning/' + classId + '/staffing', {
      role: 'TEACHER', employeeId: 'teacher-003', campus: 'Cơ sở chính',
      mode: 'FILL_EMPTY', scope: 'COURSE', sessionIds: ids,
    }, 'TC staffs entire course');
  expect(teacherResult.createdCount).toBe(2);

  const csResult = await call('cm001', 'POST',
    '/class-planning/' + classId + '/staffing', {
      role: 'CS', employeeId: 'cs-003', workplaceId: 'center-01',
      mode: 'FILL_EMPTY', scope: 'COURSE', sessionIds: ids,
    }, 'CM assigns course CS');
  expect(csResult.createdCount).toBe(2);

  const managerDetail = await call('cs003', 'GET', '/classes/' + classId);
  expect(managerDetail.csAccessLevel).toBe('MANAGER');
  await call('cs003', 'PATCH', '/classes/' + classId + '/status', { status: 'RUNNING' });

  // An active RUNNING class may not lose the last CS for a planned lesson.
  const deniedCsCancellation = await request.delete(apiBase + '/staff-schedules/' + csResult.createdIds[0], {
    headers: headers('cm001'),
  });
  expect(deniedCsCancellation.status(), 'CM cannot remove sole lesson support').toBe(409);
  const afterDeniedCancellation = await call('cm001', 'GET', '/staff-schedules', undefined, 'Verify CS assignments');
  expect(afterDeniedCancellation.some((row) => row.id === csResult.createdIds[0] &&
    row.status === 'ASSIGNED')).toBe(true);

  const attendanceUrl = '/classes/' + classId + '/teacher-attendance';
  const rows = await call('cs003', 'GET', attendanceUrl);
  expect(rows).toHaveLength(2);
  // Explicit FE/BE contract check. Without this field, the older backend
  // produces an enabled dropdown but the current save handler cannot mark.
  // Fail immediately with a useful mismatch message instead of a 15s UI timeout.
  for (const lesson of rows) {
    expect(lesson.assignmentStatus,
      'Incompatible BE: teacher-attendance rows must include assignmentStatus (ASSIGNED or CANCELLED)')
      .toBe('ASSIGNED');
  }
  const oldLesson = rows.find((x) => String(x.date).slice(0, 10) === past);
  const nextLesson = rows.find((x) => String(x.date).slice(0, 10) === future);
  expect(oldLesson?.assignedToMe).toBe(true);
  expect(nextLesson?.assignedToMe).toBe(true);

  // Role security: the creator is NOT the assigned CS, and Teacher may not self-mark.
  for (const otherRole of ['cs001', 'teacher003']) {
    const denied = await request.put(apiBase + attendanceUrl + '/' + oldLesson.id, {
      headers: headers(otherRole), data: { status: 'PRESENT' },
    });
    expect(denied.status(), otherRole + ' cannot mark attendance').toBe(403);
  }
  const early = await request.put(apiBase + attendanceUrl + '/' + nextLesson.id, {
    headers: headers('cs003'), data: { status: 'PRESENT' },
  });
  expect(early.status(), 'cannot pre-mark a future lesson').toBe(409);

  // Real browser interaction: login as CM-assigned course CS, find the class,
  // select the Teacher Attendance tab, and save a past lesson.
  await page.goto('/login');
  await page.locator('#login-identifier').fill('cs003');
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/cs(?:\/|$)/);
  await page.goto('/cs/classes/update');
  await page.getByRole('textbox', { name: 'Search classes' }).fill(code);
  await expect(page.getByText(code).first()).toBeVisible();
  await page.getByText(code).first().click();
  await page.getByText('Điểm danh GV', { exact: true }).click();

  const select = page.locator('select[aria-label*="' + past + '"]');
  await expect(select).toBeEnabled();
  await select.selectOption('PRESENT');
  const [initialSave] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === 'PUT' &&
      response.url().includes(attendanceUrl + '/' + oldLesson.id)),
    page.getByRole('button', { name: 'Lưu điểm danh' }).first().click(),
  ]);
  expect(initialSave.ok(), 'initial teacher attendance PUT must succeed').toBe(true);
  await expect(page.getByRole('status')).toContainText('Đã lưu điểm danh giáo viên');

  // The persisted value must survive reload; correction updates one row.
  await page.reload();
  // Class selection is local UI state, so select it again after refresh.
  await page.getByRole('textbox', { name: 'Search classes' }).fill(code);
  await page.getByText(code).first().click();
  await page.getByText('Điểm danh GV', { exact: true }).click();
  await expect(page.locator('select[aria-label*="' + past + '"]')).toHaveValue('PRESENT');
  await page.locator('select[aria-label*="' + past + '"]').selectOption('LATE');
  // Click returns before the async PUT has necessarily finished. Wait for the
  // exact lesson's response and the UI success message before querying the DB.
  const [correctionResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === 'PUT' &&
      response.url().includes(attendanceUrl + '/' + oldLesson.id)),
    page.getByRole('button', { name: 'Lưu điểm danh' }).first().click(),
  ]);
  expect(correctionResponse.ok(), 'teacher attendance correction PUT must succeed').toBe(true);
  await expect(page.getByRole('status')).toContainText('Đã lưu điểm danh giáo viên');
  await expect(page.locator('select[aria-label*="' + past + '"]')).toHaveValue('LATE');

  // Verify the actual persisted value through BE, not merely the select draft.
  await expect.poll(async () => {
    const updatedRows = await call('cs003', 'GET', attendanceUrl);
    return updatedRows.find((x) => x.id === oldLesson.id)?.attendanceStatus;
  }, { message: 'corrected teacher attendance must be persisted in BE' }).toBe('LATE');
  const finalRows = await call('cs003', 'GET', attendanceUrl);
  const saved = finalRows.find((x) => x.id === oldLesson.id);
  expect(saved.recordedByName).toBeTruthy();
  expect(finalRows.find((x) => x.id === nextLesson.id)?.attendanceStatus).toBeFalsy();
});
