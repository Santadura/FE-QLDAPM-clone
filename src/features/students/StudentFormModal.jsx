import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { courseTargetDefinitions } from "../academic/targetEligibility";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function StudentFormModal({
  student,
  targetDefinitions = courseTargetDefinitions,
  onClose,
  onSave,
  emptyForm,
}) {
  const [form, setForm] = useState(
    student
      ? {
          ...student,
          targets: student.targets ?? {},
        }
      : emptyForm,
  );

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateTarget(courseId, targetType, value) {
    setForm((current) => ({
      ...current,
      targets: {
        ...(current.targets ?? {}),
        [courseId]: {
          ...(current.targets?.[courseId] ?? {}),
          [targetType]: value,
        },
      },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSubmitError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      setSubmitError(error?.message || "Không thể lưu học sinh.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={student ? "Edit Student" : "Add Student"}
      onClose={() => { if (!saving) onClose(); }}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="grid gap-3.5">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Student code
          <input
            className={inputClass}
            name="studentCode"
            value={form.studentCode}
            onChange={update}
            required
            autoFocus
            placeholder="STU-2026-0001"
          />
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Full name
          <input
            className={inputClass}
            name="fullName"
            value={form.fullName}
            onChange={update}
            required
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Email <span className="text-slate-400">(optional)</span>
            <input
              className={inputClass}
              name="email"
              type="email"
              value={form.email}
              onChange={update}
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium">
            Phone <span className="text-slate-400">(optional)</span>
            <input
              className={inputClass}
              name="phone"
              value={form.phone}
              onChange={update}
            />
          </label>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3">
            <strong className="block text-[13px] font-medium text-slate-800">
              Course targets
            </strong>
            <span className="text-xs leading-5 text-slate-500">
              Targets are stored by course. A target from one course cannot be
              used to qualify the student for another course.
            </span>
          </div>

          <div className="grid gap-3">
            {Object.entries(targetDefinitions).map(
              ([courseId, definition]) => (
                <div
                  key={courseId}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <strong className="block text-[13px] font-medium text-slate-700">
                    {definition.courseLabel}
                  </strong>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {definition.scaleNote}
                  </span>
                  <div
                    className={`mt-2 grid gap-3 ${
                      definition.targets.length > 1 ? "sm:grid-cols-2" : ""
                    }`}
                  >
                    {definition.targets.map((target) => (
                      <label
                        key={target.type}
                        className="grid gap-1.5 text-[13px] font-medium"
                      >
                        {target.label}
                        <input
                          className={inputClass}
                          type="number"
                          min={target.min}
                          max={target.max}
                          step={target.step}
                          value={
                            form.targets?.[courseId]?.[target.type] ?? ""
                          }
                          onChange={(event) =>
                            updateTarget(
                              courseId,
                              target.type,
                              event.target.value,
                            )
                          }
                          placeholder={`${target.min}–${target.max}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
          Student status is managed from Student Detail so status changes follow
          the workflow and are audited separately.
        </div>

        {submitError && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700">{submitError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Đang lưu..." : student ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
