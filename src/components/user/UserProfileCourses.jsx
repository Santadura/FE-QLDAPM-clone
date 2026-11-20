import { BookOpen, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { coursePrice, findUserCourse } from '../../data/userCourses';

export default function UserProfileCourses({ purchases, selected, course, onSelect }) {
  return (
    <section aria-labelledby="user-courses-heading" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="user-courses-heading" className="text-base font-semibold text-slate-800">Khóa học của tôi</h2>
      </div>

      {!purchases.length ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <BookOpen size={32} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-800">Bạn chưa đăng ký khóa học nào</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">Chọn khóa học phù hợp để bắt đầu hành trình học tập.</p>
          <Link to="/courses" className="mt-5 inline-flex min-h-9 items-center justify-center rounded-md border border-[#173557] bg-[#173557] px-3.5 text-[13px] font-medium text-white hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Khám phá khóa học</Link>
        </div>
      ) : (
        <>
          {purchases.length > 1 && <nav aria-label="Chọn khóa học đã đăng ký" className="mt-3 flex flex-wrap gap-2">
            {purchases.map((purchase) => (
              <Button key={purchase.id} type="button" variant={purchase.courseId === course?.id ? 'primary' : 'secondary'} aria-pressed={purchase.courseId === course?.id}
                onClick={() => onSelect(purchase.courseId)} className="max-w-full py-2 text-left [overflow-wrap:anywhere]">
                <span className="min-w-0">{findUserCourse(purchase.courseId).title}</span>
              </Button>
            ))}
          </nav>}
          {course && (
            <article className="mt-3 min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm [overflow-wrap:anywhere] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Khóa học · {course.category}</p>
                  <h3 className="mt-1 text-lg font-bold text-[#173557]">{course.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{course.level} · {course.lessons} buổi học</p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-500">{course.description}</p>
                </div>
                <div className="min-w-0 sm:max-w-[40%] sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Học phí đã đăng ký</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">{coursePrice(selected.amount ?? course.price)}</p>
                </div>
              </div>
              <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <div className="min-w-0 rounded-lg border border-slate-200 px-3 py-3 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><CalendarDays size={13} className="shrink-0 text-rose-400" />Ngày đăng ký</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">{new Date(selected.purchasedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</dd>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-200 px-3 py-3 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><Clock3 size={13} className="shrink-0 text-blue-400" />Thời lượng</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">{course.duration}</dd>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-200 px-3 py-3 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><CheckCircle2 size={13} className="shrink-0 text-emerald-500" />Trạng thái</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-emerald-600">Đã đăng ký</dd>
                </div>
              </dl>
            </article>
          )}
        </>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-400">Khóa học mô phỏng chỉ được lưu theo tài khoản trên trình duyệt hiện tại, chưa phải xác nhận ghi danh thực tế.</p>
    </section>
  );
}
