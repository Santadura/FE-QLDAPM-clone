import ManagementToolbar from '../ui/ManagementToolbar';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES, mondayOf } from '../../features/employees/employeeHelpers';

export default function EmployeeToolbar({ model, onAdd, onExport }) {
  const roleKeys = model.authUser?.roleKey === 'TC' ? ['TEACHER']
    : model.authUser?.roleKey === 'CM' ? ['SALE', 'CS'] : Object.keys(EMPLOYEE_ROLES);
  return (
    <ManagementToolbar searchTerm={model.search} onSearch={(event) => model.setSearch(event.target.value)}
      searchPlaceholder="Search employees..." searchMaxLength={200} selectedRole={model.role} onRoleChange={(event) => model.setRole(event.target.value)}
      roleOptions={roleKeys.map((key) => ({ value: key, label: EMPLOYEE_ROLES[key] }))}
      selectedStatus={model.status} onStatusChange={(event) => model.setStatus(event.target.value)}
      statusOptions={Object.entries(EMPLOYEE_STATUSES).map(([value, label]) => ({ value, label }))}
      onExport={onExport} exportDisabled={model.loading || !model.rows.length}
      onAddClick={onAdd} addLabel="Add Employee" showAdd={model.authUser?.roleKey === 'ADMIN'} addDisabled={model.pending}>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <label>Week starting <input type="date" required value={model.weekStart}
          onChange={(event) => { if (event.target.value) model.setWeekStart(mondayOf(event.target.value)); }}
          className="ml-2 h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-600" /></label>
        <span>Khối lượng công việc gồm số giờ được phân công hoặc đã hoàn thành trong tuần. Mức lương theo bậc chưa phải tiền thực nhận.</span>
      </div>
    </ManagementToolbar>
  );
}
