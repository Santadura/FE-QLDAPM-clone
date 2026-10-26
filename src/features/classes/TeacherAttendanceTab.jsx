import { useEffect, useState } from "react";
import { classApi } from "../../services/classApi";

const choices = [
  { value: "PRESENT", label: "Có mặt" },
  { value: "ABSENT", label: "Vắng mặt" },
  { value: "LATE", label: "Đi muộn" },
];

const statusText = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng mặt",
  LATE: "Đi muộn",
};

const statusClass = {
  PRESENT: "bg-emerald-50 text-emerald-700",
  ABSENT: "bg-rose-50 text-rose-700",
  LATE: "bg-amber-50 text-amber-700",
};

function hasStarted(slot, now) {
  const date = String(slot.date ?? "").slice(0, 10);
  const time = String(slot.startTime ?? "").slice(0, 5);
  if (!date || !time) return false;
  const start = new Date(`${date}T${time}:00+07:00`).getTime();
  return Number.isFinite(start) && start <= now;
}

export default function TeacherAttendanceTab({ classId }) {
  const [rows, setRows] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setRows([]);
    setDrafts({});
    setError("");
    setSuccess("");
    setLoading(true);

    classApi.teacherAttendance(classId).then((data) => {
      if (!active) return;
      setRows(Array.isArray(data) ? data : []);
      setDrafts(Object.fromEntries(
        (Array.isArray(data) ? data : []).map((item) => [item.id, item.attendanceStatus || ""]),
      ));
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Không thể tải điểm danh giáo viên.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [classId]);

  async function save(slot) {
    const status = drafts[slot.id];
    if (slot.assignmentStatus !== "ASSIGNED" ||
        !status || savingId !== null || status === slot.attendanceStatus) return;
    setSavingId(slot.id);
    setError("");
    setSuccess("");
    try {
      const result = await classApi.markTeacherAttendance(classId, slot.id, status);
      setRows((previous) => previous.map((item) => item.id === slot.id
        ? {
            ...item,
            attendanceStatus: result.status,
            recordedAt: result.recordedAt,
            updatedAt: result.updatedAt,
            recordedByName: result.recordedByName,
          }
        : item));
      setSuccess(`Đã lưu điểm danh giáo viên ${slot.teacherName || slot.teacherId}.`);
    } catch (requestError) {
      setError(requestError.message || "Lưu điểm danh thất bại.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-3 pt-3" aria-label="Điểm danh giáo viên theo buổi">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Điểm danh giáo viên</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          CS được phân công hỗ trợ đúng buổi học có thể xác nhận giáo viên có mặt,
          vắng mặt hoặc đi muộn sau giờ bắt đầu buổi học.
          Thông tin này được lưu trên hệ thống để bộ phận công lương sử dụng về sau.
        </p>
      </div>

      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}
      {loading ? (
        <p className="text-xs text-slate-500">Đang tải lịch giảng dạy…</p>
      ) : !error && rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 p-4 text-xs text-slate-500">
          Lớp chưa có buổi học được phân công giáo viên.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((slot) => {
            const archived = slot.assignmentStatus === "CANCELLED";
            const activeAssignment = slot.assignmentStatus === "ASSIGNED";
            // Do not show an enabled Save button when an older/incompatible API
            // omits assignmentStatus. The BE must explicitly confirm ASSIGNED.
            const editable = activeAssignment && Boolean(slot.assignedToMe) && hasStarted(slot, now);
            const saved = slot.attendanceStatus;
            const chosen = drafts[slot.id] ?? saved ?? "";
            const changed = chosen && chosen !== saved;
            return (
              <article key={slot.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-[13px] font-semibold text-slate-800">
                      {slot.teacherName || slot.teacherId}
                    </strong>
                    <div className="mt-1 text-xs text-slate-500">
                      {String(slot.date).slice(0, 10)} · {String(slot.startTime).slice(0, 5)}–{String(slot.endTime).slice(0, 5)}
                    </div>
                    {archived && (
                      <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        Lịch sử giáo viên đã thay / buổi đã hủy — chỉ xem
                      </span>
                    )}
                    {!archived && !activeAssignment && (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        Không xác định được trạng thái phân công giáo viên từ BE.
                        Vui lòng cập nhật BE đồng bộ với FE trước khi điểm danh.
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${statusClass[saved] || "bg-slate-100 text-slate-600"}`}>
                    {statusText[saved] || "Chưa điểm danh"}
                  </span>
                </div>

                {!archived && (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="min-w-36 flex-1 text-xs font-medium text-slate-600">
                    Trạng thái
                    <select
                      aria-label={`Điểm danh ${slot.teacherName || slot.teacherId} ngày ${String(slot.date).slice(0, 10)}`}
                      className="mt-1 block h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] disabled:bg-slate-50"
                      value={chosen}
                      onChange={(event) => {
                        setDrafts((current) => ({ ...current, [slot.id]: event.target.value }));
                        setSuccess("");
                      }}
                      disabled={!editable || savingId !== null}
                    >
                      <option value="">Chọn trạng thái</option>
                      {choices.map((choice) => (
                        <option key={choice.value} value={choice.value}>{choice.label}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={() => save(slot)}
                    disabled={!editable || !changed || savingId !== null}
                    className="h-9 rounded-md bg-[#173557] px-3 text-xs font-semibold text-white hover:bg-[#21466d] disabled:cursor-not-allowed disabled:opacity-40">
                    {savingId === slot.id ? "Đang lưu..." : "Lưu điểm danh"}
                  </button>
                </div>
                )}
                {saved && slot.recordedByName && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Xác nhận bởi: {slot.recordedByName}
                  </p>
                )}
                {!archived && !slot.assignedToMe && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    Chỉ CS được CM phân công hỗ trợ buổi này mới có quyền điểm danh.
                  </p>
                )}
                {!archived && slot.assignedToMe && !hasStarted(slot, now) && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    Chỉ có thể điểm danh khi buổi học đã bắt đầu.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
