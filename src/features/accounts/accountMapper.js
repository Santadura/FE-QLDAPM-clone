import { ACCOUNT_ROLE_MAP } from '../../config/roles';
import { getInitials } from './accountStore';

export function mapAccountResponse(account) {
  const name = account.fullName || account.username;
  return {
    id: account.username,
    username: account.username,
    user: name,
    email: account.email || '',
    employeeId: account.employeeId || '',
    code: account.employeeCode || '',
    phone: account.phone || '',
    specialization: account.specialization || '',
    role: Object.keys(ACCOUNT_ROLE_MAP).find((label) => ACCOUNT_ROLE_MAP[label] === account.role) || account.role,
    status: account.status === 'ACTIVE' ? 'Active' : account.status === 'LOCKED' ? 'Locked' : account.status,
    initials: getInitials(name),
    createdDate: account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : '',
  };
}
