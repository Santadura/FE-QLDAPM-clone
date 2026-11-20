import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { coursePrice, findUserCourse } from '../../data/userCourses';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { completeDemoPurchase, useDemoPurchases } from '../../features/user/useDemoPurchases';

const methods = [
  { id: 'momo', label: 'MoMo', badge: 'mo', color: 'bg-[#a50064]' },
  { id: 'vnpay', label: 'VNPAY', badge: 'VN', color: 'bg-[#155596]' },
];

export default function UserCheckout() {
  const { courseId } = useParams();
  const { authUser, loggingOut } = useAccountData();
  const navigate = useNavigate();
  const purchases = useDemoPurchases(authUser.username);
  const [method, setMethod] = useState('momo');
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const pendingRef = useRef(false);
  const course = findUserCourse(courseId);
  const selected = methods.find((item) => item.id === method);
  if (!course) return <div className="p-20 text-center"><h1 className="text-xl font-bold">Không tìm thấy khóa học</h1><Link to="/courses" className="mt-4 inline-block underline">Về danh mục</Link></div>;
  if (purchases.some((row) => row.courseId === course.id)) return <Navigate to={`/user/profile?course=${course.id}`} replace />;

  function complete() {
    if (pendingRef.current || loggingOut) return;
    pendingRef.current = true;
    setPending(true);
    setError('');
    try {
      completeDemoPurchase(authUser.username, course.id, method);
      navigate(`/user/profile?course=${course.id}`, { replace: true, state: { purchaseSuccess: course.id } });
    } catch (err) { setError(err.message); }
    finally { pendingRef.current = false; setPending(false); }
  }

  return <div className="mx-auto max-w-2xl px-5 py-8 lg:py-10">
    <Link to="/courses" className="inline-flex items-center gap-2 text-xs text-slate-500"><ArrowLeft size={14} />Quay lại danh sách khóa học</Link>
    <div className="mb-6 mt-6"><h1 className="text-2xl font-bold text-[#173557]">Đăng ký khóa học</h1><p className="mt-2 text-sm text-slate-500">Xác nhận lựa chọn của bạn và chọn phương thức thanh toán.</p></div>
    <section aria-labelledby="registration-heading" className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm [overflow-wrap:anywhere] sm:p-6">
      <h2 id="registration-heading" className="border-b border-slate-100 pb-4 text-base font-semibold text-[#173557]">Thông tin đăng ký</h2>
      <p className="mt-5 text-xs font-semibold text-blue-600">{course.category}</p>
      <h3 className="mt-2 text-xl font-bold text-[#173557]">{course.title}</h3>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{course.level}</p>
      <p className="mt-1.5 whitespace-pre-line text-xs leading-6 text-slate-500">{course.description}</p>
      <dl className="my-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
        <div className="flex justify-between gap-4"><dt className="shrink-0 text-slate-500">Thời lượng</dt><dd className="min-w-0 text-right">{course.duration}</dd></div>
        <div className="flex justify-between gap-4"><dt className="shrink-0 text-slate-500">Số buổi</dt><dd className="min-w-0 text-right">{course.lessons} buổi</dd></div>
      </dl>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-[#173557]">Phương thức thanh toán</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {methods.map((item) => (
            <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${method === item.id ? 'border-[#173557] bg-blue-50' : 'border-slate-200'}`}>
              <input type="radio" name="payment-method" value={item.id} checked={method === item.id} onChange={() => { setMethod(item.id); setError(''); }} className="shrink-0 accent-[#173557]" />
              <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white ${item.color}`}>{item.badge}</span>
              <span className="min-w-0 text-sm font-semibold">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5 text-sm"><span>Tổng học phí mẫu</span><strong className="min-w-0 text-xl text-[#173557]">{coursePrice(course.price)}</strong></p>
      <button onClick={() => setConfirming(true)} disabled={loggingOut} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#173557] px-4 py-3 text-sm font-semibold text-white hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">Tiếp tục với {selected.label}<ArrowRight size={16} /></button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><LockKeyhole size={12} />Thanh toán mô phỏng · Không trừ tiền thật</p>
    </section>
    {confirming && <Modal title={`Thanh toán mô phỏng · ${selected.label}`} onClose={() => { if (!pending) setConfirming(false); }} maxWidth="max-w-lg">
      <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white ${selected.color}`}>{selected.badge}</span>
          <div className="min-w-0"><p className="font-semibold">{course.title}</p><p className="text-sm text-slate-500">{coursePrice(course.price)}</p></div>
        </div>
        <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">Bấm xác nhận để mô phỏng thanh toán thành công.</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <button className="rounded-lg border border-slate-200 px-4 py-3 text-sm" disabled={pending} onClick={() => setConfirming(false)}>Hủy</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#16324f] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={pending || loggingOut} onClick={complete}>{pending ? <CreditCard size={16} className="shrink-0" /> : <Check size={16} className="shrink-0" />}Xác nhận thanh toán mô phỏng</button>
        </div>
      </div>
    </Modal>}
  </div>;
}
