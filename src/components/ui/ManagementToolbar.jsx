import { Download, Plus, Search } from 'lucide-react';
import Button from './Button';

export default function ManagementToolbar({
  searchTerm, onSearch, searchPlaceholder, searchMaxLength,
  selectedRole, onRoleChange, roleOptions, allRolesValue = '',
  selectedStatus, onStatusChange, statusOptions, allStatusValue = '',
  onExport, onAddClick, addLabel, showAdd = true,
  exportDisabled = false, addDisabled = false, children,
}) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" value={searchTerm} onChange={onSearch} maxLength={searchMaxLength} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-[#1a365d] focus:outline-none" />
          </div>
          <select value={selectedRole} aria-label="Filter by role" onChange={onRoleChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:border-[#1a365d] focus:outline-none">
            <option value={allRolesValue}>Role: All Roles</option>
            {roleOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={selectedStatus} aria-label="Filter by status" onChange={onStatusChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:border-[#1a365d] focus:outline-none">
            <option value={allStatusValue}>Status: All Status</option>
            {statusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onExport} disabled={exportDisabled}><Download size={16} />Export</Button>
          {showAdd && <Button variant="primary" onClick={onAddClick} disabled={addDisabled}><Plus size={16} />{addLabel}</Button>}
        </div>
      </div>
      {children && <div className="mt-3 border-t border-slate-100 pt-3">{children}</div>}
    </div>
  );
}
