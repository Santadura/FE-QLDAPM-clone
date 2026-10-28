import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { assignableClassStatuses } from "../academic/targetEligibility";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function AssignStudentsModal({
  studentIds, students, classes, classStudents, getEligibility, loadCandidates,
  onClose, onAssign,
}) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [serverCandidates, setServerCandidates] = useState(null);
  const [loading, setLoading] = useState(Boolean(loadCandidates));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedStudents = useMemo(
    () => students.filter((student) => studentIds.includes(student.id)),
    [students, studentIds],
  );
  const availableClasses = useMemo(() =>
    classes
      .filter((item) => assignableClassStatuses.includes(item.status))
      .filter((item) => selectedStudents.some((student) =>
        !classStudents.some((rel) => rel.classId === item.id &&
          rel.studentId === student.id && rel.status === "ACTIVE"))),
    [classes, classStudents, selectedStudents],
  );
  const effectiveClassId = availableClasses.some((item) => item.id === classId)
    ? classId : availableClasses[0]?.id ?? "";
  const selectedClass = availableClasses.find((item) => item.id === effectiveClassId);

  useEffect(() => {
    if (!loadCandidates || !effectiveClassId) {
      setServerCandidates(null);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError("");
    setServerCandidates(null);
    loadCandidates(effectiveClassId)
      .then((rows) => { if (active) setServerCandidates(rows); })
      .catch((err) => { if (active) setError(err?.message || "Không thể kiểm tra điều kiện vào lớp."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadCandidates, effectiveClassId]);

  const evaluations = useMemo(() => {
    if (!selectedClass) return [];
    if (loadCandidates && !serverCandidates) return [];
    const candidates = new Map((serverCandidates ?? []).map((row) => [row.student.id, row]));
    return selectedStudents.map((student) => {
      const alreadyActive = classStudents.some((rel) =>
        rel.studentId === student.id && rel.classId === selectedClass.id && rel.status === "ACTIVE");
      const candidate = candidates.get(student.id);
      return {
        student, alreadyActive,
        eligibility: alreadyActive
          ? { eligible: true, reasons: [] }
          : loadCandidates
            ? candidate?.eligibility ?? { eligible: false, reasons: ["BE không trả về điều kiện của học sinh này."] }
            : getEligibility(student.id, selectedClass.id),
      };
    });
  }, [selectedStudents, selectedClass, classStudents, getEligibility, loadCandidates, serverCandidates]);

  const blocked = evaluations.filter((item) => !item.alreadyActive && !item.eligibility.eligible);
  const assignableCount = evaluations.filter((item) => !item.alreadyActive && item.eligibility.eligible).length;

  async function submit(event) {
    event.preventDefault();
    if (!effectiveClassId || loading || saving || error || blocked.length || !assignableCount) return;
    setSaving(true);
    setError("");
    try {
      await onAssign(effectiveClassId);
    } catch (err) {
      setError(err?.message || "Không thể thêm học sinh. Hãy kiểm tra điều kiện và thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Thêm học sinh vào lớp" onClose={() => { if (!saving) onClose(); }} maxWidth="max-w-xl">
      <form onSubmit={submit} className="grid gap-4">
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
          Đang chọn {selectedStudents.length} học sinh. Hệ thống đối chiếu trạng thái,
          mục tiêu khóa học và lịch học trùng với các lớp khác trước khi thêm.
        </p>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Lớp
          <select className={inputClass} value={effectiveClassId}
            onChange={(event) => setClassId(event.target.value)}
            disabled={!availableClasses.length || saving}>
            {availableClasses.map((item) => (
              <option key={item.id} value={item.id}>{item.classCode} · {item.name}</option>
            ))}
          </select>
        </label>
        {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="max-h-64 overflow-auto rounded-md border border-slate-200">
          {loading ? <p role="status" className="p-4 text-xs text-slate-500">Đang kiểm tra dữ liệu với hệ thống...</p>
            : evaluations.length ? evaluations.map(({ student, alreadyActive, eligibility }) => (
              <div key={student.id} className="border-b border-slate-100 px-3 py-2.5 last:border-0">
                <div className="flex justify-between gap-3 text-[13px]">
                  <div className="min-w-0">
                    <strong className="block truncate">{student.fullName}</strong>
                    <span className="font-mono text-xs text-slate-500">{student.studentCode}</span>
                  </div>
                  <span className={alreadyActive ? "text-slate-500" : eligibility.eligible ? "text-emerald-700" : "text-red-700"}>
                    {alreadyActive ? "Đã có trong lớp" : eligibility.eligible ? "Đủ điều kiện" : "Không đủ điều kiện"}
                  </span>
                </div>
                {!alreadyActive && !eligibility.eligible && (
                  <ul className="mt-2 space-y-1 text-xs text-red-700">
                    {eligibility.reasons?.map((reason, i) => <li key={i}>• {reason}</li>)}
                  </ul>
                )}
              </div>
            )) : <p className="p-4 text-xs text-slate-500">Không có học sinh hoặc lớp phù hợp.</p>}
        </div>
        {blocked.length > 0 && (
          <p className="text-xs leading-5 text-amber-800">
            {blocked.length} học sinh không đủ điều kiện. Hãy điều chỉnh danh sách chọn hoặc chọn lớp khác.
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{assignableCount} học sinh có thể thêm</span>
          <div className="flex gap-2">
            <Button type="button" onClick={onClose}>Quay lại</Button>
            <Button type="submit" variant="primary"
              disabled={!effectiveClassId || loading || saving || Boolean(error) || blocked.length > 0 || !assignableCount}>
              {saving ? "Đang thêm..." : "Thêm vào lớp"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
