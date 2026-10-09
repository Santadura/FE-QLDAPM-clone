import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function StudentResultModal({
  classItem,
  students,
  assignments,
  exams,
  existingResults,
  onClose,
  onSave,
}) {
  const activities = useMemo(
    () => [
      ...assignments
        .filter((item) => item.status !== "CANCELLED")
        .map((item) => ({
          value: `assignment:${item.id}`,
          label: `Assignment · ${item.title} · ${item.status.toLowerCase()}`,
          assignmentId: item.id,
          examId: null,
        })),
      ...exams
        .filter((item) => item.status === "COMPLETED")
        .map((item) => ({
          value: `exam:${item.id}`,
          label: `Exam · ${item.title} · completed`,
          assignmentId: null,
          examId: item.id,
        })),
    ],
    [assignments, exams],
  );

  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [activityValue, setActivityValue] = useState(activities[0]?.value ?? "");
  const initialResult = existingResults.find(
    (item) =>
      item.studentId === (students[0]?.id ?? "") &&
      item.assignmentId === (activities[0]?.assignmentId ?? null) &&
      item.examId === (activities[0]?.examId ?? null),
  );
  const [score, setScore] = useState(initialResult?.score ?? "");
  const [feedback, setFeedback] = useState(initialResult?.feedback ?? "");

  const activity = activities.find((item) => item.value === activityValue);

  function loadExisting(nextStudentId, nextActivityValue) {
    const nextActivity = activities.find((item) => item.value === nextActivityValue);
    if (!nextActivity) return;
    const result = existingResults.find(
      (item) =>
        item.studentId === nextStudentId &&
        item.assignmentId === nextActivity.assignmentId &&
        item.examId === nextActivity.examId,
    );
    setScore(result?.score ?? "");
    setFeedback(result?.feedback ?? "");
  }

  function changeStudent(value) {
    setStudentId(value);
    loadExisting(value, activityValue);
  }

  function changeActivity(value) {
    setActivityValue(value);
    loadExisting(studentId, value);
  }

  function submit(event) {
    event.preventDefault();
    if (!studentId || !activity) return;
    onSave({
      studentId,
      classId: classItem.id,
      assignmentId: activity.assignmentId,
      examId: activity.examId,
      score,
      feedback,
    });
  }

  return (
    <Modal title="Record Student Result" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-3.5">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Student
          <select
            className={inputClass}
            value={studentId}
            onChange={(event) => changeStudent(event.target.value)}
            required
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentCode} · {student.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Assignment / Exam
          <select
            className={inputClass}
            value={activityValue}
            onChange={(event) => changeActivity(event.target.value)}
            required
          >
            {activities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Score
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min="0"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Feedback / evaluation
          <textarea
            className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />
        </label>

        {!activities.length && (
          <p className="text-xs text-amber-700">
            No gradable activity is available. Assignments must not be cancelled,
            and exams must be marked completed before results can be recorded.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!students.length || !activities.length}
          >
            Save Result
          </Button>
        </div>
      </form>
    </Modal>
  );
}
