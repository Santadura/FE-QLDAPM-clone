import { Link } from 'react-router-dom';
import { LockKeyhole, UserRound } from 'lucide-react';
import Button from '../ui/Button';
import UserAuthField from './UserAuthField';
import { useUserAuthForm } from '../../features/user/useUserAuthForm';

export default function UserLoginForm() {
  const { form, errors, pending, showPassword, togglePassword, change, submit, returnTo } = useUserAuthForm();
  return (
    <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
      <h1 className="mb-2 text-2xl font-bold text-[#1a365d]">Welcome back</h1>
      <p className="mb-8 text-sm text-gray-500">Sign in to your learning account</p>
      <form onSubmit={submit} className="space-y-6" noValidate aria-busy={pending}>
        <UserAuthField label="Username" name="username" icon={UserRound} autoComplete="username" required maxLength={50}
          value={form.username} onChange={change} disabled={pending} error={errors.username} placeholder="Your username" />
        <UserAuthField label="Password" name="password" icon={LockKeyhole} password visible={showPassword} onToggle={togglePassword}
          autoComplete="current-password" required maxLength={255} value={form.password} onChange={change} disabled={pending} error={errors.password} placeholder="••••••••" />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input name="remember" type="checkbox" checked={form.remember} onChange={change} disabled={pending} className="h-4 w-4 rounded border-gray-300 accent-[#1a365d]" />Remember me</label>
        {errors.general && <p role="alert" className="rounded-md border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">{errors.general}</p>}
        <Button type="submit" variant="primary" className="w-full py-2.5" disabled={pending}>{pending ? 'Processing...' : 'Sign In →'}</Button>
      </form>
      <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản? <Link to="/user/register" state={{ returnTo }} className="font-medium text-[#1a365d] hover:underline">Create an account</Link>
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Đăng nhập để tiếp tục đăng ký khóa học và xem các khóa đã mua trong Profile.</p>
    </section>
  );
}
