import DetailPanel from '../ui/DetailPanel';
import Button from '../ui/Button';

export default function AccountDetailPanel({ account, onClose, onToggleLock, pending, isCurrentAccount }) {
  if (!account) return null;
  const fields = [
    ['Username', account.username],
    ['Employee ID', account.employeeId],
    ['Employee Code', account.code],
    ['Full name', account.user],
    ['Email', account.email],
    ['Phone', account.phone],
    ['Assigned role', account.role],
    ['Created date', account.createdDate],
  ];

  return (
    <DetailPanel title="Account Detail" onClose={onClose} footer={
      <div className="space-y-2">
        <Button className="w-full" onClick={onToggleLock} disabled={pending || isCurrentAccount}>
          {pending ? 'Đang cập nhật...' : account.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
        </Button>
        {isCurrentAccount && <p className="text-xs text-slate-500">Bạn không thể tự khóa tài khoản đang đăng nhập.</p>}
      </div>
    }>
      <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold text-[#173557]">Overview</h3>
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#173557] text-lg font-semibold text-white">{account.initials}</div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{account.user}</p>
          <p className="truncate text-xs text-slate-500">{account.username}</p>
          <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${account.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${account.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
            {account.status}
          </span>
        </div>
      </div>
      <dl className="space-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-[13px]">
            <dt className="shrink-0 text-slate-500">{label}</dt>
            <dd className="break-all text-right font-medium text-slate-900">{value || '—'}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Nếu cần vai trò khác, hãy cấp tài khoản mới.</p>
    </DetailPanel>
  );
}
