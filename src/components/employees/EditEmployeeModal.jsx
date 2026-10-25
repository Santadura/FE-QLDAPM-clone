import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { employeeApi } from '../../services/employeeApi';
import { formatNumber } from '../../features/employees/employeeHelpers';

export const employeeInput = 'mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#173557]';

export default function EditEmployeeModal({ employee, onClose, onSubmit }) {
  const [form, setForm] = useState({ fullName: employee.fullName, email: employee.email, phone: employee.phone || '', specialization: employee.specialization || '', salaryRankId: employee.salaryRankId || '' });
  const [ranks, setRanks] = useState(null);
  const [rankError, setRankError] = useState('');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let active = true;
    employeeApi.ranks().then((rows) => { if (active) { setRanks(rows); setRankError(''); } })
      .catch((err) => { if (active) setRankError(err.message); });
    return () => { active = false; };
  }, [retry]);
  const change = (e) => { setForm((v) => ({ ...v, [e.target.name]: e.target.value })); setError(''); };
  async function submit(e) {
    e.preventDefault();
    if (pending || !ranks || rankError) return;
    if (!form.fullName.trim()) { setError('Please enter a full name.'); return; }
    setPending(true);
    try {
      const result = await onSubmit({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() || null, specialization: form.specialization.trim() || null, salaryRankId: form.salaryRankId || null });
      if (result.ok) onClose(); else setError(result.errors?.general || 'Unable to save employee details.');
    } catch (err) { setError(err.message); } finally { setPending(false); }
  }
  return (
    <Modal title="Edit Employee" onClose={() => { if (!pending) onClose(); }} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-slate-500">{employee.employeeCode} · {employee.username} · Vai trò cố định: {employee.role}</p>
        <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">Full name<input name="fullName" required maxLength={100} className={employeeInput} value={form.fullName} onChange={change} /></label>
          <label className="text-sm">Email<input name="email" type="email" required maxLength={100} className={employeeInput} value={form.email} onChange={change} /></label>
          <label className="text-sm">Phone<input name="phone" type="tel" maxLength={15} pattern="[+]?[0-9]{9,15}" title="9–15 chữ số, có thể bắt đầu bằng +" className={employeeInput} value={form.phone} onChange={change} /></label>
          <label className="text-sm sm:col-span-2">Specialization<input name="specialization" maxLength={100} className={employeeInput} value={form.specialization} onChange={change} /></label>
          <label className="text-sm">Salary rank<select name="salaryRankId" className={employeeInput} value={form.salaryRankId} onChange={change} disabled={!ranks || Boolean(rankError)}>
            <option value="">No salary rank assigned</option>
            {employee.salaryRankId && !ranks?.some((r) => r.salaryRankId === employee.salaryRankId) && <option value={employee.salaryRankId}>{employee.salaryRank || employee.salaryRankId} (current)</option>}
            {ranks?.filter((r) => r.role === employee.role).map((r) => <option key={r.salaryRankId} value={r.salaryRankId}>{r.rank} · {formatNumber(r.amount)}</option>)}
          </select></label>
        </fieldset>
        <p className="text-xs text-slate-500">Dùng Change Status để cập nhật trạng thái làm việc. Thay đổi bậc lương không làm thay đổi các kỳ lương đã lưu.</p>
        {rankError && <p role="alert" className="text-sm text-red-600">{rankError} <button type="button" className="underline" onClick={() => setRetry((v) => v + 1)}>Reload salary ranks</button></p>}
        {!ranks && !rankError && <p role="status" className="text-sm text-slate-500">Loading salary ranks...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={pending || !ranks || Boolean(rankError)}>{pending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Modal>
  );
}
