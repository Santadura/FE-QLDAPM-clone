import Modal from "./Modal";

export default function ConfirmActionModal({
  title,
  description,
  detail,
  confirmLabel = "Xác nhận",
  busy = false,
  error = "",
  destructive = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal title={title} onClose={() => { if (!busy) onClose(); }}>
      <div className="space-y-4 text-sm">
        <p className="leading-6 text-slate-700">{description}</p>
        {detail && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900">
            {detail}
          </div>
        )}
        {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" disabled={busy} onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Quay lại
          </button>
          <button type="button" disabled={busy} onClick={onConfirm}
            className={`rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 ${destructive ? "bg-rose-700 hover:bg-rose-800" : "bg-[#173557] hover:bg-[#24486f]"}`}>
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
