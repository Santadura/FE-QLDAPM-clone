import { ArrowDown, ArrowRight, BookOpen, Check, CreditCard, GraduationCap, Search, Target, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  { icon: Target, title: 'Lộ trình theo mục tiêu', description: 'TOEIC, IELTS, SAT, VSTEP và tiếng Anh giao tiếp, từ nền tảng đến nâng cao.' },
  { icon: BookOpen, title: 'Thông tin rõ ràng', description: 'Tìm hiểu nội dung, thời lượng và học phí trước khi lựa chọn.' },
  { icon: UserRound, title: 'Không gian học tập riêng', description: 'Xem lại các khóa đã đăng ký ngay trong Profile của bạn.' },
];
const steps = [
  { icon: Search, title: 'Khám phá khóa học', description: 'Xem danh sách và nội dung chi tiết để chọn khóa phù hợp. Bạn chưa cần đăng nhập ở bước này.' },
  { icon: UserRound, title: 'Đăng nhập hoặc đăng ký', description: 'Khi chọn mua, đăng nhập bằng tài khoản học viên. Chưa có tài khoản? Bạn có thể tạo mới ngay.' },
  { icon: CreditCard, title: 'Thanh toán và xem khóa học', description: 'Trải nghiệm thanh toán mô phỏng với MoMo hoặc VNPay, sau đó xem chi tiết khóa học trong Profile.' },
];

export default function UserLandingPage() {
  return (
    <>
      <section id="introduction" className="scroll-mt-40 border-b border-slate-200 bg-white md:scroll-mt-24" aria-labelledby="landing-heading">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700"><GraduationCap size={15} />IIG Learning · Learning Portal</p>
            <h1 id="landing-heading" className="text-4xl font-bold leading-[1.2] tracking-tight text-[#173557] sm:text-5xl lg:text-[52px]">Ngoại ngữ vững vàng.<br /><span className="text-blue-600">Tương lai rộng mở.</span></h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">Mỗi mục tiêu đều bắt đầu từ một lựa chọn. Tìm lộ trình tiếng Anh phù hợp và bắt đầu hành trình học tập của bạn cùng IIG Learning.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/courses" className="inline-flex min-h-11 items-center justify-center gap-3 rounded-md border border-[#173557] bg-[#173557] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Khám phá khóa học<ArrowRight size={16} /></Link>
              <a href="#journey" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cách đăng ký<ArrowDown size={15} /></a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              {['Xem khóa học tự do', 'Lựa chọn theo mục tiêu', 'Quản lý trong Profile'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check size={14} className="text-blue-600" />{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <section aria-label="Trải nghiệm học tập" className="grid gap-4 py-7 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-[#173557]"><Icon size={18} strokeWidth={1.6} /></span>
              <div><h2 className="text-[13px] font-semibold text-slate-800">{title}</h2><p className="mt-1.5 text-xs leading-6 text-slate-500">{description}</p></div>
            </div>
          ))}
        </section>
      </div>

      <section id="journey" aria-labelledby="journey-heading" className="scroll-mt-40 border-y border-slate-200 bg-white sm:scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="mb-7"><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Hành trình của bạn</p><h2 id="journey-heading" className="mt-2 text-2xl font-bold text-[#173557]">Bắt đầu với 3 bước đơn giản</h2></div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-5 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#173557]"><Icon size={17} /></span><span className="text-xl font-bold text-slate-300">0{index + 1}</span></div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-500">Phần thanh toán hiện là mô phỏng, không trừ tiền thật. Các khóa đăng ký thử được lưu trên trình duyệt theo tài khoản.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg bg-[#173557] px-6 py-8 text-white sm:px-8">
          <div><p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-blue-200">Bước tiếp theo là của bạn</p><h2 className="text-xl font-semibold sm:text-2xl">Sẵn sàng cho một khởi đầu mới?</h2><p className="mt-3 text-xs leading-6 text-blue-100">Khám phá nội dung trước, chọn lộ trình khi bạn đã sẵn sàng.</p></div>
          <Link to="/courses" className="inline-flex min-h-10 items-center justify-center gap-3 rounded-md border border-white bg-white px-4 text-[13px] font-semibold text-[#173557] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Tìm khóa học của bạn<ArrowRight size={16} /></Link>
        </section>
      </div>
    </>
  );
}
