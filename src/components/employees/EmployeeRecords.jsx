import Button from '../ui/Button';
import { useEmployeeRecords } from '../../features/employees/hooks/useEmployeeRecords';
import { formatDate, formatNumber } from '../../features/employees/employeeHelpers';

function RecordList({ rows, children, empty = 'No records available.' }) {
  return rows.length ? <div className="space-y-3">{rows.map(children)}</div> : <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
}

const safeLink = (value) => /^https?:\/\//i.test(value || '') ? value : null;

export default function EmployeeRecords({ employeeId, resource, weekStart, revision, onCertificate, pending }) {
  const { rows, loading, error, retry } = useEmployeeRecords(employeeId, resource, weekStart, revision);
  if (loading) return <p role="status" className="py-6 text-sm text-slate-500">Loading records...</p>;
  if (error) return <div role="alert" className="space-y-3 text-sm text-red-600"><p>{error}</p><Button onClick={retry}>Retry</Button></div>;
  const card = 'space-y-1 rounded-md border border-slate-200 p-3 text-xs text-slate-600';

  if (resource === 'schedules') return (
    <RecordList rows={rows} empty="No assignments this week.">{(row) => (
      <article key={row.id} className={card}>
        <p className="font-semibold text-slate-800">{formatDate(row.date)} · {row.startTime}–{row.endTime}</p>
        <p>{row.className || row.workplace || 'Work shift'}{row.classCode ? ` · ${row.classCode}` : ''}</p>
        <p>{row.type} · {row.status}</p>
      </article>
    )}</RecordList>
  );
  if (resource === 'salaries') return (
    <>
      <p className="mb-3 text-xs text-slate-500">Đây là các kỳ lương đã lưu. Thay đổi bậc lương không tự tính lại các khoản này.</p>
      <RecordList rows={rows} empty="No payroll records for this employee.">{(row) => (
        <article key={`${row.source}:${row.id}`} className={card}>
          <p className="flex justify-between gap-2 font-semibold text-slate-800"><span>Period {row.period}</span><span>{formatNumber(row.amount)}</span></p>
          <p>{formatNumber(row.totalHours)} hours · {row.units} {row.source === 'STAFF' ? 'shifts' : 'sessions'}</p>
          <p>Rate: {formatNumber(row.rate)} · {row.status}</p>
          {row.detailAmount != null && <p>Saved detail amount: {formatNumber(row.detailAmount)} · Hourly rate: {formatNumber(row.detailRate)}</p>}
          <p>Source: {row.source === 'STAFF' ? 'Staff payroll' : 'Employee/teaching payroll'}</p>
        </article>
      )}</RecordList>
    </>
  );
  if (resource === 'availabilities') return (
    <RecordList rows={rows} empty="No registered availability this week.">{(row) => (
      <article key={row.id} className={card}>
        <p className="font-semibold text-slate-800">{row.date ? formatDate(row.date) : `${row.day} (weekly)`} · {row.startTime}–{row.endTime}</p>
        <p>{row.campus || 'Campus not specified'}{row.shift ? ` · ${row.shift}` : ''} · {row.status}</p>
        {row.note && <p>{row.note}</p>}
      </article>
    )}</RecordList>
  );
  if (resource === 'certificates') return (
    <>
      <Button className="mb-4 w-full" onClick={() => onCertificate(null)} disabled={pending}>Add Certificate</Button>
      <RecordList rows={rows} empty="No certificates for this employee.">{(row) => (
        <article key={row.certificateId} className={card}>
          <p className="font-semibold text-slate-800">{row.certificateType}</p>
          <p>Score: {formatNumber(row.score)} · SW: {formatNumber(row.scoreSW)}</p>
          <p>Issuer: {row.issuer || '—'}</p>
          <p>Issued: {formatDate(row.issueDate)}</p><p>Expires: {formatDate(row.expiryDate)}</p>
          <p>Status: {row.status === 'ACTIVE' ? 'Active' : row.status === 'INACTIVE' ? 'Inactive' : row.status}</p>
          <div className="flex items-center justify-between gap-2 pt-2">
            {safeLink(row.certificateUrl) && <a href={row.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">View Certificate</a>}
            <Button className="ml-auto" disabled={pending} onClick={() => onCertificate(row)}>Edit</Button>
          </div>
        </article>
      )}</RecordList>
    </>
  );
  return (
    <>
      <p className="mb-3 text-xs text-slate-500">Hiển thị tối đa 100 thao tác gần nhất đã được hệ thống ghi nhận.</p>
      <RecordList rows={rows}>{(row) => <article key={row.id} className={card}>
        <p className="font-semibold text-slate-800">{row.action}</p>
        <p>{row.description}</p><p>{row.createdAt} · {row.username || 'System'}</p>
      </article>}</RecordList>
    </>
  );
}
