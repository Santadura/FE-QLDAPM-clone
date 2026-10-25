import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import Button from '../ui/Button';
import { profileApi } from '../../services/profileApi';

const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export default function ProfileSalaryCard() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);

  useEffect(() => {
    let active = true;
    profileApi.salary()
      .then((salary) => { if (active) setState({ attempt, salary }); })
      .catch((error) => { if (active) setState({ attempt, error: error.message || 'Không thể tải thông tin lương.' }); });
    return () => { active = false; };
  }, [attempt]);

  const loading = state?.attempt !== attempt;
  const salary = state?.salary;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="profile-salary-heading">
      <h3 id="profile-salary-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800"><Wallet size={18} />Thông tin lương hiện tại</h3>
      {loading ? <p role="status" className="text-sm text-slate-500">Đang tải thông tin lương...</p>
        : state.error ? <div role="alert" className="space-y-3 text-sm text-red-600"><p>{state.error}</p><Button type="button" onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button></div>
          : !salary?.salaryRankId ? <p className="text-sm text-slate-500">Bạn chưa được gán bậc lương.</p>
            : <dl className="space-y-4 text-sm">
              <div><dt className="mb-1 text-xs text-slate-400">Bậc lương hiện tại</dt><dd className="break-words font-medium text-slate-800">{salary.salaryRank || '—'}</dd></div>
              <div><dt className="mb-1 text-xs text-slate-400">Mức lương theo bậc</dt><dd className="font-semibold text-[#173557]">{salary.amount == null ? '—' : numberFormat.format(salary.amount)}</dd></div>
              <div><dt className="mb-1 text-xs text-slate-400">Ngày xét bậc gần nhất</dt><dd className="font-medium text-slate-800">{salary.reviewedDate ? salary.reviewedDate.split('-').reverse().join('/') : 'Chưa có thông tin'}</dd></div>
            </dl>}
    </section>
  );
}
