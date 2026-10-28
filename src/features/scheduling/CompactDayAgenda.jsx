import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { visibleDayAgenda } from "./dayAgenda";

const styles = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  amber: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  blue: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
  slate: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
};

// Render above the scrollable weekly grid: it must not change row height or
// be clipped by overflow-x-auto/overflow-hidden ancestors.
export function CompactDayAgenda({
  items, name, date,
  onChooseAvailability, onReview, onReplace, onCancel,
  replacementName, replacementIsDifferent,
}) {
  const [openKey, setOpenKey] = useState(null);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const { shown, remaining } = visibleDayAgenda(items);
  const opened = openKey !== null;
  const visibleDetails = openKey === "all"
    ? items
    : items.filter((entry) => entry.key === openKey);

  function close(restoreFocus = false) {
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    setOpenKey(null);
    setPosition(null);
  }

  function toggle(key, event) {
    if (openKey === key && triggerRef.current === event.currentTarget) {
      close();
      return;
    }
    triggerRef.current = event.currentTarget;
    setPosition(null);
    setOpenKey(key);
  }

  useLayoutEffect(() => {
    if (!opened) return undefined;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popover = popupRef.current;
      if (!trigger || !popover || !trigger.isConnected) {
        setOpenKey(null);
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const margin = 12;
      const gap = 6;
      const width = Math.min(340, window.innerWidth - margin * 2);
      const maxHeight = Math.min(400, window.innerHeight - margin * 2);
      const height = Math.min(popover.scrollHeight, maxHeight);
      const roomBelow = window.innerHeight - rect.bottom - margin;
      const roomAbove = rect.top - margin;
      const useAbove = roomBelow < height + gap && roomAbove > roomBelow;
      const desiredTop = useAbove ? rect.top - height - gap : rect.bottom + gap;
      const top = Math.max(margin, Math.min(desiredTop, window.innerHeight - height - margin));
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      setPosition((prev) =>
        prev?.top === top && prev?.left === left && prev?.width === width && prev?.maxHeight === maxHeight
          ? prev
          : { top, left, width, maxHeight });
    };
    const onOutsidePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) ||
          popupRef.current?.contains(event.target)) return;
      close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    updatePosition();
    document.addEventListener("pointerdown", onOutsidePointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [opened, openKey, items]);

  return (
    <div className="flex min-h-0 flex-col gap-1 overflow-hidden border-l border-slate-200 p-1.5">
      {!items.length ? (
        <span className="m-auto text-xs text-slate-300">—</span>
      ) : (
        <>
          {shown.map((entry) => (
            <button key={entry.key} type="button"
              aria-expanded={openKey === entry.key}
              aria-haspopup="dialog"
              aria-label={"Xem lịch " + name + " " + date + " " + entry.startTime + "-" + entry.endTime + " " + entry.status}
              onClick={(event) => toggle(entry.key, event)}
              className={"w-full min-w-0 rounded border px-1.5 py-1 text-left transition focus-visible:outline-2 focus-visible:outline-blue-600 " +
                styles[entry.color] + (openKey === entry.key ? " ring-2 ring-blue-400" : "")}>
              <span className="block truncate text-[11px] font-semibold tabular-nums">
                {entry.startTime}–{entry.endTime}
              </span>
              <span className="block truncate text-[10px]">{entry.status}</span>
            </button>
          ))}
          {remaining > 0 && (
            <button type="button"
              aria-expanded={openKey === "all"}
              aria-haspopup="dialog"
              onClick={(event) => toggle("all", event)}
              aria-label={"Xem thêm " + remaining + " lịch " + name + " ngày " + date}
              className="w-full rounded px-1 py-0.5 text-left text-[11px] font-medium text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600">
              +{remaining} lịch khác
            </button>
          )}
        </>
      )}
      {opened && visibleDetails.length > 0 && createPortal(
        <div ref={popupRef}
          className="z-[80] overflow-hidden rounded-lg border border-blue-200 bg-white shadow-xl"
          style={{
            position: "fixed",
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: position?.width ?? 340,
            maxHeight: position?.maxHeight ?? 400,
            visibility: position ? "visible" : "hidden",
          }}>
          <DayAgendaDetails
            name={name} date={date} items={visibleDetails} selectedKey={openKey}
            onClose={() => close(true)}
            onChooseAvailability={onChooseAvailability}
            onReview={onReview}
            onReplace={onReplace}
            onCancel={onCancel}
            replacementName={replacementName}
            replacementIsDifferent={replacementIsDifferent}
          />
        </div>,
        document.body,
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
    <section role="dialog" aria-modal="false" aria-label={"Chi tiết lịch " + name + " " + date}
      className="flex max-h-[inherit] flex-col p-3">
      <div className="mb-2 flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-slate-900">Chi tiết lịch · {date}</h4>
          <p className="mt-0.5 truncate text-[11px] text-slate-600">{name} · {items.length} mục</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết lịch"
          className="rounded p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
          <X size={16} />
        </button>
      </div>
      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
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
                  <p className="text-[10px] text-slate-500">Để đổi ca, chọn một nhân sự khác trong danh sách tuần.</p>
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
