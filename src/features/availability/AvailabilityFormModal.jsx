import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { applyAvailabilityShift, shiftDefinitions, weekDayDefinitions } from "./mockAvailability";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

export default function AvailabilityFormModal({
  value,
  emptyForm,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(value || emptyForm);

  useEffect(() => {
    setForm(value || emptyForm);
  }, [value, emptyForm]);

  function update(field, nextValue) {
    setForm((current) => ({ ...current, [field]: nextValue }));
  }

  function updateShift(nextShift) {
    setForm((current) => applyAvailabilityShift(current, nextShift));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.start || !form.end || form.start >= form.end) return;
    onSave(form);
  }

  return (
    <Modal
      title={value ? "Chỉnh sửa lịch rảnh" : "Thêm lịch rảnh"}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Ngày trong tuần</span>
            <select
              className={fieldClass}
              value={form.day}
              onChange={(event) => update("day", event.target.value)}
            >
              {weekDayDefinitions.map((day) => (
                <option key={day.key} value={day.key}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Ca</span>
            <select
              className={fieldClass}
              value={form.shift}
              onChange={(event) => updateShift(event.target.value)}
            >
              {shiftDefinitions.map((shift) => (
                <option key={shift.key} value={shift.key}>
                  {shift.label} · {shift.range}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Bắt đầu</span>
            <input
              className={fieldClass}
              type="time"
              value={form.start}
              onChange={(event) => update("start", event.target.value)}
              required
            />
          </label>
          <label>
            <span className={labelClass}>Kết thúc</span>
            <input
              className={fieldClass}
              type="time"
              value={form.end}
              onChange={(event) => update("end", event.target.value)}
              required
            />
          </label>
        </div>

        {form.start >= form.end && (
          <p className="text-xs text-red-600">
            Giờ kết thúc phải lớn hơn giờ bắt đầu.
          </p>
        )}

        <label>
          <span className={labelClass}>Loại lịch rảnh</span>
          <select
            className={fieldClass}
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option>Lịch rảnh định kỳ</option>
            <option>Lịch rảnh theo tuần</option>
          </select>
        </label>

        <label>
          <span className={labelClass}>Cơ sở</span>
          <select
            className={fieldClass}
            value={form.campus}
            onChange={(event) => update("campus", event.target.value)}
          >
            <option>Cơ sở chính</option>
            <option>Cơ sở Quận 1</option>
            <option>Cơ sở Quận 3</option>
          </select>
        </label>

        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={form.note}
            onChange={(event) => update("note", event.target.value)}
            placeholder="Ví dụ: có thể hỗ trợ dạy thay, ưu tiên cơ sở..."
          />
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!form.start || !form.end || form.start >= form.end}
          >
            {value ? "Lưu thay đổi" : "Gửi đăng ký"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
