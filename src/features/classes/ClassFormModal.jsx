import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { courses as fallbackCourses } from "./mockClasses";
import {
  courseTargetDefinitions,
  getCourseTargetDefinition,
} from "../academic/targetEligibility";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function ClassFormModal({
  classItem,
  emptyForm,
  courseOptions = fallbackCourses,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    classItem
      ? {
          ...classItem,
          requiredTargets: classItem.requiredTargets ?? {},
        }
      : { ...emptyForm, status: "DRAFT" },
  );
  const isEditing = Boolean(classItem);
  const definition = getCourseTargetDefinition(form.courseId);

  const invalidDateRange = useMemo(
    () =>
      Boolean(
        form.startDate &&
          form.endDate &&
          new Date(form.startDate) > new Date(form.endDate),
      ),
    [form.startDate, form.endDate],
  );

  const missingRequiredTarget =
    !definition ||
    definition.targets.some(
      (target) =>
        form.requiredTargets?.[form.courseId]?.[target.type] === "" ||
        form.requiredTargets?.[form.courseId]?.[target.type] == null,
    );

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateRequiredTarget(targetType, value) {
    setForm((current) => ({
      ...current,
      requiredTargets: {
        ...(current.requiredTargets ?? {}),
        [current.courseId]: {
          ...(current.requiredTargets?.[current.courseId] ?? {}),
          [targetType]: value,
        },
      },
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (invalidDateRange || missingRequiredTarget) return;
    onSave({
      ...form,
      status: isEditing ? classItem.status : "DRAFT",
    });
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
              {courseOptions.map((course) => (
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

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2">
            <strong className="block text-[13px] font-medium text-slate-800">
              Required {definition?.courseLabel ?? "course"} target
            </strong>
            <span className="text-xs leading-5 text-slate-500">
              A student must have a target for this same course and meet every
              required threshold before being added to the class.
              {definition?.scaleNote ? ` ${definition.scaleNote}.` : ""}
            </span>
          </div>

          {definition ? (
            <div
              className={`grid gap-3 ${
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
                      form.requiredTargets?.[form.courseId]?.[target.type] ?? ""
                    }
                    onChange={(event) =>
                      updateRequiredTarget(target.type, event.target.value)
                    }
                    required
                    placeholder={`${target.min}–${target.max}`}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-600">
              No target model is configured for this course.
            </p>
          )}
        </div>

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

        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Status is managed by the class workflow. New classes start as
          <strong className="ml-1 text-slate-700">Draft</strong>.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={invalidDateRange || missingRequiredTarget}
          >
            {isEditing ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
