import { test, expect } from '@playwright/test';

// Browser-level UI regression with the real Spring Boot / disposable DB used
// by CI. This test registers four non-overlapping shifts on a single day,
// proving that the week row remains 164px and +N preserves all 4 records.
test.describe.configure({ retries: 0, timeout: 180_000 });
const api = process.env.E2E_API_URL || 'http://localhost:8080/api';
const password = process.env.E2E_SEED_PASSWORD || '123456';

function targetDayWithinThisWeek() {
  const now = new Date(Date.now() + 7 * 3600_000);
  // Pick a different weekday than today's to avoid colliding with the
  // recurring availability created by the class/attendance E2E scenario.
  // Sunday -> Saturday; other weekdays -> following day in the same week.
  const offset = now.getUTCDay() === 0 ? -1 : 1;
  const date = new Date(Date.UTC(now.getUTCFullYear(),
    now.getUTCMonth(), now.getUTCDate() + offset));
  return {
    iso: date.toISOString().slice(0, 10),
    weekday: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getUTCDay()],
  };
}

const shifts = [
  ['08:30', '11:30', 'MORNING'],
  ['11:30', '13:00', 'MORNING'],
  ['14:00', '17:00', 'AFTERNOON'],
  ['18:00', '21:00', 'EVENING'],
];

async function bearer(request, username) {
  const login = await request.post(api + '/auth/login', {
    data: { username, password },
  });
  expect(login.ok(), 'login ' + username).toBeTruthy();
  const credentials = await login.json();
  return { Authorization: 'Bearer ' + credentials.token };
}

async function registerFourShifts(request, employee, reviewer, day) {
  const auth = await bearer(request, employee);
  const reviewerAuth = await bearer(request, reviewer);
  for (const [index, [startTime, endTime, shift]] of shifts.entries()) {
    const created = await request.post(api + '/availabilities', {
      headers: auth,
      data: {
        availableDate: day.iso,
        dayOfWeek: day.weekday,
        shift,
        startTime, endTime,
        availabilityType: 'WEEKLY',
        campus: 'Cơ sở chính',
        note: 'compact week UI regression',
      },
    });
    const responseText = await created.text();
    expect(created.status(), employee + ' create ' + startTime +
      ': ' + responseText).toBe(201);
    const slot = JSON.parse(responseText);
    // Leave the last shift pending so the expanded panel can approve it.
    if (index < shifts.length - 1) {
      const reviewed = await request.patch(
        api + '/availabilities/' + slot.id + '/review',
        { headers: reviewerAuth, data: { status: 'APPROVED' } },
      );
      expect(reviewed.ok(), 'review ' + employee + ' ' + startTime).toBeTruthy();
    }
  }
}

async function seedThreeAssignedShifts(request, day) {
  const cs = await bearer(request, 'cs001');
  const teacherReviewer = await bearer(request, 'tc001');
  const cmReviewer = await bearer(request, 'cm001');
  const code = 'QA-UI-' + Date.now().toString(36).toUpperCase().slice(-9);
  const created = await request.post(api + '/classes', {
    headers: cs,
    data: {
      courseId: 'course-ielts',
      classCode: code,
      name: 'Compact weekly scheduling UI ' + code,
      startDate: day.iso,
      endDate: day.iso,
      targetRequirements: [{ targetType: 'OVERALL_BAND', requiredTarget: 5 }],
      plannedSessions: shifts.slice(0, 3).map(([startTime, endTime]) => ({
        date: day.iso, startTime, endTime,
      })),
    },
  });
  expect(created.ok(), 'create isolated 3-lesson test class').toBe(true);
  const cls = await created.json();
  const lessonsResponse = await request.get(
    api + '/classes/' + cls.classId + '/planned-sessions',
    { headers: cs },
  );
  expect(lessonsResponse.ok()).toBe(true);
  const lessons = await lessonsResponse.json();
  expect(lessons).toHaveLength(3);
  const ready = await request.patch(api + '/classes/' + cls.classId + '/status', {
    headers: cs, data: { status: 'READY' },
  });
  expect(ready.ok(), 'class must be READY for staff assignment').toBe(true);
  for (const [reviewer, role, employee] of [
    [teacherReviewer, 'TEACHER', 'teacher-003'],
    [cmReviewer, 'CS', 'cs-003'],
  ]) {
    const assigned = await request.post(
      api + '/class-planning/' + cls.classId + '/staffing',
      { headers: reviewer, data: {
        role, employeeId: employee,
        campus: 'Cơ sở chính', workplaceId: 'center-01',
        mode: 'FILL_EMPTY', scope: 'COURSE',
        sessionIds: lessons.map((lesson) => lesson.id),
      } },
    );
    const message = await assigned.text();
    expect(assigned.ok(), 'assign three ' + role + ' shifts: ' + message).toBe(true);
    expect(JSON.parse(message).createdCount).toBe(3);
  }
  return cls.classId;
}

async function checkRole(browser, username, route, employeeCode, day) {
  const context = await browser.newContext({
    timezoneId: 'Asia/Ho_Chi_Minh',
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.goto('/login');
    await page.locator('#login-identifier').fill(username);
    await page.locator('#login-password').fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp('/' + username.slice(0, 2) + '(?:/|$)'));
    await page.goto(route);
    const row = page.locator('div[class*="h-[164px]"][class*="grid-cols"]')
      .filter({ hasText: employeeCode }).first();
    await expect(row, 'person row: ' + employeeCode).toBeVisible();

    // Three assigned shifts are visible. Four availability records remain
    // accessible via the +4 expander; none are silently discarded.
    const chips = row.locator('button[aria-label^="Xem lịch "]');
    await expect(chips).toHaveCount(3);
    await expect(row).toHaveCSS('height', '164px');
    const overflow = row.getByRole('button', {
      name: new RegExp('Xem thêm 4 lịch .*' + day.iso),
    });
    await expect(overflow).toBeVisible();
    await overflow.click();

    const details = page.locator('section[aria-label^="Chi tiết lịch"]');
    await expect(details).toBeVisible();
    await expect(details.getByRole('button', { name: 'Chọn lịch rảnh' })).toHaveCount(4);
    await expect(details.getByRole('button', { name: 'Hủy phân công' })).toHaveCount(3);
    await expect(details.getByRole('button', { name: 'Đổi nhân sự' })).toHaveCount(3);
    await expect(details.getByRole('button', { name: 'Duyệt' })).toHaveCount(1);
    await expect(details.getByRole('button', { name: 'Từ chối' })).toHaveCount(1);

    await details.getByRole('button', { name: 'Duyệt' }).click();
    await expect(details.getByRole('button', { name: 'Duyệt' })).toHaveCount(0);
    await expect(details.getByRole('button', { name: 'Chọn lịch rảnh' })).toHaveCount(4);
    await details.getByRole('button', { name: 'Chọn lịch rảnh' }).first().click();
    await details.getByRole('button', { name: 'Đóng chi tiết lịch' }).click();
    await expect(details).toHaveCount(0);
    await expect(row).toHaveCSS('height', '164px');
  } finally {
    await context.close();
  }
}

test('CM and TC calendars compact three assigned shifts plus four availability records with detail actions', async ({ browser, request }) => {
  const day = targetDayWithinThisWeek();
  // Both screens fetch their data from the real availability API.
  await registerFourShifts(request, 'cs003', 'cm001', day);
  await registerFourShifts(request, 'teacher003', 'tc001', day);
  await seedThreeAssignedShifts(request, day);
  await checkRole(browser, 'cm001', '/cm/assign-cs', 'CS-003', day);
  await checkRole(browser, 'tc001', '/tc/assign-teacher', 'GV-003', day);
});
