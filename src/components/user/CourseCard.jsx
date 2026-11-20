import { Link } from 'react-router-dom';
import { BookOpen, Check, Clock3, Layers } from 'lucide-react';
import { coursePrice } from '../../data/userCourses';

export function CourseArtwork({ course, large = false }) {
  return (
    <div className={`relative min-w-0 shrink-0 overflow-hidden bg-blue-50 ${large ? 'min-h-64 rounded-lg p-7 sm:p-9' : 'h-32 border-b border-slate-200 p-3.5'}`}>
      <div className="flex items-center justify-between gap-3">
        <span title={course.category} className="max-w-full truncate rounded-md border border-blue-100 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-blue-700">{course.category}</span>
      </div>
      <div className={`flex items-center justify-between gap-3 ${large ? 'mt-8' : 'mt-3'}`}>
        <div className="min-w-0 flex-1">
          <h3 title={course.title} className={`line-clamp-2 font-bold tracking-tight text-[#173557] [overflow-wrap:anywhere] ${large ? 'text-3xl sm:text-4xl' : 'text-lg leading-snug'}`}>{course.title}</h3>
        </div>
        <span className={`flex shrink-0 items-center justify-center rounded-lg border border-white bg-white/70 ${large ? 'h-20 w-20' : 'h-8 w-8'}`}>
          <BookOpen size={large ? 36 : 20} strokeWidth={1.4} className="text-blue-500" aria-hidden="true" />
        </span>
      </div>
      {large && <p className="mt-5 line-clamp-2 text-xs text-slate-500 [overflow-wrap:anywhere]">{course.tag}</p>}
    </div>
  );
}

export default function CourseCard({ course, owned = false }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md motion-reduce:transition-none">
      <CourseArtwork course={course} />
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span title={course.level} className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">{course.level}</span>
          {owned && <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-700"><Check size={12} />Đã đăng ký</span>}
        </div>
        <div className="mt-1.5 min-h-15 flex-1">
          <p title={course.description} className="line-clamp-3 text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">{course.description}</p>
        </div>
        <div className="my-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="flex min-w-0 max-w-full items-center gap-1.5"><Clock3 size={14} className="shrink-0" /><span className="min-w-0 [overflow-wrap:anywhere]">{course.duration}</span></span>
          <span className="flex min-w-0 max-w-full items-center gap-1.5"><Layers size={14} className="shrink-0" /><span className="min-w-0 [overflow-wrap:anywhere]">{course.lessons} buổi học</span></span>
        </div>
        <div className="border-t border-slate-100 pt-2.5">
          <div><p className="mb-1 text-[10px] text-slate-400">Học phí trọn khóa · Mẫu</p><p className="text-base font-bold text-slate-900 [overflow-wrap:anywhere]">{coursePrice(course.price)}</p></div>
          <Link to={owned ? `/user/profile?course=${course.id}` : `/checkout/${course.id}`}
            aria-label={owned ? `Xem khóa học đã đăng ký: ${course.title}` : `Đăng ký khóa học: ${course.title}`}
            className="mt-3 flex min-h-9 w-full items-center justify-center rounded-md border border-[#173557] bg-[#173557] px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {owned ? 'Xem khóa học đã đăng ký' : 'Đăng ký khóa học'}
          </Link>
        </div>
      </div>
    </article>
  );
}
