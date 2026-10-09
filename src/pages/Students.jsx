import { useMemo, useState } from "react";
import StudentsView from "../features/students/StudentsView";
import StudentFormModal from "../features/students/StudentFormModal";
import AssignStudentsModal from "../features/students/AssignStudentsModal";
import { PAGE_SIZE, emptyForm } from "../features/students/mockStudents";
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
    loadError,
    addStudent,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
    getStudentClassEligibility,
    assignStudentsToClass,
  } = useAcademicData();

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

    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    const id = editing?.id ?? result.student?.id;
    if (id) setSelectedId(id);
    setEditing(undefined);
    setTab("Overview");
    setMessage("");
  }

  async function handleDelete() {
    if (!selected || !canManage) return;

    const confirmed = window.confirm(
      `Delete ${selected.fullName}? Hard delete is only allowed when the student has never belonged to a class and has no academic results.`,
    );
    if (!confirmed) return;

    const result = await deleteStudent(selected.id);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setSelectedId(null);
    setChecked((current) => current.filter((id) => id !== selected.id));
    setMessage("");
  }

  async function handleStatusChange(nextStatus) {
    if (!selected || !canManage) return;

    const result = await changeStudentStatus(selected.id, nextStatus);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    const affected = result.deactivatedClassIds?.length ?? 0;
    setMessage(
      affected
        ? `Student status changed to ${nextStatus}. ${affected} active class membership(s) were deactivated and will not be restored automatically.`
        : `Student status changed to ${nextStatus}.`,
    );
  }

  async function assignSelected(classId) {
    const ids = checked.length
      ? checked
      : selected
        ? [selected.id]
        : [];

    const result = await assignStudentsToClass(ids, classId);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setAssigning(false);
    setChecked([]);
    setMessage(`${result.added} student(s) added to class.`);
  }

  return (
    <>
      <StudentsView
        roleKey={roleKey}
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

      {editing !== undefined && (
        <StudentFormModal
          student={editing}
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
          onClose={() => setAssigning(false)}
          onAssign={assignSelected}
        />
      )}
    </>
  );
}
