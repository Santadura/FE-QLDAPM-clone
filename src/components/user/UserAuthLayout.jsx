import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { userReturnTo } from '../../features/user/authNavigation';

export default function UserAuthLayout({ children }) {
  const { authUser } = useAccountData();
  const location = useLocation();
  if (authUser) return <Navigate replace to={authUser.roleKey === 'USER'
    ? userReturnTo(location.state?.returnTo) : `/${authUser.roleKey.toLowerCase()}`} />;

  return (
    <div className="font-review flex min-h-screen flex-col bg-[#f8f9fa] text-slate-800">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#1a365d] px-3 py-1 font-bold text-white">I</span>
            <span className="text-lg font-bold text-[#1a365d]">IIG Learning</span>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden text-xs tracking-wider text-slate-500 sm:inline">LEARNING PORTAL</span>
          </Link>
          <Link to="/courses" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-[#1a365d]"><ArrowLeft size={14} />Về trang khóa học</Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:px-8">
        <p>© {new Date().getFullYear()} IIG Learning. All rights reserved.</p>
        <Link to="/login" className="hover:text-[#1a365d] hover:underline">Cổng đăng nhập nhân viên</Link>
      </footer>
    </div>
  );
}
