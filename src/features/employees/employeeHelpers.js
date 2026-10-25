import { ACCOUNT_ROLE_MAP } from '../../config/roles';

export const EMPLOYEE_ROLES = Object.fromEntries(Object.entries(ACCOUNT_ROLE_MAP).map(([label, key]) => [key, label]));
export const EMPLOYEE_STATUSES = { ACTIVE: 'Active', ON_LEAVE: 'On Leave', INACTIVE: 'Inactive' };
export const formatNumber = (value) => value == null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
export const formatDate = (value) => value ? value.split('-').reverse().join('/') : '—';

export function mondayOf(date) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() - (result.getDay() + 6) % 7);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
}

export function currentWeek() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return mondayOf(`${date.year}-${date.month}-${date.day}`);
}

export function exportEmployees(rows) {
  const values = [
    ['Employee Code', 'Full Name', 'Username', 'Role', 'Email', 'Phone', 'Employment Status', 'Weekly Hours', 'Salary Rank', 'Rank Amount'],
    ...rows.map((e) => [e.employeeCode, e.fullName, e.username, EMPLOYEE_ROLES[e.role] || e.role, e.email, e.phone, EMPLOYEE_STATUSES[e.status] || e.status, e.weeklyHours, e.salaryRank, e.rankAmount]),
  ];
  const csv = values.map((row) => row.map((value) => {
    const text = String(value ?? '');
    const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'employees.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
