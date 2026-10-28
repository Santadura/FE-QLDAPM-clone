import Modal from "../../components/ui/Modal";

export default function AssignmentConfirmDialog({
  action, personName, classCode, busy, onClose, onConfirm,
}) {
  if (!action) return null;

  const isCancel = action.kind === "cancel";
  const schedule = action.schedule;
  const title = isCancel ? "Xác nhận hủy phân công" : "Xác nhận đổi nhân sự";

  return (
    <Modal title={title} onClose={() => { if (!busy) onClose(); }}>
      <div className="space-y-4 text-sm">
        <p className="text-slate-700">
          {isCancel
            ? "Bạn muốn hủy phân công cho riêng buổi học này? Lịch sử phân công vẫn được giữ lại."
            : "Bạn muốn thay nhân sự cho riêng buổi học này? Lịch sử phân công cũ vẫn được giữ lại."}
        </p>
        <dl className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Nhân sự hiện tại</dt>
            <dd className="text-right font-medium text-slate-900">{personName || "—"}</dd>
          </div>
          {classCode && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Lớp</dt>
              <dd className="text-right font-medium text-slate-900">{classCode}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Ngày</dt>
            <dd className="font-medium tabular-nums text-slate-900">{schedule.date}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Thời gian</dt>
            <dd className="font-medium tabular-nums text-slate-900">{schedule.startTime}–{schedule.endTime}</dd>
          </div>
          {!isCancel && (
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-2">
              <dt className="text-slate-500">Thay bằng</dt>
              <dd className="text-right font-semibold text-blue-800">{action.targetName}</dd>
            </div>
          )}
        </dl>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" disabled={busy} onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Quay lại
          </button>
          <button type="button" disabled={busy} onClick={onConfirm}
            className={"rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 " +
              (isCancel ? "bg-rose-700 hover:bg-rose-800" : "bg-blue-700 hover:bg-blue-800")}>
            {busy ? "Đang xử lý..." : isCancel ? "Xác nhận hủy" : "Xác nhận đổi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
