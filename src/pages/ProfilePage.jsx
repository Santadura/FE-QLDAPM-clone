import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import ProfileSalaryCard from '../components/profile/ProfileSalaryCard';
import ProfileCertificates from '../components/profile/ProfileCertificates';
import { useAccountData } from '../features/accounts/hooks/useAccountData';
import { getInitials } from '../features/accounts/accountStore';
import { ROLES } from '../config/roles';

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';
const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { authUser, profileLoading, profileError, reloadProfile } = useAccountData();
  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  if (!authUser) return null;
  if (profileLoading) return <div role="status" className="p-6 text-slate-500">Đang tải thông tin cá nhân...</div>;
  if (profileError) return (
    <div role="alert" className="mx-auto max-w-5xl rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
      <p>{profileError}</p>
      <Button type="button" className="mt-3" onClick={reloadProfile}>Thử lại</Button>
    </div>
  );
  // Mount only after GET /profile completes so fields start with server data.
  return <ProfileEditor key={authUser.username} />;
}

function ProfileEditor() {
  const { authUser, updateProfile, changePassword, loggingOut } = useAccountData();
  const [form, setForm] = useState(() => ({ fullName: authUser.user, email: authUser.email, phone: authUser.phone, specialization: authUser.specialization || '' }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const busy = saving || changingPassword || loggingOut;
  const role = ROLES[authUser.roleKey];

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors({});
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (busy) return;
    if (!form.fullName.trim()) { setErrors({ fullName: 'Vui lòng nhập họ và tên.' }); return; }
    setSaving(true);
    setErrors({});
    try {
      const result = await updateProfile(form);
      if (!result.ok) { setErrors(result.errors); return; }
      setForm({ fullName: result.account.user, email: result.account.email, phone: result.account.phone, specialization: result.account.specialization });
      toast.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      setErrors({ general: error.message || 'Không thể lưu thông tin cá nhân.' });
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (busy) return;
    const validation = {};
    if (!passwords.currentPassword) validation.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!passwords.newPassword.trim() || passwords.newPassword.length < 6 || passwords.newPassword.length > 72) {
      validation.newPassword = 'Mật khẩu mới phải có 6–72 ký tự.';
    } else if (new TextEncoder().encode(passwords.newPassword).length > 72) {
      validation.newPassword = 'Mật khẩu mới không được vượt quá 72 byte UTF-8.';
    } else if (passwords.newPassword === passwords.currentPassword) {
      validation.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }
    if (!passwords.confirmPassword || passwords.confirmPassword !== passwords.newPassword) {
      validation.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    setPasswordErrors(validation);
    if (Object.keys(validation).length) return;
    setChangingPassword(true);
    try {
      const result = await changePassword(passwords);
      if (!result.ok) { setPasswordErrors(result.errors); return; }
      setPasswords(emptyPasswords);
      setVisiblePasswords({});
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.');
    } catch (error) {
      setPasswordErrors({ general: error.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setChangingPassword(false);
    }
  }

  const accountFields = [
    ['Tên đăng nhập', authUser.username],
    ['Vai trò', role?.label || authUser.role],
    ['Ngày tạo tài khoản', authUser.createdDate],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-slate-500">Cập nhật hồ sơ, quản lý mật khẩu và xem thông tin tài khoản của bạn.</p>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-800"><UserRound size={18} />Hồ sơ cá nhân</h3>
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#173557] text-xl font-semibold text-white">{getInitials(form.fullName) || 'US'}</div>
              <p className="text-xs text-slate-500">Chưa hỗ trợ thay đổi ảnh đại diện.</p>
            </div>
            <Field id="profile-name" label="Họ và tên" error={errors.fullName}>
              <input id="profile-name" name="fullName" autoComplete="name" required maxLength={100} disabled={busy} value={form.fullName} onChange={updateField} className={inputClass} aria-invalid={!!errors.fullName} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="profile-phone" label="Số điện thoại" error={errors.phone}>
                <input id="profile-phone" name="phone" type="tel" autoComplete="tel" maxLength={15} pattern="[+]?[0-9]{9,15}" title="9–15 chữ số, có thể bắt đầu bằng +" disabled={busy} value={form.phone} onChange={updateField} className={inputClass} aria-invalid={!!errors.phone} />
              </Field>
              <Field id="profile-email" label="Email" error={errors.email}>
                <input id="profile-email" name="email" type="email" autoComplete="email" required maxLength={100} disabled={busy} value={form.email} onChange={updateField} className={inputClass} aria-invalid={!!errors.email} />
              </Field>
            </div>
            <Field id="profile-specialization" label="Chuyên môn" error={errors.specialization}>
              <input id="profile-specialization" name="specialization" maxLength={100} disabled={busy} value={form.specialization} onChange={updateField} className={inputClass} placeholder="Ví dụ: TOEIC, IELTS, tư vấn tuyển sinh..." aria-invalid={!!errors.specialization} aria-describedby={errors.specialization ? 'profile-specialization-error' : undefined} />
            </Field>
            {errors.general && <p role="alert" className="text-sm text-red-600">{errors.general}</p>}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" variant="primary" disabled={busy}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</Button>
            </div>
          </form>
        </section>
        <div className="min-w-0 space-y-5">
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800"><ShieldCheck size={18} />Thông tin tài khoản</h3>
            <dl className="space-y-4 text-sm">
              {accountFields.map(([label, value]) => (
                <div key={label}><dt className="mb-1 text-xs text-slate-400">{label}</dt><dd className="break-all font-medium text-slate-800">{value || '—'}</dd></div>
              ))}
              <div>
                <dt className="mb-1 text-xs text-slate-400">Trạng thái tài khoản</dt>
                <dd className={`font-medium ${authUser.status === 'Active' ? 'text-emerald-700' : 'text-red-600'}`}>{authUser.status === 'Active' ? 'Active' : authUser.status === 'Locked' ? 'Locked' : authUser.status}</dd>
              </div>
            </dl>
          </aside>
          <ProfileSalaryCard />
        </div>
      </div>
      <ProfileCertificates />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800"><LockKeyhole size={18} />Thay đổi mật khẩu</h3>
        <p className="mb-5 mt-1 text-sm text-slate-500">Mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu hiện tại.</p>
        <form onSubmit={savePassword} noValidate className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['currentPassword', 'Mật khẩu hiện tại', 'current-password'],
              ['newPassword', 'Mật khẩu mới', 'new-password'],
              ['confirmPassword', 'Xác nhận mật khẩu mới', 'new-password'],
            ].map(([name, label, autoComplete]) => (
              <Field key={name} id={name} label={label} error={passwordErrors[name]}>
                <div className="relative">
                  <input id={name} name={name} type={visiblePasswords[name] ? 'text' : 'password'} autoComplete={autoComplete} required maxLength={name === 'currentPassword' ? 255 : 72} disabled={busy} value={passwords[name]} onChange={(event) => {
                    setPasswords((current) => ({ ...current, [name]: event.target.value }));
                    setPasswordErrors({});
                  }} className={`${inputClass} pr-10`} aria-invalid={!!passwordErrors[name]} aria-describedby={passwordErrors[name] ? `${name}-error` : undefined} />
                  <button type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, [name]: !current[name] }))} aria-label={`${visiblePasswords[name] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={!!visiblePasswords[name]} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700">{visiblePasswords[name] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </Field>
            ))}
          </div>
          {passwordErrors.general && <p role="alert" className="text-sm text-red-600">{passwordErrors.general}</p>}
          <div className="flex justify-end border-t border-slate-100 pt-4"><Button type="submit" variant="primary" disabled={busy}>{changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</Button></div>
        </form>
      </section>
    </div>
  );
}
