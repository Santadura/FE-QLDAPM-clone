import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import UserChatbox from './UserChatbox';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import styles from './UserLayout.module.css';

const primaryLink = 'inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border border-[#173557] bg-[#173557] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export default function UserLayout() {
  const { authUser, logout, loggingOut } = useAccountData();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const introductionActive = pathname === '/';
  const coursesActive = pathname === '/courses' || pathname.startsWith('/courses/') || pathname.startsWith('/checkout/');
  const navigationClass = (active) => `border-b-2 px-1 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${active ? 'border-[#173557] text-[#173557]' : 'border-transparent text-slate-500 hover:text-[#173557]'}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
      else window.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  async function signOut() {
    const result = await logout();
    if (!result.ok) toast.error(result.reason);
    else if (!result.sessionChanged) navigate('/');
  }

  return (
    <div className="font-review flex min-h-screen flex-col bg-[#F5F6F8] text-slate-800">
      <a href="#user-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:p-3 focus:text-sm">Đi đến nội dung chính</a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className={styles.headerInner}>
          <Link to="/" aria-label="IIG Learning - Trang chủ" className={styles.brand}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-950 text-sm font-bold text-white">IIG</span>
            <span className={`${styles.brandName} text-sm font-semibold leading-tight text-slate-900`}>IIG Learning<span className="mt-0.5 block text-[10px] font-normal text-slate-500">Learning Portal</span></span>
          </Link>
          <nav aria-label="Điều hướng chính" className={styles.navigation}>
            <Link to="/" aria-current={introductionActive ? 'page' : undefined} className={navigationClass(introductionActive)}>Giới thiệu</Link>
            <Link to="/courses" aria-current={coursesActive ? 'location' : undefined} className={navigationClass(coursesActive)}>Đăng ký khóa học</Link>
          </nav>
          <div className={styles.account}>
            {authUser ? <>
              <Link to={authUser.roleKey === 'USER' ? '/user/profile' : `/${authUser.roleKey.toLowerCase()}`}
                aria-label={authUser.roleKey === 'USER' ? 'Xem Profile của tôi' : 'Mở trang nhân viên'} title={authUser.username}
                className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#173557]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#173557]"><UserRound size={15} /></span>
                <span className={styles.username}>{authUser.username}</span>
              </Link>
              <Button onClick={signOut} disabled={loggingOut} aria-label="Đăng xuất" className="shrink-0 rounded-full px-3"><LogOut size={14} /><span className={styles.logoutLabel}>Đăng xuất</span></Button>
            </> : <>
              <span className="flex items-center gap-2 text-xs text-slate-500"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50"><UserRound size={15} /></span>Khách</span>
              <Link to="/user/login" className={primaryLink}>Đăng nhập</Link>
            </>}
          </div>
        </div>
      </header>

      <main id="user-main" className="flex-1" tabIndex={-1}><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-9 sm:grid-cols-[1fr_auto] lg:px-8">
          <div><p className="text-sm font-semibold text-[#173557]">IIG Learning</p><p className="mt-2 max-w-md text-xs leading-6 text-slate-500">Lựa chọn lộ trình tiếng Anh phù hợp và quản lý những khóa học của bạn tại một nơi.</p></div>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
            <Link to="/courses" className="hover:text-[#173557]">Khám phá khóa học</Link>
            <Link to="/#journey" className="hover:text-[#173557]">Cách đăng ký</Link>
            <Link to="/login" className="hover:text-[#173557]">Cổng nhân viên</Link>
          </nav>
        </div>
        <div className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-4 text-[11px] text-slate-400 lg:px-8"><p>© {new Date().getFullYear()} IIG Learning. All rights reserved.</p><p>Phiên bản trải nghiệm · Khóa học và học phí mẫu</p></div></div>
      </footer>
      <UserChatbox key={authUser?.username || 'guest'} />
    </div>
  );
}
