import { useEffect, useMemo, useState } from "react";
import StudentsView from "../features/students/StudentsView";
import StudentFormModal from "../features/students/StudentFormModal";
import ConfirmActionModal from "../components/ui/ConfirmActionModal";
import AssignStudentsModal from "../features/students/AssignStudentsModal";
import { PAGE_SIZE, emptyForm } from "../features/students/mockStudents";
import { courseTargetDefinitions } from "../features/academic/targetEligibility";
import { useAcademicData } from "../features/academic/AcademicDataContext";

export default function Students({ role }) {
  const roleKey = role?.key ?? "ADMIN";
  const canManage = roleKey === "ADMIN";

  const {
    students,
    classes,
    classStudents,
    studentTargets,
    studentResults,
    classTargetRequirements,
    courses: apiCourses,
    loadError,
    addStudent,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
    getStudentClassEligibility,
    getClassStudentCandidates,
    assignStudentsToClass,
  } = useAcademicData();

  const targetDefinitions = useMemo(() => {
    const definitions = { ...courseTargetDefinitions };
    for (const course of apiCourses) {
      if (definitions[course.id]) continue;
      const courseClasses = new Set(classes.filter((cls) => cls.courseId === course.id).map((cls) => cls.id));
      const types = [...new Set([
        ...classTargetRequirements.filter((row) => courseClasses.has(row.classId)).map((row) => row.targetType),
        ...studentTargets.filter((row) => row.courseId === course.id).map((row) => row.targetType),
      ])];
      if (!types.length) continue;
      definitions[course.id] = {
        courseLabel: course.name,
        scaleNote: "Tiêu chí tùy chỉnh theo yêu cầu của lớp.",
        targets: types.map((type) => ({ type, label: type, min: 0, max: undefined, step: "any" })),
      };
    }
    return definitions;
  }, [apiCourses, classes, classTargetRequirements, studentTargets]);

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [classFilter, setClassFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [checked, setChecked] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const searchable =
        `${student.fullName} ${student.studentCode} ${student.email ?? ""} ${student.phone ?? ""}`.toLowerCase();

      const inClass =
        classFilter === "ALL" ||
        classStudents.some(
          (relation) =>
            relation.studentId === student.id &&
            relation.classId === classFilter &&
            relation.status === "ACTIVE",
        );

      return (
        searchable.includes(keyword) &&
        (status === "All Status" || student.status === status) &&
        inClass
      );
    });
  }, [students, search, status, classFilter, classStudents]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
  }, [page, filtered.length]);
  const selected =
    students.find((student) => student.id === selectedId) ?? null;

  const selectedClasses = selected
    ? classStudents
        .filter(
          (relation) =>
            relation.studentId === selected.id && relation.status === "ACTIVE",
        )
        .map((relation) => classes.find((item) => item.id === relation.classId))
        .filter(Boolean)
    : [];

  const selectedResults = selected
    ? studentResults.filter((result) => result.studentId === selected.id)
    : [];

  const allVisibleChecked =
    visible.length > 0 &&
    visible.every((student) => checked.includes(student.id));

  function resetPage() {
    setPage(1);
    setChecked([]);
  }

  function changeFilter(setter, value) {
    setter(value);
    resetPage();
  }

  function toggleOne(id) {
    setChecked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setChecked((current) =>
      allVisibleChecked
        ? current.filter(
            (id) => !visible.some((student) => student.id === id),
          )
        : [...new Set([...current, ...visible.map((student) => student.id)])],
    );
  }

  function exportCsv() {
    const rows = checked.length
      ? students.filter((student) => checked.includes(student.id))
      : filtered;

    const csv = [
      ["Student Code", "Full Name", "Email", "Phone", "Status", "Classes"],
      ...rows.map((student) => {
        const classCodes = classStudents
          .filter(
            (relation) =>
              relation.studentId === student.id &&
              relation.status === "ACTIVE",
          )
          .map(
            (relation) =>
              classes.find((item) => item.id === relation.classId)?.classCode,
          )
          .filter(Boolean)
          .join("; ");

        return [
          student.studentCode,
          student.fullName,
          student.email ?? "",
          student.phone ?? "",
          student.status,
          classCodes,
        ];
      }),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function saveStudent(form) {
    const result = editing
      ? await updateStudent(editing.id, form)
      : await addStudent(form);

    if (!result.ok) throw new Error(result.reason || "Không thể lưu học sinh.");

    const id = editing?.id ?? result.student?.id;
    if (id) setSelectedId(id);
    setEditing(undefined);
    setTab("Overview");
    setMessage("");
  }

  function handleDelete() {
    if (!selected || !canManage) return;
    setActionError("");
    setPendingAction({ kind: "delete", studentId: selected.id, studentName: selected.fullName });
  }

  function handleStatusChange(nextStatus) {
    if (!selected || !canManage) return;
    const activeClasses = classStudents.filter((membership) =>
      membership.studentId === selected.id && membership.status === "ACTIVE" &&
      classes.some((item) => item.id === membership.classId &&
        ["DRAFT", "READY", "RUNNING"].includes(item.status))
    ).length;
    setActionError("");
    setPendingAction({
      kind: "status", studentId: selected.id, studentName: selected.fullName,
      nextStatus, activeClasses,
    });
  }

  async function applyPendingAction() {
    if (!pendingAction || actionBusy) return;
    setActionBusy(true);
    setActionError("");
    try {
      const result = pendingAction.kind === "delete"
        ? await deleteStudent(pendingAction.studentId)
        : await changeStudentStatus(pendingAction.studentId, pendingAction.nextStatus);
      if (!result?.ok) throw new Error(result?.reason || "Không thể cập nhật học sinh.");
      if (pendingAction.kind === "delete") {
        setSelectedId(null);
        setChecked((current) => current.filter((id) => id !== pendingAction.studentId));
        setMessage("Đã xóa hồ sơ học sinh chưa có lịch sử học tập.");
      } else {
        const affected = result.deactivatedClassIds?.length ?? 0;
        setMessage(`Đã cập nhật trạng thái học sinh thành ${pendingAction.nextStatus}.` +
          (affected ? ` ${affected} quan hệ lớp đang học đã bị vô hiệu hóa; không tự khôi phục khi kích hoạt lại.` : ""));
      }
      setPendingAction(null);
    } catch (error) {
      setActionError(error?.message || "Thao tác không thành công.");
    } finally {
      setActionBusy(false);
    }
  }

  async function assignSelected(classId) {
    const ids = checked.length
      ? checked
      : selected
        ? [selected.id]
        : [];

    const result = await assignStudentsToClass(ids, classId);
    if (!result.ok) throw new Error(result.reason || "Không thể thêm học sinh vào lớp.");
    setAssigning(false);
    setChecked([]);
    setMessage(`Đã thêm ${result.added} học sinh vào lớp.`);
    return true;
  }

  return (
    <>
      <StudentsView
        roleKey={roleKey}
        targetDefinitions={targetDefinitions}
        canManage={canManage}
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        classFilter={classFilter}
        onClassFilter={(value) => changeFilter(setClassFilter, value)}
        classes={classes}
        classStudents={classStudents}
        onExport={exportCsv}
        onAdd={canManage ? () => setEditing(null) : undefined}
        onAssignSelected={
          canManage && (checked.length || selected)
            ? () => setAssigning(true)
            : undefined
        }
        onClearSelection={() => setChecked([])}
        message={message || loadError}
        visible={visible}
        selectedId={selectedId}
        checked={checked}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onSelect={(id) => {
          setSelectedId(id);
          setTab("Overview");
          setMessage("");
        }}
        filteredCount={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        selected={selected}
        selectedClasses={selectedClasses}
        selectedResults={selectedResults}
        tab={tab}
        setTab={setTab}
        onCloseDetail={() => setSelectedId(null)}
        onEdit={
          canManage && selected
            ? () => {
                const targets = studentTargets
                  .filter((target) => target.studentId === selected.id)
                  .reduce((result, target) => {
                    result[target.courseId] = {
                      ...(result[target.courseId] ?? {}),
                      [target.targetType]: target.targetValue,
                    };
                    return result;
                  }, {});

                setEditing({
                  ...selected,
                  targets,
                });
              }
            : undefined
        }
        onChangeStatus={
          canManage && selected ? handleStatusChange : undefined
        }
        studentTargets={studentTargets}
        onDelete={canManage && selected ? handleDelete : undefined}
      />

      {pendingAction && (
        <ConfirmActionModal
          title={pendingAction.kind === "delete" ? "Xác nhận xóa hồ sơ học sinh" : "Xác nhận đổi trạng thái học sinh"}
          description={pendingAction.kind === "delete"
            ? "Chỉ có thể xóa vĩnh viễn hồ sơ chưa từng tham gia lớp hoặc có kết quả học tập."
            : pendingAction.nextStatus === "Active"
              ? "Kích hoạt lại hồ sơ không tự động khôi phục các lớp đã rời. Bạn cần thêm lại học sinh vào từng lớp."
              : `Thao tác này sẽ vô hiệu hóa ${pendingAction.activeClasses} quan hệ lớp đang học, nếu có. Khi kích hoạt lại, các quan hệ này không tự khôi phục.`}
          detail={pendingAction.kind === "delete"
            ? pendingAction.studentName
            : `${pendingAction.studentName} → ${pendingAction.nextStatus}`}
          confirmLabel={pendingAction.kind === "delete" ? "Xóa hồ sơ" : "Đổi trạng thái"}
          destructive={pendingAction.kind === "delete" || pendingAction.nextStatus !== "Active"}
          busy={actionBusy}
          error={actionError}
          onClose={() => { setPendingAction(null); setActionError(""); }}
          onConfirm={applyPendingAction}
        />
      )}

      {editing !== undefined && (
        <StudentFormModal
          student={editing}
          targetDefinitions={targetDefinitions}
          emptyForm={emptyForm}
          onClose={() => {
            setEditing(undefined);
            setMessage("");
          }}
          onSave={saveStudent}
        />
      )}

      {assigning && (
        <AssignStudentsModal
          studentIds={checked.length ? checked : [selected?.id].filter(Boolean)}
          students={students}
          classes={classes}
          classStudents={classStudents}
          getEligibility={getStudentClassEligibility}
          loadCandidates={getClassStudentCandidates}
          onClose={() => setAssigning(false)}
          onAssign={assignSelected}
        />
      )}
    </>
  );
}
