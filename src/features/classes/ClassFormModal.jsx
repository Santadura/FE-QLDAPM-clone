import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { classStatuses, courses } from "./mockClasses";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function ClassFormModal({
  classItem,
  emptyForm,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(classItem ? { ...classItem } : emptyForm);
  const isEditing = Boolean(classItem);

  const invalidDateRange = useMemo(
    () =>
      Boolean(
        form.startDate &&
          form.endDate &&
          new Date(form.startDate) > new Date(form.endDate),
      ),
    [form.startDate, form.endDate],
  );

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (invalidDateRange) return;
    onSave(form);
  }

  return (
    <Modal
      title={isEditing ? "Edit Class" : "Create Class"}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="grid gap-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Class code
            <input
              className={inputClass}
              name="classCode"
              value={form.classCode}
              onChange={update}
              required
              autoFocus
              placeholder="IELTS-M75-04"
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium">
            Course
            <select
              className={inputClass}
              name="courseId"
              value={form.courseId}
              onChange={update}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Class name
          <input
            className={inputClass}
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="IELTS Mastery 7.5"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Start date
            <input
              className={inputClass}
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={update}
              required
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium">
            End date
            <input
              className={inputClass}
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={update}
              required
            />
          </label>
        </div>

        {invalidDateRange && (
          <p className="text-xs text-red-600">
            End date must be on or after start date.
          </p>
        )}

        <label className="grid gap-1.5 text-[13px] font-medium">
          Status
          <select
            className={inputClass}
            name="status"
            value={form.status}
            onChange={update}
          >
            {classStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>

        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Teacher assignment, students, schedules and assignments are linked
          through their own modules and are not stored directly on the Class
          record.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={invalidDateRange}>
            {isEditing ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
