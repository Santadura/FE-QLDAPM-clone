import { useEffect, useMemo, useState } from "react";
import ClassesView from "../features/classes/ClassesView";
import ClassFormModal from "../features/classes/ClassFormModal";
import ConfirmActionModal from "../components/ui/ConfirmActionModal";
import SupportOverrideModal from "../features/classes/SupportOverrideModal";
import AddClassStudentsModal from "../features/classes/AddClassStudentsModal";
import TeachingActivityModal from "../features/classes/TeachingActivityModal";
import StudentResultModal from "../features/classes/StudentResultModal";
import {
  emptyClassForm,
  PAGE_SIZE,
  courses as fallbackCourses,
  classStatuses,
} from "../features/classes/mockClasses";
import { useAcademicData } from "../features/academic/AcademicDataContext";
import { assignableClassStatuses } from "../features/academic/targetEligibility";

export default function Classes({ role }) {
  const roleKey = role?.key ?? "ADMIN";
  const isAdmin = roleKey === "ADMIN";
  const isCs = roleKey === "CS";
  const isTeacher = roleKey === "TEACHER";
  // All CS can create Draft classes, but only an explicit class-level
  // scope lets them manage an existing class (not a single support shift).
  const canCreateClass = isAdmin || isCs;
  const canTeach = isTeacher;

  const {
    students,
    classes,
    classStudents,
    classTargetRequirements,
    teachingSchedules,
    staffSchedules,
    assignments,
    exams,
    studentResults,
    auditLogs,
    courses: apiCourses,
    loadError,
    refreshData,
    getStudentClassEligibility,
    getClassStudentCandidates,
    assignStudentsToClass,
    removeStudentFromClass,
    addClass,
    updateClass,
    advanceClassStatus,
    overrideSupport,
    addAssignment,
    updateAssignment,
    changeAssignmentStatus,
    addExam,
    updateExam,
    changeExamStatus,
    upsertStudentResult,
  } = useAcademicData();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [editing, setEditing] = useState(undefined);
  const [overrideSchedule, setOverrideSchedule] = useState(null);
  const [addingStudents, setAddingStudents] = useState(false);
  const [activityType, setActivityType] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [grading, setGrading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  // Refresh the role-scoped roster and staff assignments when returning to
  // Classes from TC/CM screens in the same authenticated layout.
  useEffect(() => {
    refreshData().catch(() => {});
  }, [refreshData]);

  const courseOptions = apiCourses.length ? apiCourses : fallbackCourses;

  // The backend already applies role scope:
  // Admin -> all classes, CS -> managed classes, Teacher -> assigned classes.
  const scopedClasses = classes;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedClasses.filter((classItem) => {
      const teacherNames = teachingSchedules
        .filter(
          (schedule) =>
            schedule.classId === classItem.id &&
            schedule.status === "ASSIGNED",
        )
        .map((schedule) => schedule.teacherName ?? schedule.teacherId)
        .join(" ");

      const searchable =
        `${classItem.classCode} ${classItem.name} ${teacherNames}`.toLowerCase();

      return (
        searchable.includes(keyword) &&
        (course === "ALL" || classItem.courseId === course) &&
        (status === "ALL" || classItem.status === status)
      );
    });
  }, [scopedClasses, search, course, status, teachingSchedules]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected =
    scopedClasses.find((classItem) => classItem.id === selectedId) ?? null;
  const canManageSelected =
    isAdmin ||
    (isCs && selected && (
      selected.csAccessLevel === "MANAGER" ||
      (selected.csAccessLevel === "CREATOR" &&
        ["DRAFT", "READY"].includes(selected.status))
    ));

  const canModifySelectedRoster =
    canManageSelected &&
    selected &&
    assignableClassStatuses.includes(selected.status);

  const selectedClassStudents = selected
    ? classStudents.filter(
        (relation) =>
          relation.classId === selected.id && relation.status === "ACTIVE",
      )
    : [];

  const selectedStudents = selectedClassStudents
    .map((relation) =>
      students.find((student) => student.id === relation.studentId),
    )
    .filter(Boolean);

  const selectedTeachingSchedules = selected
    ? teachingSchedules.filter(
        (schedule) =>
          schedule.classId === selected.id && schedule.status === "ASSIGNED",
      )
    : [];

  const selectedSupportSchedules = selected
    ? staffSchedules.filter(
        (schedule) =>
          schedule.classId === selected.id &&
          schedule.staffRole === "CS" &&
          schedule.status === "ASSIGNED",
      )
    : [];

  const selectedAssignments = selected
    ? assignments.filter((item) => item.classId === selected.id)
    : [];
  const selectedExams = selected
    ? exams.filter((item) => item.classId === selected.id)
    : [];
  const selectedResults = selected
    ? studentResults.filter((item) => item.classId === selected.id)
    : [];
  const selectedAuditLogs = selected
    ? auditLogs.filter(
        (log) => log.entityType === "CLASS" && log.entityId === selected.id,
      )
    : [];

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function exportCsv() {
    const csv = [
      [
        "Class Code",
        "Class Name",
        "Course",
        "Teacher",
        "Students",
        "Start Date",
        "End Date",
        "Status",
      ],
      ...filtered.map((classItem) => {
        const teachers = [
          ...new Set(
            teachingSchedules
              .filter(
                (schedule) =>
                  schedule.classId === classItem.id &&
                  schedule.status === "ASSIGNED",
              )
              .map((schedule) => schedule.teacherName ?? schedule.teacherId),
          ),
        ].join("; ");

        const studentCount = classStudents.filter(
          (relation) =>
            relation.classId === classItem.id && relation.status === "ACTIVE",
        ).length;

        return [
          classItem.classCode,
          classItem.name,
          courseOptions.find((item) => item.id === classItem.courseId)?.name ?? "",
          teachers,
          studentCount,
          classItem.startDate,
          classItem.endDate,
          classItem.status,
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
    link.download = "classes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function saveClass(form) {
    const result = editing
      ? await updateClass(editing.id, form)
      : await addClass(form);

    if (!result.ok) {
      setMessage(result.reason);
      throw new Error(result.reason || 'Không thể lưu lớp.');
    }

    setSelectedId(editing?.id ?? result.classItem?.id ?? null);
    setEditing(undefined);
    setTab("Overview");
    setMessage("");
    return true;
  }

  function advanceStatus(nextStatus) {
    if (!selected || !canManageSelected) return;
    setActionError("");
    setPendingAction({ kind: "status", classId: selected.id, classCode: selected.classCode, nextStatus });
  }

  async function applyPendingAction() {
    if (!pendingAction || actionBusy) return;
    setActionBusy(true);
    setActionError("");
    try {
      const result = pendingAction.kind === "status"
        ? await advanceClassStatus(pendingAction.classId, pendingAction.nextStatus)
        : await removeStudentFromClass(pendingAction.studentId, pendingAction.classId);
      if (!result?.ok) throw new Error(result?.reason || "Thao tác thất bại.");
      setPendingAction(null);
      setMessage(pendingAction.kind === "status"
        ? `Đã chuyển lớp ${pendingAction.classCode} sang ${pendingAction.nextStatus}.`
        : `Đã đưa ${pendingAction.studentName} ra khỏi danh sách đang học. Lịch sử được giữ lại.`);
    } catch (error) {
      setActionError(error?.message || "Không thể hoàn tất thao tác.");
    } finally {
      setActionBusy(false);
    }
  }

  async function confirmSupportOverride({
    scheduleId,
    newCsId,
    reason,
    allowConflict,
  }) {
    if (!isAdmin) return;

    const result = await overrideSupport(
      scheduleId,
      newCsId,
      reason,
      null,
      allowConflict,
    );

    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setOverrideSchedule(null);
    setMessage("");
  }

  async function addStudents(ids) {
    if (!selected || !canModifySelectedRoster) return false;
    const result = await assignStudentsToClass(ids, selected.id);
    if (!result?.ok) throw new Error(result?.reason || "Không thể thêm học sinh vào lớp.");
    setAddingStudents(false);
    setMessage(`Đã thêm ${result.added} học sinh vào lớp ${selected.classCode}.`);
    return true;
  }

  function removeStudent(studentId) {
    if (!selected || !canModifySelectedRoster) return;
    const student = selectedStudents.find((item) => item.id === studentId);
    if (!student) return;
    setActionError("");
    setPendingAction({
      kind: "removeStudent",
      classId: selected.id,
      classCode: selected.classCode,
      studentId,
      studentName: student.fullName,
    });
  }

  async function saveActivity(data) {
    if (!canTeach || !selected) return;

    let result;
    if (editingActivity?.kind === "assignment") {
      result = await updateAssignment(editingActivity.item.id, data);
    } else if (editingActivity?.kind === "exam") {
      result = await updateExam(editingActivity.item.id, data);
    } else {
      result =
        activityType === "exam"
          ? await addExam(data)
          : await addAssignment(data);
    }

    if (result?.ok === false) {
      setMessage(result.reason);
      return;
    }

    const kind = editingActivity?.kind ?? activityType;
    const wasEditing = Boolean(editingActivity);
    setActivityType(null);
    setEditingActivity(null);
    setMessage(
      `${kind === "exam" ? "Exam" : "Assignment"} ${wasEditing ? "updated" : "created"}.`,
    );
  }

  function editAssignment(item) {
    if (!canTeach) return;
    setEditingActivity({ kind: "assignment", item });
    setActivityType("assignment");
    setMessage("");
  }

  function editExam(item) {
    if (!canTeach) return;
    setEditingActivity({ kind: "exam", item });
    setActivityType("exam");
    setMessage("");
  }

  async function setAssignmentStatus(item, nextStatus) {
    if (!canTeach) return;

    const result = await changeAssignmentStatus(item.id, nextStatus);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setMessage(`Assignment marked ${nextStatus.toLowerCase()}.`);
  }

  async function setExamStatus(item, nextStatus) {
    if (!canTeach) return;

    const result = await changeExamStatus(item.id, nextStatus);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setMessage(`Exam marked ${nextStatus.toLowerCase()}.`);
  }

  async function saveResult(data) {
    if (!canTeach) return;

    const result = await upsertStudentResult(data);
    if (result?.ok === false) {
      setMessage(result.reason);
      return;
    }

    setGrading(false);
    setMessage("Student result and feedback saved.");
  }

  function studentCount(classId) {
    return classStudents.filter(
      (relation) =>
        relation.classId === classId && relation.status === "ACTIVE",
    ).length;
  }

  function teacherSummary(classId) {
    return [
      ...new Set(
        teachingSchedules
          .filter(
            (schedule) =>
              schedule.classId === classId &&
              schedule.status === "ASSIGNED",
          )
          .map((schedule) => schedule.teacherName ?? schedule.teacherId),
      ),
    ];
  }

  function supportSummary(classId) {
    return [
      ...new Set(
        staffSchedules
          .filter(
            (schedule) =>
              schedule.classId === classId &&
              schedule.staffRole === "CS" &&
              schedule.status === "ASSIGNED",
          )
          .map((schedule) => schedule.employeeName ?? schedule.userId),
      ),
    ];
  }

  return (
    <>
      <ClassesView
        roleKey={roleKey}
        canManageCore={canManageSelected}
        canManageStudents={canManageSelected}
        onPlannedSessionsChanged={refreshData}
        canTeach={canTeach}
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        course={course}
        onCourse={(value) => changeFilter(setCourse, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        courses={courseOptions}
        onExport={exportCsv}
        onCreate={canCreateClass ? () => setEditing(null) : undefined}
        visible={visible}
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
        selectedId={selectedId}
        tab={tab}
        setTab={setTab}
        onCloseDetail={() => setSelectedId(null)}
        onEdit={
          canManageSelected && selected && selected.status !== "CLOSED"
            ? () => {
                const requiredTargets = classTargetRequirements
                  .filter(
                    (requirement) => requirement.classId === selected.id,
                  )
                  .reduce((result, requirement) => {
                    result[selected.courseId] = {
                      ...(result[selected.courseId] ?? {}),
                      [requirement.targetType]: requirement.requiredTarget,
                    };
                    return result;
                  }, {});

                setEditing({
                  ...selected,
                  requiredTargets,
                });
              }
            : undefined
        }
        onAdvanceStatus={
          canManageSelected && selected?.status !== "CLOSED"
            ? advanceStatus
            : undefined
        }
        students={selectedStudents}
        onAddStudents={
          canModifySelectedRoster ? () => setAddingStudents(true) : undefined
        }
        onRemoveStudent={canModifySelectedRoster ? removeStudent : undefined}
        teachingSchedules={selectedTeachingSchedules}
        teacherSummary={teacherSummary}
        studentCount={studentCount}
        supportSchedules={selectedSupportSchedules}
        supportSummary={supportSummary}
        onOverrideSupport={
          isAdmin && selected?.status !== "CLOSED"
            ? setOverrideSchedule
            : undefined
        }
        assignments={selectedAssignments}
        exams={selectedExams}
        onCreateAssignment={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? () => {
                setEditingActivity(null);
                setActivityType("assignment");
              }
            : undefined
        }
        onCreateExam={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? () => {
                setEditingActivity(null);
                setActivityType("exam");
              }
            : undefined
        }
        onEditAssignment={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? editAssignment
            : undefined
        }
        onAssignmentStatus={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? setAssignmentStatus
            : undefined
        }
        onEditExam={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? editExam
            : undefined
        }
        onExamStatus={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? setExamStatus
            : undefined
        }
        results={selectedResults}
        onRecordResult={
          canTeach &&
          selected &&
          ["READY", "RUNNING", "COMPLETED"].includes(selected.status)
            ? () => setGrading(true)
            : undefined
        }
        auditLogs={selectedAuditLogs}
        message={message || loadError}
      />

      {pendingAction && (
        <ConfirmActionModal
          title={pendingAction.kind === "status" ? "Xác nhận chuyển trạng thái lớp" : "Xác nhận đưa học sinh ra khỏi lớp"}
          description={pendingAction.kind === "status"
            ? ({
                READY: "Lớp cần có lịch học dự kiến trước khi chuyển sang Sẵn sàng.",
                RUNNING: "Tất cả buổi học phải có giáo viên và CS hỗ trợ. Sau khi bắt đầu, các thay đổi lịch phải dùng quy trình điều chỉnh riêng.",
                COMPLETED: "Không được còn buổi tương lai, thiếu điểm danh giáo viên hoặc hoạt động học tập chưa hoàn tất.",
                CLOSED: "Lớp sau khi đóng sẽ chỉ đọc. Bạn không thể chỉnh sửa hoặc mở lại từ giao diện.",
              }[pendingAction.nextStatus] || "Bạn xác nhận chuyển trạng thái lớp?")
            : "Học sinh sẽ không còn thuộc danh sách đang học của lớp. Lịch sử học tập được giữ lại; thêm lại cần kiểm tra điều kiện từ đầu."}
          detail={pendingAction.kind === "status"
            ? `${pendingAction.classCode} → ${pendingAction.nextStatus}`
            : `${pendingAction.studentName} · ${pendingAction.classCode}`}
          confirmLabel={pendingAction.kind === "status" ? "Chuyển trạng thái" : "Đưa ra khỏi lớp"}
          destructive={pendingAction.kind !== "status" || pendingAction.nextStatus === "CLOSED"}
          busy={actionBusy}
          error={actionError}
          onClose={() => { setPendingAction(null); setActionError(""); }}
          onConfirm={applyPendingAction}
        />
      )}

      {editing !== undefined && (
        <ClassFormModal
          classItem={editing}
          emptyForm={emptyClassForm}
          courseOptions={courseOptions}
          onClose={() => setEditing(undefined)}
          onSave={saveClass}
        />
      )}

      {overrideSchedule && isAdmin && (
        <SupportOverrideModal
          schedule={overrideSchedule}
          staffSchedules={staffSchedules}
          onClose={() => setOverrideSchedule(null)}
          onConfirm={confirmSupportOverride}
        />
      )}

      {addingStudents && selected && (
        <AddClassStudentsModal
          classItem={selected}
          students={students}
          classStudents={classStudents}
          getEligibility={getStudentClassEligibility}
          loadCandidates={getClassStudentCandidates}
          onClose={() => setAddingStudents(false)}
          onAdd={addStudents}
        />
      )}

      {activityType && selected && (
        <TeachingActivityModal
          classItem={selected}
          type={activityType}
          activity={editingActivity?.item}
          onClose={() => {
            setActivityType(null);
            setEditingActivity(null);
          }}
          onSave={saveActivity}
        />
      )}

      {grading && selected && (
        <StudentResultModal
          classItem={selected}
          students={selectedStudents}
          assignments={selectedAssignments}
          exams={selectedExams}
          existingResults={selectedResults}
          onClose={() => setGrading(false)}
          onSave={saveResult}
        />
      )}
    </>
  );
}
