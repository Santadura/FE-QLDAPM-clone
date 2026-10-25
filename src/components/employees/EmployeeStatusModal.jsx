import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { EMPLOYEE_STATUSES } from '../../features/employees/employeeHelpers';

export default function EmployeeStatusModal({ employee, isCurrentEmployee, onClose, onSubmit }) {
  const [status, setStatus] = useState(employee.status);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const endingEmployment = status === 'INACTIVE';

  async function submit(event) {
    event.preventDefault();
    if (pending || (endingEmployment && isCurrentEmployee)) return;
    setPending(true);
    setError('');
    try {
      const result = await onSubmit(status);
      if (result.ok) onClose(); else setError(result.errors?.general || 'Unable to update employment status.');
    } catch (err) { setError(err.message); } finally { setPending(false); }
  }

  return (
    <Modal title="Change Employment Status" onClose={() => { if (!pending) onClose(); }} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div><p className="font-medium text-slate-900">{employee.fullName}</p><p className="text-xs text-slate-500">{employee.employeeCode} · {employee.username}</p></div>
        <label className="block text-sm font-medium text-slate-700">Employment status
          <select value={status} disabled={pending} onChange={(event) => { setStatus(event.target.value); setError(''); }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            {!EMPLOYEE_STATUSES[status] && <option value={status} disabled>{status}</option>}
            {Object.entries(EMPLOYEE_STATUSES).map(([value, label]) => <option key={value} value={value} disabled={value === 'INACTIVE' && isCurrentEmployee}>{label}</option>)}
          </select>
        </label>
        <div className={`rounded-md border p-3 text-sm leading-relaxed ${endingEmployment ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          {endingEmployment ? <>
            <p>Thao tác này sẽ chuyển nhân viên sang trạng thái ngừng làm việc (Inactive) và khóa tài khoản. Nhân viên sẽ không thể đăng nhập.</p>
            <p className="mt-2">Hồ sơ, chứng chỉ, lịch phân công và lịch sử lương vẫn được giữ lại. Cần kiểm tra và điều chỉnh riêng các lịch phân công sắp tới.</p>
          </> : <p>Cập nhật trạng thái làm việc không tự mở khóa tài khoản. Nếu tài khoản đang bị khóa, Admin cần mở khóa riêng tại trang Accounts.</p>}
        </div>
        {isCurrentEmployee && <p className="text-xs text-slate-500">Bạn không thể tự ngừng hoạt động hồ sơ nhân viên của mình.</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={pending || (endingEmployment && isCurrentEmployee)}>{pending ? 'Updating...' : 'Save Status'}</Button>
        </div>
      </form>
    </Modal>
  );
}
