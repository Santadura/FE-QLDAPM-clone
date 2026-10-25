import EntityTable from '../ui/EntityTable';
import { getInitials } from '../../features/accounts/accountStore';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES, formatNumber } from '../../features/employees/employeeHelpers';

export function EmployeeStatus({ value }) {
  return <span className={`text-xs font-medium ${value === 'ACTIVE' ? 'text-emerald-600' : value === 'ON_LEAVE' ? 'text-amber-600' : 'text-slate-500'}`}>● {EMPLOYEE_STATUSES[value] || value}</span>;
}

const columns = [
  { key: 'fullName', label: 'Employee', width: 'w-[32%]', render: (e) => (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173557] text-xs font-semibold text-white">{getInitials(e.fullName)}</span>
      <div><p className="font-medium text-slate-900">{e.fullName}</p><p className="text-xs text-slate-400">{e.employeeCode}</p></div>
    </div>
  ) },
  { key: 'role', label: 'Role', render: (e) => EMPLOYEE_ROLES[e.role] || e.role },
  { key: 'status', label: 'Status', render: (e) => <EmployeeStatus value={e.status} /> },
  { key: 'weeklyHours', label: 'Workload', render: (e) => <span>{formatNumber(e.weeklyHours)}<span className="block text-xs text-slate-400">hrs/week</span></span> },
  { key: 'rankAmount', label: 'Salary Rank Amount', render: (e) => <span title={e.salaryRank || 'Chưa được gán bậc lương'}>{formatNumber(e.rankAmount)}</span> },
];

export default function EmployeeTable({ model }) {
  return <EntityTable label="Employees" columns={columns} rows={model.paginatedRows}
    getRowId={(e) => e.employeeId} selectedId={model.selectedId}
    onRowClick={(e) => { if (!model.pending) model.setSelectedId(e.employeeId); }}
    page={model.page} pageSize={model.pageSize} total={model.rows.length} onPageChange={model.setPage}
    itemLabel="employees" emptyMessage="No employees match your search." />;
}
