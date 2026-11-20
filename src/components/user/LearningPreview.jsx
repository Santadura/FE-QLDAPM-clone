import { ArrowRight, BookOpen, Clock3, GraduationCap, Layers, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { findUserCourse } from '../../data/userCourses';

export default function LearningPreview() {
  const course = findUserCourse('toeic-650');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <span className="flex items-center gap-2 text-xs font-semibold text-[#173557]"><BookOpen size={16} />Lộ trình gợi ý</span>
        <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700">TOEIC</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 rounded-lg bg-[#173557] p-5 text-white sm:p-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-200">Mục tiêu học tập</p>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.target}</p>
            <p className="mt-2 text-xs text-blue-100">Từng bước chinh phục cột mốc mới</p>
          </div>
          <GraduationCap size={50} strokeWidth={1.2} className="shrink-0 text-blue-200" aria-hidden="true" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            [Clock3, 'Thời lượng', course.duration],
            [Layers, 'Chương trình', `${course.lessons} buổi`],
            [Target, 'Trình độ', course.level],
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Icon size={15} className="mb-2 text-slate-400" aria-hidden="true" />
              <p className="text-xs font-semibold text-slate-800">{value}</p>
              <p className="mt-1 text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {course.syllabus.slice(0, 3).map((item, index) => (
            <div key={item} className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-[#173557]">0{index + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
      <Link to={`/checkout/${course.id}`} className="flex items-center justify-between gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-xs font-semibold text-[#173557] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:px-6">
        Đăng ký {course.title}<ArrowRight size={16} />
      </Link>
    </div>
  );
}
