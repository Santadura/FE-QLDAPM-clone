import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { useDemoPurchases } from '../../features/user/useDemoPurchases';
import { findUserCourse } from '../../data/userCourses';
import UserProfileOverview from '../../components/user/UserProfileOverview';
import UserProfileCourses from '../../components/user/UserProfileCourses';

export default function UserProfile() {
  const { authUser } = useAccountData();
  const purchases = useDemoPurchases(authUser.username);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const selected = purchases.find((purchase) => purchase.courseId === params.get('course')) || purchases[0];
  const course = selected ? findUserCourse(selected.courseId) : null;
  const purchaseSucceeded = location.state?.purchaseSuccess && purchases.some((purchase) => purchase.courseId === location.state.purchaseSuccess);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900">Thông tin cá nhân</h1>
          <p className="mt-1 text-sm text-slate-500">Cập nhật hồ sơ, xem thông tin tài khoản và các khóa học của bạn.</p>
        </div>
        <Link to="/courses" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Khám phá khóa học<ArrowUpRight size={15} /></Link>
      </div>
      {purchaseSucceeded && (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={20} className="shrink-0" />
          <div><p className="text-sm font-semibold">Thanh toán mô phỏng thành công!</p><p className="mt-1 text-xs leading-5">Khóa học đã được thêm vào hồ sơ của bạn. Không phát sinh giao dịch tiền thật.</p></div>
        </div>
      )}
      <UserProfileOverview key={authUser.username} account={authUser} courseCount={purchases.length} />
      <UserProfileCourses purchases={purchases} selected={selected} course={course} onSelect={(courseId) => setParams({ course: courseId }, { replace: true })} />
    </div>
  );
}
