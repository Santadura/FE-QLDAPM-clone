import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function AddClassStudentsModal({
  classItem,
  students,
  classStudents,
  getEligibility,
  loadCandidates,
  onClose,
  onAdd,
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [serverCandidates, setServerCandidates] = useState(null);
  const [loading, setLoading] = useState(Boolean(loadCandidates));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!loadCandidates) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    loadCandidates(classItem.id)
      .then((rows) => {
        if (!cancelled) setServerCandidates(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Could not load student candidates.");
          setServerCandidates([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadCandidates, classItem.id]);

  const currentIds = useMemo(
    () =>
      new Set(
        classStudents
          .filter(
            (relation) =>
              relation.classId === classItem.id && relation.status === "ACTIVE",
          )
          .map((relation) => relation.studentId),
      ),
    [classStudents, classItem.id],
  );

  const candidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (serverCandidates) {
      return serverCandidates
        .filter((item) => !item.alreadyActive)
        .filter((item) => {
          const student = item.student;
          const haystack =
            `${student.fullName} ${student.studentCode} ${student.email ?? ""}`.toLowerCase();
          return haystack.includes(keyword);
        });
    }

    return students
      .filter((student) => !currentIds.has(student.id))
      .filter((student) => {
        const haystack =
          `${student.fullName} ${student.studentCode} ${student.email ?? ""}`.toLowerCase();
        return haystack.includes(keyword);
      })
      .map((student) => ({
        student,
        alreadyActive: false,
        eligibility: getEligibility(student.id, classItem.id),
      }));
  }, [
    serverCandidates,
    students,
    currentIds,
    search,
    getEligibility,
    classItem.id,
  ]);

  const eligible = candidates.filter((item) => item.eligibility.eligible);
  const blocked = candidates.filter((item) => !item.eligibility.eligible);

  function toggle(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function submit(event) {
    event.preventDefault();
    if (!selectedIds.length) return;
    onAdd(selectedIds);
  }

  function StudentRow({ item, disabled = false }) {
    const { student, eligibility } = item;

    return (
      <label
        className={`flex items-start gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 ${
          disabled
            ? "cursor-not-allowed bg-slate-50"
            : "cursor-pointer hover:bg-slate-50"
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[#173557]"
          checked={selectedIds.includes(student.id)}
          onChange={() => toggle(student.id)}
          disabled={disabled}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <strong className="block truncate text-[13px] font-medium text-slate-800">
                {student.fullName}
              </strong>
              <span className="font-mono text-xs text-slate-400">
                {student.studentCode}
              </span>
            </span>
            <span
              className={
                disabled
                  ? "shrink-0 text-xs font-medium text-red-600"
                  : "shrink-0 text-xs font-medium text-emerald-700"
              }
            >
              {disabled ? "Not eligible" : "Eligible"}
            </span>
          </span>

          {eligibility.checks?.length > 0 && (
            <span className="mt-1 block text-[11px] text-slate-500">
              {eligibility.checks
                .map((check) =>
                  check.targetValue == null
                    ? `${check.targetType}: not set / required ${check.requiredTarget}`
                    : `${check.targetType}: ${check.targetValue} / required ${check.requiredTarget}`,
                )
                .join(" · ")}
            </span>
          )}

          {disabled && eligibility.reasons?.length > 0 && (
            <span className="mt-1 block text-xs leading-5 text-red-600">
              {eligibility.reasons.join(" ")}
            </span>
          )}
        </span>
      </label>
    );
  }

  return (
    <Modal
      title={`Add students · ${classItem.classCode}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400">
          <Search size={15} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student name or code..."
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="max-h-80 overflow-auto rounded-md border border-slate-200">
          {loading ? (
            <p className="p-5 text-center text-xs text-slate-400">
              Loading students from database...
            </p>
          ) : (
            <>
              {eligible.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Eligible · {eligible.length}
                  </div>
                  {eligible.map((item) => (
                    <StudentRow key={item.student.id} item={item} />
                  ))}
                </>
              )}

              {blocked.length > 0 && (
                <>
                  <div className="border-y border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Not eligible · {blocked.length}
                  </div>
                  {blocked.map((item) => (
                    <StudentRow
                      key={item.student.id}
                      item={item}
                      disabled
                    />
                  ))}
                </>
              )}

              {!candidates.length && !error && (
                <p className="p-5 text-center text-xs text-slate-400">
                  No students are available for this class.
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Eligibility is validated by the backend against student status, course
          targets and the class target requirement before membership is created.
        </p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedIds.length || loading}
            >
              Add Students
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
