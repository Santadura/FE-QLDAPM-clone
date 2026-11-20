import { useMemo, useSyncExternalStore } from 'react';
import { getSession } from '../../services/api';
import { findUserCourse } from '../../data/userCourses';

const eventName = 'qldapm:demo-purchases';
// Giữ khóa lưu trữ cũ để các khóa học đã mua thử vẫn xuất hiện sau khi đổi tên giao diện.
const purchaseKey = (username) => `qldapm.student.demo-purchases.v1:${encodeURIComponent(username)}`;

function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(eventName, callback); };
}

function snapshot(username) {
  try { return username ? localStorage.getItem(purchaseKey(username)) || '' : ''; } catch { return ''; }
}

function parse(raw) {
  try {
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows.filter((row) => row && findUserCourse(row.courseId)
      && ['momo', 'vnpay'].includes(row.method) && typeof row.id === 'string'
      && Number.isFinite(Date.parse(row.purchasedAt))) : [];
  } catch { return []; }
}

export function useDemoPurchases(username) {
  const raw = useSyncExternalStore(subscribe, () => snapshot(username), () => '');
  return useMemo(() => parse(raw), [raw]);
}

export function completeDemoPurchase(username, courseId, method) {
  const session = getSession();
  if (!session || session.username !== username || session.role !== 'USER') throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
  const course = findUserCourse(courseId);
  if (!course || !['momo', 'vnpay'].includes(method)) throw new Error('Khóa học hoặc phương thức thanh toán không hợp lệ.');
  const rows = parse(snapshot(username));
  const existing = rows.find((row) => row.courseId === courseId);
  if (existing) return existing;
  const purchase = { id: `DEMO-${crypto.randomUUID()}`, courseId, method, amount: course.price, purchasedAt: new Date().toISOString() };
  try { localStorage.setItem(purchaseKey(username), JSON.stringify([purchase, ...rows])); }
  catch { throw new Error('Không thể lưu khóa học trên trình duyệt. Hãy kiểm tra quyền lưu trữ rồi thử lại.'); }
  window.dispatchEvent(new Event(eventName));
  return purchase;
}
