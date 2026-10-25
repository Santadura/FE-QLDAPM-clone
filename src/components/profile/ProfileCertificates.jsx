import { useEffect, useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { profileApi } from '../../services/profileApi';

const dateLabel = (value) => value ? value.split('-').reverse().join('/') : 'Chưa có thông tin';
const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const statuses = { ACTIVE: 'Đang sử dụng', INACTIVE: 'Ngừng sử dụng', EXPIRED: 'Hết hạn' };

function CertificateInfo({ label, children }) {
  return <div><dt className="mb-1 text-xs text-slate-400">{label}</dt><dd className="break-words text-sm text-slate-700">{children}</dd></div>;
}

export default function ProfileCertificates() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);

  useEffect(() => {
    let active = true;
    profileApi.certificates()
      .then((certificates) => { if (active) setState({ attempt, certificates }); })
      .catch((error) => { if (active) setState({ attempt, error: error.message || 'Không thể tải danh sách chứng chỉ.' }); });
    return () => { active = false; };
  }, [attempt]);

  const loading = state?.attempt !== attempt;
  const certificates = state?.certificates || [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="profile-certificates-heading">
      <h3 id="profile-certificates-heading" className="flex items-center gap-2 text-base font-semibold text-slate-800"><Award size={18} />Chứng chỉ của tôi</h3>
      <p className="mb-5 mt-1 text-sm text-slate-500">Xem chứng chỉ đã được lưu trong hồ sơ. Liên hệ người quản lý khi cần bổ sung hoặc chỉnh sửa.</p>
      {loading ? <p role="status" className="text-sm text-slate-500">Đang tải chứng chỉ...</p>
        : state.error ? <div role="alert" className="space-y-3 text-sm text-red-600"><p>{state.error}</p><Button type="button" onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button></div>
          : certificates.length === 0 ? <p className="text-sm text-slate-500">Bạn chưa có chứng chỉ trong hồ sơ.</p>
            : <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((certificate) => (
                <article key={certificate.certificateId} className="min-w-0 rounded-lg border border-slate-200 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="break-words text-sm font-semibold text-slate-800">{certificate.certificateType}</h4>
                    <span className={`rounded-full px-2 py-1 text-xs ${certificate.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{statuses[certificate.status] || certificate.status}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-4">
                    <CertificateInfo label="Điểm">{certificate.score == null ? '—' : numberFormat.format(certificate.score)}</CertificateInfo>
                    <CertificateInfo label="Điểm Speaking/Writing">{certificate.scoreSW == null ? '—' : numberFormat.format(certificate.scoreSW)}</CertificateInfo>
                    <CertificateInfo label="Ngày cấp">{dateLabel(certificate.issueDate)}</CertificateInfo>
                    <CertificateInfo label="Ngày hết hạn">{dateLabel(certificate.expiryDate)}</CertificateInfo>
                    <div className="col-span-2"><CertificateInfo label="Đơn vị cấp">{certificate.issuer || 'Chưa có thông tin'}</CertificateInfo></div>
                  </dl>
                  {/^https?:\/\//i.test(certificate.certificateUrl || '') && <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-700 underline"><ExternalLink size={14} />Xem chứng chỉ</a>}
                </article>
              ))}
            </div>}
    </section>
  );
}
