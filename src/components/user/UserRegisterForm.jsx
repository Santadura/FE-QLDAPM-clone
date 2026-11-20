import { Link } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import Button from '../ui/Button';
import UserAuthField from './UserAuthField';
import { useUserAuthForm } from '../../features/user/useUserAuthForm';

export default function UserRegisterForm() {
  const { form, errors, pending, showPassword, togglePassword, change, submit, returnTo } = useUserAuthForm(true);
  return (
    <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
      <h1 className="mb-2 text-2xl font-bold text-[#1a365d]">Create an account</h1>
      <p className="mb-6 text-sm text-gray-500">Start your learning journey with IIG</p>
      <p className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-slate-600">Tạo tài khoản học viên để đăng ký khóa học. Tên đăng nhập gồm 3–50 ký tự, chỉ dùng chữ không dấu, số và dấu gạch dưới.</p>
      <form onSubmit={submit} className="space-y-5" noValidate aria-busy={pending}>
        <UserAuthField label="Username" name="username" icon={UserRound} autoComplete="username" required minLength={3} maxLength={50}
          value={form.username} onChange={change} disabled={pending} error={errors.username} placeholder="Choose a username" />
        <UserAuthField label="Email" name="email" icon={Mail} type="email" autoComplete="email" required maxLength={100}
          value={form.email} onChange={change} disabled={pending} error={errors.email} placeholder="you@example.com" />
        <UserAuthField label="Password" name="password" icon={LockKeyhole} password visible={showPassword} onToggle={togglePassword}
          autoComplete="new-password" required minLength={6} maxLength={72} value={form.password} onChange={change} disabled={pending} error={errors.password} placeholder="At least 6 characters" />
        <UserAuthField label="Confirm password" name="confirm" icon={LockKeyhole} password autoComplete="new-password" required maxLength={72}
          value={form.confirm} onChange={change} disabled={pending} error={errors.confirm} placeholder="Repeat your password" />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input name="remember" type="checkbox" checked={form.remember} onChange={change} disabled={pending} className="h-4 w-4 rounded border-gray-300 accent-[#1a365d]" />Remember me</label>
        {errors.general && <p role="alert" className="rounded-md border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">{errors.general}</p>}
        <Button type="submit" variant="primary" className="w-full py-2.5" disabled={pending}>{pending ? 'Processing...' : 'Create Account →'}</Button>
      </form>
      <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">Đã có tài khoản? <Link to="/user/login" state={{ returnTo }} className="font-medium text-[#1a365d] hover:underline">Sign in</Link></div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Đăng ký thành công sẽ tự đăng nhập và đưa bạn về khóa học đang mua, nếu có.</p>
    </section>
  );
}
