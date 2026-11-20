import { BookOpen, ShieldCheck, UserRound } from 'lucide-react';
import { getInitials } from '../../features/accounts/accountStore';
import useUserProfileForm from '../../features/user/useUserProfileForm';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import Button from '../ui/Button';

const inputClass = 'w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';

export default function UserProfileOverview({ account, courseCount }) {
  const { form, savedProfile, errors, saved, dirty, updateField, resetForm, saveProfile } = useUserProfileForm(account);
  const { loggingOut } = useAccountData();
  const displayName = savedProfile.fullName || account.username;
  const active = account.status === 'Active';
  const accountFields = [
    ['Tên đăng nhập', account.username],
    ['Email đăng nhập', account.email],
    ['Vai trò', 'Học viên'],
    ...(account.createdDate ? [['Ngày tạo tài khoản', account.createdDate]] : []),
  ];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section aria-labelledby="user-profile-heading" className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="user-profile-heading" className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-800"><UserRound size={18} />Hồ sơ cá nhân</h2>
        <div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#173557] text-xl font-semibold text-white">{getInitials(displayName) || 'US'}</div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 [overflow-wrap:anywhere]">{displayName}</p>
            <p className="mt-1 text-xs text-slate-500">Tài khoản học viên</p>
          </div>
        </div>
        <form onSubmit={saveProfile} noValidate className="space-y-5">
          <div>
            <label htmlFor="user-profile-name" className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
            <input id="user-profile-name" name="fullName" autoComplete="name" required maxLength={100} value={form.fullName} onChange={updateField} disabled={loggingOut} className={inputClass}
              aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'user-profile-name-error' : undefined} />
            {errors.fullName && <p id="user-profile-name-error" role="alert" className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="user-profile-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
              <input id="user-profile-phone" name="phone" type="tel" autoComplete="tel" maxLength={15} value={form.phone} onChange={updateField} disabled={loggingOut} className={inputClass}
                aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'user-profile-phone-error' : undefined} />
              {errors.phone && <p id="user-profile-phone-error" role="alert" className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="user-profile-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email liên hệ</label>
              <input id="user-profile-email" name="email" type="email" autoComplete="email" required maxLength={100} value={form.email} onChange={updateField} disabled={loggingOut} className={inputClass}
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'user-profile-email-error' : undefined} />
              {errors.email && <p id="user-profile-email-error" role="alert" className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>
          <p className="text-xs leading-5 text-slate-500">Thông tin chỉnh sửa chỉ lưu trên trình duyệt này. Email liên hệ không thay đổi email đăng nhập.</p>
          {errors.general && <p role="alert" className="text-sm text-red-600">{errors.general}</p>}
          {saved && <p role="status" className="text-sm text-emerald-700">Đã lưu thông tin cá nhân trên trình duyệt.</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" onClick={resetForm} disabled={!dirty || loggingOut}>Hủy thay đổi</Button>
            <Button type="submit" variant="primary" disabled={!dirty || loggingOut}>Lưu thông tin</Button>
          </div>
        </form>
      </section>

      <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="user-account-heading">
        <h2 id="user-account-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800"><ShieldCheck size={18} />Thông tin tài khoản</h2>
        <dl className="space-y-4 text-sm">
          {accountFields.map(([label, value]) => (
            <div key={label}><dt className="mb-1 text-xs text-slate-400">{label}</dt><dd className="font-medium text-slate-800 [overflow-wrap:anywhere]">{value}</dd></div>
          ))}
          <div>
            <dt className="mb-1 text-xs text-slate-400">Trạng thái tài khoản</dt>
            <dd className={`flex items-center gap-1.5 font-medium ${active ? 'text-emerald-700' : 'text-red-600'}`}>
              <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {active ? 'Active' : account.status || '—'}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-[#173557]">
          <BookOpen size={21} className="shrink-0" />
          <div><p className="text-xl font-semibold">{courseCount}</p><p className="mt-0.5 text-xs text-slate-500">Khóa học đã đăng ký mô phỏng</p></div>
        </div>
      </aside>
    </div>
  );
}
