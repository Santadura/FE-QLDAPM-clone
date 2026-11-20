import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAccountData } from '../accounts/hooks/useAccountData';

export default function UserRoute({ children }) {
  const { authUser, profileLoading, profileError, reloadProfile } = useAccountData();
  const location = useLocation();
  const username = authUser?.roleKey === 'USER' ? authUser.username : null;
  useEffect(() => {
    if (username) reloadProfile();
  }, [username, location.pathname, reloadProfile]);
  if (!authUser) return <Navigate to="/user/login" replace state={{ returnTo: location.pathname }} />;
  if (authUser.roleKey !== 'USER') return <div className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">Dành cho tài khoản học viên</h1><p className="mt-4 text-slate-500">Bạn đang đăng nhập bằng tài khoản nhân viên. Hãy đăng xuất trước khi dùng tài khoản học viên.</p></div>;
  if (profileLoading) return <p role="status" className="px-6 py-20 text-center text-slate-500">Đang xác thực tài khoản...</p>;
  if (profileError) return <div role="alert" className="p-12 text-center"><p>{profileError}</p><button className="mt-4 underline" onClick={reloadProfile}>Thử lại</button></div>;
  return children;
}
