import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AvailabilityFormModal from "../features/availability/AvailabilityFormModal";
import AvailabilityView from "../features/availability/AvailabilityView";
import Modal from "../components/ui/Modal";
import { emptyAvailabilityForm } from "../features/availability/mockAvailability";
import { useAccountData } from "../features/accounts/hooks/useAccountData";
import { schedulingApi } from "../services/api";
import { addDays, days, iso, mondayOf } from "../features/scheduling/schedulingUtils";
import {
  availabilityStatusToUi,
  availabilityTypeToApi,
  availabilityTypeToUi,
  buildWeekDays,
  formatWeekLabel,
  normalizeAvailability,
} from "../features/scheduling/schedulingApiAdapters";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AvailabilityRegister() {
  const { authUser } = useAccountData();
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [slots, setSlots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const requestVersion = useRef(0);
  const weekRef = useRef(iso(weekStart));
  weekRef.current = iso(weekStart);

  const loadAvailability = useCallback(async () => {
    const requestedWeek = iso(weekStart);
    const requestId = ++requestVersion.current;
    setLoading(true);
    setError("");

    try {
      const rows = await schedulingApi.mineAvailability(iso(weekStart));
      if (requestId !== requestVersion.current || requestedWeek !== weekRef.current) return;
      const next = (Array.isArray(rows) ? rows : []).map((row) => {
        const item = normalizeAvailability(row, authUser?.roleKey);
        return {
          id: item.id,
          day: item.day,
          shift: item.shift,
          start: item.startTime,
          end: item.endTime,
          status: availabilityStatusToUi(item.status),
          type: availabilityTypeToUi(item.availabilityType),
          campus: item.campus,
          note: item.note,
          availableDate: item.availableDate,
          submittedAt: formatDateTime(item.createdAt),
          reviewedAt: formatDateTime(item.reviewedAt),
        };
      });

      setSlots(next);
      setSelectedId((current) =>
        next.some((slot) => slot.id === current) ? current : next[0]?.id || null,
      );
    } catch (requestError) {
      if (requestId !== requestVersion.current || requestedWeek !== weekRef.current) return;
      setSlots([]);
      setSelectedId(null);
      setError(requestError?.message || "Không thể tải lịch rảnh.");
    } finally {
      if (requestId === requestVersion.current && requestedWeek === weekRef.current) setLoading(false);
    }
  }, [weekStart, authUser?.roleKey]);

  useEffect(() => {
    loadAvailability();
    return () => { requestVersion.current += 1; };
  }, [loadAvailability]);

  async function saveAvailability(form) {
    setError("");
    setActionMessage("");

    const dayIndex = days.indexOf(form.day);
    const body = {
      dayOfWeek: form.day,
      shift: form.shift,
      startTime: form.start,
      endTime: form.end,
      availabilityType: availabilityTypeToApi(form.type),
      availableDate:
        availabilityTypeToApi(form.type) === "WEEKLY" && dayIndex >= 0
          ? (editing?.availableDate && editing.day === form.day
              ? editing.availableDate
              : iso(addDays(weekStart, dayIndex)))
          : null,
      campus: form.campus,
      note: form.note,
    };

    try {
      if (editing) {
        await schedulingApi.updateAvailability(editing.id, body);
        setActionMessage("Đã cập nhật lịch rảnh.");
      } else {
        await schedulingApi.createAvailability(body);
        setActionMessage("Đã gửi lịch rảnh.");
      }

      setEditing(undefined);
      await loadAvailability();
    } catch (requestError) {
      setError(requestError?.message || "Không thể lưu lịch rảnh.");
    }
  }

  function deleteAvailability(id) {
    const target = slots.find((slot) => slot.id === id);
    if (target) setDeleteTarget(target);
  }

  async function confirmDeleteAvailability() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError("");
    setActionMessage("");

    try {
      await schedulingApi.removeAvailability(deleteTarget.id);
      setDeleteTarget(null);
      setActionMessage("Đã xóa lịch rảnh.");
      await loadAvailability();
    } catch (requestError) {
      setDeleteTarget(null);
      setError(requestError?.message || "Không thể xóa lịch rảnh.");
    } finally {
      setDeleting(false);
    }
  }

  function moveWeek(offset) {
    setEditing(undefined);
    setActionMessage("");
    setWeekStart((current) => addDays(current, offset));
  }

  return (
    <>
      <AvailabilityView
        slots={slots}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setEditing(null)}
        onEdit={setEditing}
        onDelete={deleteAvailability}
        onResetDemo={loadAvailability}
        weekDays={weekDays}
        weekLabel={formatWeekLabel(weekStart)}
        onPreviousWeek={() => moveWeek(-7)}
        onNextWeek={() => moveWeek(7)}
        loading={loading}
        error={error}
        actionMessage={actionMessage}
        personName={authUser?.user || authUser?.username || "Tài khoản hiện tại"}
        roleLabel={authUser?.role || authUser?.roleKey || ""}
      />

      {editing !== undefined && (
        <AvailabilityFormModal
          value={editing}
          emptyForm={emptyAvailabilityForm}
          onClose={() => setEditing(undefined)}
          onSave={saveAvailability}
        />
      )}

      {deleteTarget && (
        <Modal title="Xác nhận xóa lịch rảnh" onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}>
          <div className="space-y-4 text-sm">
            <p className="text-slate-700">
              Bạn có chắc muốn xóa lịch rảnh này?
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">
                {deleteTarget.availableDate || deleteTarget.day}
              </p>
              <p className="mt-1 font-medium tabular-nums text-slate-700">
                {deleteTarget.start}–{deleteTarget.end}
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Quay lại
              </button>
              <button type="button" disabled={deleting} onClick={confirmDeleteAvailability}
                className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:opacity-50">
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
