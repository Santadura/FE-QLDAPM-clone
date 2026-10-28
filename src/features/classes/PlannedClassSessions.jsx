import { useEffect, useMemo, useState } from "react";
import { classApi } from "../../services/classApi";
import Modal from "../../components/ui/Modal";

const field =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800";
const action =
  "rounded-md border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-40";
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function dateOnly(value) {
  return String(value ?? "").slice(0, 10);
}

function slotKey(slot) {
  return `${dateOnly(slot.date)}|${String(slot.startTime).slice(0, 5)}|${String(slot.endTime).slice(0, 5)}`;
}

function normalized(slot) {
  return {
    date: dateOnly(slot.date),
    startTime: String(slot.startTime).slice(0, 5),
    endTime: String(slot.endTime).slice(0, 5),
    id: slot.id,
    status: slot.status || "PLANNED",
  };
}

function formatDay(value) {
  const date = new Date(`${value}T12:00:00`);
  return `${dayNames[date.getDay()]} · ${value}`;
}

// DRAFT can be saved without a timetable; READY requires planned sessions.
// A timetable belongs to the class, never to a particular teacher.
export default function PlannedClassSessions({
  classItem,
  canManage,
  teachingSchedules = [],
  supportSchedules = [],
  onChanged,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const [confirmingReschedule, setConfirmingReschedule] = useState(false);
  const [reason, setReason] = useState("");
  const [makeUp, setMakeUp] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [from, setFrom] = useState("18:00");
  const [to, setTo] = useState("20:00");
  const [singleDate, setSingleDate] = useState(classItem.startDate);
  const editable = canManage && ["DRAFT", "READY", "RUNNING"].includes(classItem.status);
  const canRemove = canManage && ["DRAFT", "READY"].includes(classItem.status);
  const canReschedule = canManage && classItem.status === "RUNNING";
  const today = new Date();
  const todayIso = [today.getFullYear(), String(today.getMonth()+1).padStart(2,"0"),
    String(today.getDate()).padStart(2,"0")].join("-");
  const plannedOnly = arrangedLater => arrangedLater.filter((s) => s.status === "PLANNED");

  useEffect(() => {
    let active = true;
    setSessions([]);
    setLoading(true);
    setError("");
    setDirty(false);
    setRescheduling(null);
    setConfirmingReschedule(false);
    setSingleDate(classItem.startDate);
    classApi.plannedSessions(classItem.id)
      .then((items) => {
        if (active) setSessions((items || []).map(normalized));
      })
      .catch((err) => {
        if (active) setError(err.message || "Không tải được lịch lớp.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [classItem.id, classItem.startDate, classItem.endDate, classItem.status]);

  const arranged = useMemo(
    () => [...sessions].sort((a, b) => slotKey(a).localeCompare(slotKey(b))),
    [sessions],
  );

  const assigned = useMemo(() => new Set(
    [...teachingSchedules, ...supportSchedules]
      .filter((item) => item.status === "ASSIGNED")
      .map(slotKey),
  ), [teachingSchedules, supportSchedules]);

  function append(items) {
    if (classItem.status === "RUNNING" && items.some((slot) =>
      new Date(`${slot.date}T${slot.startTime}:00+07:00`).getTime() <= Date.now()
    )) {
      setError("Lớp đang học chỉ được bổ sung buổi có giờ bắt đầu trong tương lai.");
      return;
    }
    const cancelled = new Set(sessions.filter((item) =>
      item.status === "CANCELLED").map(slotKey));
    if (items.some((item) => cancelled.has(slotKey(item)))) {
      setError("Lịch đề xuất trùng một buổi đã hủy. Không được khôi phục buổi đã hủy; hãy chọn ngày hoặc giờ khác.");
      return;
    }
    const existing = new Set(sessions.map(slotKey));
    const fresh = items.filter((item) => !existing.has(slotKey(item)));
    if (!fresh.length) {
      setMessage("Các buổi được chọn đã nằm trong lịch lớp; không có buổi mới để lưu.");
      setError("");
      return;
    }
    setError("");
    setMessage("");
    setSessions((current) => [...current, ...fresh]);
    setDirty(true);
  }

  function validate() {
    if (!from || !to || from >= to) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return false;
    }
    return true;
  }

  function addRecurring() {
    if (!validate()) return;
    const start = new Date(`${classItem.startDate}T12:00:00`);
    const end = new Date(`${classItem.endDate}T12:00:00`);
    const result = [];
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      if (day.getDay() === Number(weekday)) {
        const date = [
          day.getFullYear(),
          String(day.getMonth() + 1).padStart(2, "0"),
          String(day.getDate()).padStart(2, "0"),
        ].join("-");
        const proposed = { date, startTime: from, endTime: to };
        // Extending an ongoing course must not synthesize lessons in the past.
        if (classItem.status !== "RUNNING" ||
            new Date(`${date}T${from}:00+07:00`).getTime() > Date.now()) {
          result.push(proposed);
        }
      }
    }
    if (!result.length) {
      setError("Không có buổi tương lai phù hợp trong khoảng thời gian hiện tại của lớp.");
      return;
    }
    append(result);
  }

  function addOneOff() {
    if (!validate()) return;
    if (singleDate < classItem.startDate || singleDate > classItem.endDate) {
      setError("Ngày bổ sung phải nằm trong khoảng thời gian của lớp.");
      return;
    }
    append([{ date: singleDate, startTime: from, endTime: to }]);
  }

  function remove(item) {
    if (classItem.status === "READY" &&
        new Date(`${item.date}T${item.startTime}:00+07:00`).getTime() <= Date.now()) {
      setError("Buổi học đã qua cần giữ lịch sử; không thể xóa khỏi kế hoạch.");
      return;
    }
    if (!canRemove) {
      setError("Lớp đang học chỉ được bổ sung buổi tương lai; muốn dời/hủy phải dùng luồng điều chỉnh buổi.");
      return;
    }
    if (assigned.has(slotKey(item))) {
      setError("Buổi học đã có phân công. TC/CM phải hủy phân công trước khi đổi lịch.");
      return;
    }
    setSessions((current) => current.filter((row) => slotKey(row) !== slotKey(item)));
    setDirty(true);
    setError("");
    setMessage("");
  }

  async function save() {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const result = await classApi.savePlannedSessions(classItem.id, arranged.filter((s) => s.status === "PLANNED").map(
        (s) => ({date:s.date,startTime:s.startTime,endTime:s.endTime})
      ));
      setSessions((result || []).map(normalized));
      setDirty(false);
      await onChanged?.();
      setMessage("Đã lưu lịch học vào PostgreSQL. Các buổi vừa bổ sung vẫn chưa có nhân sự; TC/CM cần phân công thêm.");
    } catch (e) {
      setError(e?.message ?? "Không lưu được lịch học.");
    } finally {
      setSaving(false);
    }
  }

  function beginReschedule(item) {
    setConfirmingReschedule(false);
    setRescheduling(item);
    setReason("");
    setMakeUp(false);
    setNewDate(item.date);
    setNewFrom(item.startTime);
    setNewTo(item.endTime);
    setError("");
    setMessage("");
  }

  async function confirmReschedule() {
    if (!rescheduling || reason.trim().length < 5) {
      setError("Cần nhập lý do ít nhất 5 ký tự.");
      return;
    }
    if (makeUp && (!newDate || !newFrom || !newTo || newFrom >= newTo)) {
      setError("Ngày/giờ học bù không hợp lệ.");
      return;
    }
    setConfirmingReschedule(true);
  }

  async function applyReschedule() {
    if (!rescheduling || saving) return;
    setSaving(true);
    setError("");
    try {
      const next = await classApi.reschedule(classItem.id, {
        originalSessionId: rescheduling.id,
        newDate: makeUp ? newDate : null,
        newStartTime: makeUp ? newFrom : null,
        newEndTime: makeUp ? newTo : null,
        reason: reason.trim(),
      });
      setSessions((next || []).map(normalized));
      setRescheduling(null);
      setConfirmingReschedule(false);
      await onChanged?.();
      setMessage("Đã ghi nhận thay đổi lịch và hủy phân công cũ. TC/CM cần kiểm tra lại ca chưa được phân công.");
    } catch(e) {
      setConfirmingReschedule(false);
      setError(e?.message || "Không thể điều chỉnh buổi học.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Lịch học của lớp (chưa gắn giáo viên)</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Admin/CS lập lịch trước. Chỉ khi có ít nhất một buổi mới chuyển lớp sang READY.
          TC và CM phân công nhân sự dựa trên đúng các buổi này.
          {classItem.status === "RUNNING" &&
            " Lớp đang học chỉ được bổ sung buổi tương lai; muốn đổi/hủy buổi cũ hãy dùng quy trình điều chỉnh riêng."}
          Đổi ngày bắt đầu/kết thúc lớp không tự tạo, dời hay xóa những buổi học đã lưu.
          Nếu gia hạn lớp, hãy thêm buổi học và lưu lịch trước khi TC/CM phân công bổ sung.
        </p>
      </div>
      {loading ? <p className="text-xs">Đang tải lịch...</p> : null}
      {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
      {message ? <p role="status" className="text-xs text-emerald-700">{message}</p> : null}

      {editable && !loading ? (
        <div className="space-y-2 rounded-md bg-slate-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Giờ bắt đầu
              <input className={field} type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="text-xs">Giờ kết thúc
              <input className={field} type="time" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="text-xs">Thứ trong tuần
              <select className={field} value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={String(day)}>{dayNames[day]}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="button" className={action} onClick={addRecurring}>
                Thêm các buổi hàng tuần
              </button>
            </div>
            <label className="text-xs">Ngày học bổ sung
              <input className={field} type="date" min={classItem.startDate}
                max={classItem.endDate} value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)} />
            </label>
            <div className="flex items-end">
              <button type="button" className={action} onClick={addOneOff}>
                Thêm một buổi riêng
              </button>
            </div>
          </div>
          <button type="button" className={action} disabled={!dirty || saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu lịch dự kiến"}
          </button>
          {dirty ? <span className="ml-2 text-xs text-amber-700">Có thay đổi chưa lưu</span> : null}
        </div>
      ) : null}

      <div className="max-h-72 space-y-1 overflow-y-auto">
        {arranged.map((item) => (
          <div key={slotKey(item)}
            className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-1.5 text-xs">
            <span>{formatDay(item.date)} · {item.startTime}–{item.endTime}</span>
            <div className="flex items-center gap-2">
              {item.status === "CANCELLED" ?
                <span className="text-slate-400">Buổi đã hủy</span> :
                assigned.has(slotKey(item)) ?
                  <span className="text-emerald-700">Đã phân công</span> :
                  <span className="text-slate-500">Chưa phân công</span>}
              {canRemove && item.status === "PLANNED" &&
                (classItem.status !== "READY" ||
                new Date(`${item.date}T${item.startTime}:00+07:00`).getTime() > Date.now()) ?
                <button type="button" className="text-red-600 hover:underline"
                  onClick={() => remove(item)}>Bỏ</button> : null}
              {canReschedule && item.status === "PLANNED" && (item.date > todayIso || (item.date === todayIso && item.startTime > new Date().toTimeString().slice(0, 5))) ?
                <button type="button" className="text-blue-700 hover:underline"
                  onClick={() => beginReschedule(item)}>Nghỉ / dời buổi</button> : null}
            </div>
          </div>
        ))}
        {!arranged.length && !loading ?
          <p className="py-2 text-xs text-slate-500">Chưa có lịch học dự kiến.</p> : null}
      </div>
      {rescheduling && canReschedule ? (
        <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <h4 className="text-xs font-semibold">Điều chỉnh buổi {rescheduling.date} · {rescheduling.startTime}–{rescheduling.endTime}</h4>
          <p className="text-xs text-amber-800">Phân công Teacher/CS hiện tại của buổi cũ sẽ bị hủy và được ghi vào lịch sử.</p>
          <label className="block text-xs">Lý do bắt buộc
            <textarea className={field} value={reason} onChange={(e) => setReason(e.target.value)}
              minLength={5} maxLength={500} rows={2} />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={makeUp} onChange={(e) => setMakeUp(e.target.checked)} />
            Tạo thêm buổi học bù
          </label>
          {makeUp ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-xs">Ngày bù
                <input className={field} type="date" min={classItem.startDate}
                  max={classItem.endDate} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </label>
              <label className="text-xs">Giờ bắt đầu
                <input className={field} type="time" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
              </label>
              <label className="text-xs">Giờ kết thúc
                <input className={field} type="time" value={newTo} onChange={(e) => setNewTo(e.target.value)} />
              </label>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className={action} disabled={saving}
              onClick={confirmReschedule}>{saving ? "Đang xử lý..." : "Xác nhận điều chỉnh"}</button>
            <button type="button" className={action} onClick={() => setRescheduling(null)}>Đóng</button>
          </div>
        </div>
      ) : null}

      {confirmingReschedule && rescheduling && (
        <Modal title="Xác nhận nghỉ / dời buổi học" onClose={() => {
          if (!saving) setConfirmingReschedule(false);
        }}>
          <div className="space-y-4 text-sm">
            <p className="text-slate-700">
              Buổi học cũ và các phân công Teacher/CS của buổi đó sẽ bị hủy.
              {makeUp ? " Buổi học bù cần được TC/CM phân công nhân sự lại." : ""}
            </p>
            <dl className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <dt className="text-slate-500">Buổi hiện tại</dt>
                <dd className="font-medium text-slate-900">{rescheduling.date} · {rescheduling.startTime}–{rescheduling.endTime}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Lý do</dt>
                <dd className="break-words font-medium text-slate-900">{reason.trim()}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Lịch bù</dt>
                <dd className="font-medium text-slate-900">
                  {makeUp ? `${newDate} · ${newFrom}–${newTo}` : "Không tạo buổi bù"}
                </dd>
              </div>
            </dl>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" disabled={saving} onClick={() => setConfirmingReschedule(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Quay lại
              </button>
              <button type="button" disabled={saving} onClick={applyReschedule}
                className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:opacity-50">
                {saving ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
