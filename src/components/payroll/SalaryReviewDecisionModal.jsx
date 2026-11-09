import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

export default function SalaryReviewDecisionModal({ review, saving, error, onClose, onSubmit }) {
  const [note, setNote] = useState('')
  useEffect(() => setNote(''), [review?.id])
  if (!review) return null
  const approving = review.decision === 'APPROVE'
  const action = approving ? 'Phê duyệt' : 'Từ chối'
  return <Modal title={`${action} review lương`} onClose={onClose} maxWidth="max-w-md">
    <form className="font-review space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); onSubmit(note) }}>
      <div className={`rounded-lg border p-3 ${approving ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}>
        <p className="font-semibold text-slate-800">{review.employeeName}</p>
        <p className="mt-1 text-sm text-slate-600">{review.currentRank || 'Chưa gán bậc'} → <strong>{review.proposedRank}</strong></p>
      </div>
      <label className="block text-sm font-medium text-slate-700">{approving ? 'Ghi chú phê duyệt (không bắt buộc)' : 'Lý do từ chối'}<textarea autoFocus required={!approving} minLength={approving ? 0 : 5} maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)} className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder={approving ? 'Ví dụ: Áp dụng từ ngày duyệt.' : 'Nêu lý do để TC/CM có thể điều chỉnh và gửi lại…'} /></label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-lg border px-4 py-2 text-sm">Hủy</button><button disabled={saving} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${approving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>{saving ? 'Đang xử lý…' : action}</button></div>
    </form>
  </Modal>
}
