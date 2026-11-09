import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))

export default function SalaryReviewRequestModal({ employee, profile, ranks, loading, saving, error, onClose, onSubmit }) {
  const [rankId, setRankId] = useState('')
  const [reason, setReason] = useState('')
  useEffect(() => { setRankId(''); setReason('') }, [employee?.id])
  if (!employee) return null
  const selected = ranks.find((rank) => rank.id === rankId)
  const direction = (rank) => Number(rank.amount) > Number(profile?.currentAmount || 0) ? 'Tăng' : Number(rank.amount) < Number(profile?.currentAmount || 0) ? 'Giảm' : 'Giữ nguyên'
  return <Modal title="Tạo yêu cầu review lương" onClose={onClose} maxWidth="max-w-lg">
    <form onSubmit={(event) => { event.preventDefault(); onSubmit({ proposedSalaryRankId: rankId, reason }) }} className="font-review space-y-4 p-5">
      <div className="rounded-lg bg-slate-50 p-3"><div className="font-semibold text-slate-800">{employee.name}</div><div className="text-xs text-slate-500">{employee.code} · {employee.role}</div></div>
      {loading ? <p className="text-sm text-slate-500">Đang tải mức lương hiện tại…</p> : <><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Bậc hiện tại</div><div className="mt-1 font-semibold">{profile?.currentRank || 'Chưa có bậc lương'}</div></div><div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Lương hiện tại / giờ</div><div className="mt-1 font-semibold">{money(profile?.currentAmount)}</div></div></div>{profile?.usingDefaultRank && <p className="text-xs text-amber-700">Nhân viên chưa được gán bậc riêng; đang hiển thị mức khởi tạo thấp nhất theo vai trò.</p>}</>}
      <label className="block text-sm font-medium text-slate-700">Bậc lương đề xuất<select required value={rankId} onChange={(event) => setRankId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"><option value="">Chọn bậc lương</option>{ranks.map((rank) => <option key={rank.id} value={rank.id}>{direction(rank)} · {rank.rank} — {money(rank.amount)}/giờ</option>)}</select></label>
      {selected && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{direction(selected)}: <strong>{money(selected.amount)}/giờ</strong></div>}
      <label className="block text-sm font-medium text-slate-700">Lý do xem xét tăng lương<textarea required minLength="5" maxLength="2000" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" placeholder="Nêu kết quả công việc, thâm niên hoặc lý do đề xuất…" /></label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Hủy</button><button disabled={saving || loading || !rankId || !reason.trim()} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Gửi Admin duyệt</button></div>
    </form>
  </Modal>
}
