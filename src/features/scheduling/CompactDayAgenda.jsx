import { X } from "lucide-react";
import { visibleDayAgenda } from "./dayAgenda";

const styles = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  amber: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  blue: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
  slate: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
};

export function CompactDayAgenda({ items, name, date, active, onOpen }) {
  const { shown, remaining } = visibleDayAgenda(items);
  return (
    <div className={"flex min-h-0 flex-col gap-1 overflow-hidden border-l border-slate-200 p-1.5 " +
        (active ? "bg-blue-50/50" : "")}>
      {!items.length ? (
        <span className="m-auto text-xs text-slate-300">—</span>
      ) : (
        <>
          {shown.map((entry) => (
            <button key={entry.key} type="button"
              onClick={() => onOpen(entry.key)}
              aria-label={"Xem lịch " + name + " " + date + " " + entry.startTime + "-" + entry.endTime + " " + entry.status}
              className={"w-full min-w-0 rounded border px-1.5 py-1 text-left transition focus-visible:outline-2 focus-visible:outline-blue-600 " + styles[entry.color]}>
              <span className="block truncate text-[11px] font-semibold tabular-nums">{entry.startTime}–{entry.endTime}</span>
              <span className="block truncate text-[10px]">{entry.status}</span>
            </button>
          ))}
          {remaining > 0 && (
            <button type="button" onClick={() => onOpen(null)}
              aria-label={"Xem thêm " + remaining + " lịch " + name + " ngày " + date}
              className="w-full rounded px-1 py-0.5 text-left text-[11px] font-medium text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600">
              +{remaining} lịch khác
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function DayAgendaDetails({
  name, date, items, selectedKey, onClose,
  onChooseAvailability, onReview, onReplace, onCancel,
  replacementName, replacementIsDifferent,
}) {
  return (
    <section aria-label={"Chi tiết lịch " + name + " " + date}
      className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-slate-900">Chi tiết lịch · {date}</h4>
          <p className="mt-0.5 truncate text-[11px] text-slate-600">{name} · {items.length} mục</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết lịch"
          className="rounded p-1 text-slate-500 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {items.map((entry) => (
          <div key={entry.key}
            className={"rounded-md border bg-white p-2 " +
              (selectedKey === entry.key ? "border-blue-400 ring-1 ring-blue-100" : "border-slate-200")}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-semibold tabular-nums text-slate-900">{entry.startTime}–{entry.endTime}</span>
              <span className={"rounded px-1.5 py-0.5 text-[10px] " + styles[entry.color]}>{entry.status}</span>
            </div>
            {entry.subtitle && <p className="mt-1 break-words text-[11px] text-slate-600">{entry.subtitle}</p>}
            {entry.type === "availability" ? (
              <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                <button type="button" onClick={() => onChooseAvailability(entry.data)}
                  className="font-medium text-blue-700 underline underline-offset-2">Chọn lịch rảnh</button>
                {entry.data.status === "PENDING" && (
                  <>
                    <button type="button" onClick={() => onReview(entry.data, "APPROVED")}
                      className="text-emerald-700 underline underline-offset-2">Duyệt</button>
                    <button type="button" onClick={() => onReview(entry.data, "REJECTED")}
                      className="text-red-700 underline underline-offset-2">Từ chối</button>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <button type="button" disabled={!replacementIsDifferent}
                    title={!replacementIsDifferent ? "Chọn nhân sự thay thế ở danh sách trước" : undefined}
                    onClick={() => onReplace(entry.data)}
                    className="text-blue-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-slate-400">
                    Đổi nhân sự
                  </button>
                  <button type="button" onClick={() => onCancel(entry.data)}
                    className="text-rose-700 underline underline-offset-2">Hủy phân công</button>
                </div>
                {!replacementIsDifferent && (
                  <p className="text-[10px] text-slate-500">
                    Để đổi ca, chọn một nhân sự khác trong danh sách tuần.
                  </p>
                )}
                {replacementIsDifferent && replacementName && (
                  <p className="text-[10px] text-slate-500">Thay bằng: {replacementName}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
