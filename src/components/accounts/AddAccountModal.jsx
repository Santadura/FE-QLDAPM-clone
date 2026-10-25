import { useState } from 'react';
import { ACCOUNT_ROLE_OPTIONS } from '../../config/roles';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const inputClass = 'mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#173557]';

export default function AddAccountModal({ onClose, onSubmit, title = 'Add Account', submitLabel = 'Add Account' }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'Teacher' });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;
    if (!form.fullName.trim()) {
      setErrors({ fullName: 'Please enter a full name.' });
      return;
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setErrors({ password: 'Password must not exceed 72 UTF-8 bytes.' });
      return;
    }
    setPending(true);
    setErrors({});
    try {
      const result = await onSubmit(form);
      if (result?.ok) onClose();
      else setErrors(result?.errors || { general: 'Unable to create the account.' });
    } catch (error) {
      setErrors({ general: error.message || 'Unable to create the account.' });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal title={title} onClose={() => { if (!pending) onClose(); }} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-slate-500">Tên đăng nhập và hồ sơ nhân viên được tạo tự động theo vai trò đã chọn.</p>
        <fieldset disabled={pending} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-800 sm:col-span-2">
            Full name
            <input name="fullName" autoComplete="name" required maxLength={100} value={form.fullName} onChange={handleChange} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Email
            <input name="email" type="email" autoComplete="email" required maxLength={100} value={form.email} onChange={handleChange} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Phone <span className="font-normal text-slate-400">(không bắt buộc)</span>
            <input name="phone" type="tel" autoComplete="tel" maxLength={15} pattern="[+]?[0-9]{9,15}" title="9–15 chữ số, có thể bắt đầu bằng +" value={form.phone} onChange={handleChange} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Password
            <input name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={72} value={form.password} onChange={handleChange} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Assigned Role
            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              {ACCOUNT_ROLE_OPTIONS.map((role) => <option key={role}>{role}</option>)}
            </select>
          </label>
        </fieldset>
        <p className="text-xs text-slate-500">Vai trò được gán khi tạo tài khoản và không thể thay đổi sau đó.</p>
        {Object.values(errors).filter(Boolean).length > 0 && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {Object.entries(errors).filter(([, message]) => message).map(([field, message]) => <p key={field}>{message}</p>)}
          </div>
        )}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={pending}>{pending ? 'Creating...' : submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}
