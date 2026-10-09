import {
  ChevronDown,
  Download,
  Plus,
  Search,
  Users,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  History,
  UserPlus,
  FilePlus2,
  GraduationCap,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";
import { classStatuses, courses as fallbackCourses } from "./mockClasses";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400";

const statusDots = {
  DRAFT: "bg-slate-400",
  READY: "bg-[#173557]",
  RUNNING: "bg-emerald-500",
  COMPLETED: "bg-slate-500",
  CLOSED: "bg-slate-300",
};

function statusLabel(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function courseName(courseId, options = fallbackCourses) {
  return options.find((course) => course.id === courseId)?.name ?? "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusLabel({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? statusDots.DRAFT}`}
      />
      {statusLabel(status)}
    </span>
  );
}

function FilterSelect({ value, onChange, label, options }) {
  return (
    <div className="relative min-w-36 flex-1 sm:flex-none">
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-[13px] text-slate-700 focus:border-blue-600 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <Icon size={20} className="mx-auto mb-2 text-slate-400" />
      <strong className="block text-sm font-medium text-slate-700">
        {title}
      </strong>
      <span className="mt-1 block text-xs leading-5 text-slate-400">
        {description}
      </span>
    </div>
  );
}

function StudentsTab({ students, onAddStudents, onRemoveStudent }) {
  return (
    <div className="grid gap-3 pt-4">
      {onAddStudents && (
        <div className="flex justify-end">
          <Button onClick={onAddStudents}>
            <UserPlus size={14} />
            Add Students
          </Button>
        </div>
      )}

      {students.length ? (
        <div className="grid gap-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0">
                <strong className="block truncate text-[13px] font-medium text-slate-800">
                  {student.fullName}
                </strong>
                <span className="font-mono text-xs text-slate-400">
                  {student.studentCode}
                </span>
              </div>
              {onRemoveStudent && (
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-slate-500 hover:text-red-600"
                  onClick={() => onRemoveStudent(student.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No students in this class"
          description="Add internal student records through the ClassStudent relationship."
        />
      )}
    </div>
  );
}

function ScheduleTab({ schedules }) {
  if (!schedules.length) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={CalendarDays}
          title="No teaching schedule"
          description="Teacher assignment and class time are created by TC through TeachingSchedule."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2 pt-4">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-md border border-slate-200 bg-white p-3 text-[13px]"
        >
          <strong className="block font-medium text-slate-800">
            {schedule.teacherName ?? schedule.teacherId}
          </strong>
          <span className="mt-1 block text-xs text-slate-500">
            {schedule.date} · {schedule.startTime}–{schedule.endTime}
          </span>
        </div>
      ))}
    </div>
  );
}

function SupportTab({ schedules, canOverride, onOverride }) {
  if (!schedules.length) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={ShieldCheck}
          title="No CS support schedule"
          description="CS support is assigned by Center Management through StaffSchedule."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2 pt-4">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-md border border-slate-200 bg-white p-3 text-[13px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="block font-medium text-slate-800">
                {schedule.employeeName ?? schedule.userId}
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                {schedule.date} · {schedule.startTime}–{schedule.endTime}
              </span>
              {schedule.assignmentSource && (
                <span className="mt-1 block text-[11px] text-slate-400">
                  {schedule.assignmentSource === "ADMIN_OVERRIDE"
                    ? "Administrative override"
                    : "Standard assignment"}
                </span>
              )}
            </div>
            {canOverride && (
              <button
                type="button"
                className="text-xs font-medium text-[#173557] hover:underline"
                onClick={() => onOverride(schedule)}
              >
                Administrative Override
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityStatus({ status }) {
  const labels = {
    OPEN: "Open",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
  };

  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {labels[status] ?? status}
    </span>
  );
}

function AssignmentsTab({
  assignments,
  exams,
  onCreateAssignment,
  onCreateExam,
  onEditAssignment,
  onAssignmentStatus,
  onEditExam,
  onExamStatus,
}) {
  return (
    <div className="grid gap-4 pt-4">
      {(onCreateAssignment || onCreateExam) && (
        <div className="flex flex-wrap justify-end gap-2">
          {onCreateAssignment && (
            <Button onClick={onCreateAssignment}>
              <FilePlus2 size={14} />
              New Assignment
            </Button>
          )}
          {onCreateExam && (
            <Button onClick={onCreateExam}>
              <ClipboardList size={14} />
              New Exam
            </Button>
          )}
        </div>
      )}

      <div>
        <span className={labelClass}>Assignments</span>
        {assignments.length ? (
          <div className="grid gap-2">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-[13px] font-medium text-slate-800">
                      {item.title}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      Deadline {formatDate(item.deadline)}
                    </span>
                  </div>
                  <ActivityStatus status={item.status} />
                </div>

                {item.status === "OPEN" &&
                  (onEditAssignment || onAssignmentStatus) && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                      {onEditAssignment && (
                        <button
                          type="button"
                          className="text-xs font-medium text-[#173557] hover:underline"
                          onClick={() => onEditAssignment(item)}
                        >
                          Edit
                        </button>
                      )}
                      {onAssignmentStatus && (
                        <>
                          <button
                            type="button"
                            className="text-xs font-medium text-slate-600 hover:underline"
                            onClick={() => onAssignmentStatus(item, "CLOSED")}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 hover:underline"
                            onClick={() => onAssignmentStatus(item, "CANCELLED")}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No assignments yet.</p>
        )}
      </div>

      <div>
        <span className={labelClass}>Exams</span>
        {exams.length ? (
          <div className="grid gap-2">
            {exams.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-[13px] font-medium text-slate-800">
                      {item.title}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {formatDate(item.examDate)} · {item.duration} minutes
                    </span>
                  </div>
                  <ActivityStatus status={item.status} />
                </div>

                {item.status === "SCHEDULED" &&
                  (onEditExam || onExamStatus) && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                      {onEditExam && (
                        <button
                          type="button"
                          className="text-xs font-medium text-[#173557] hover:underline"
                          onClick={() => onEditExam(item)}
                        >
                          Edit
                        </button>
                      )}
                      {onExamStatus && (
                        <>
                          <button
                            type="button"
                            className="text-xs font-medium text-emerald-700 hover:underline"
                            onClick={() => onExamStatus(item, "COMPLETED")}
                          >
                            Mark Completed
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 hover:underline"
                            onClick={() => onExamStatus(item, "CANCELLED")}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No exams yet.</p>
        )}
      </div>
    </div>
  );
}

function ResultsTab({
  students,
  results,
  assignments,
  exams,
  onRecordResult,
}) {
  function activityLabel(result) {
    if (result.assignmentId) {
      const assignment = assignments.find(
        (item) => item.id === result.assignmentId,
      );
      return assignment ? `Assignment · ${assignment.title}` : "Assignment";
    }

    if (result.examId) {
      const exam = exams.find((item) => item.id === result.examId);
      return exam ? `Exam · ${exam.title}` : "Exam";
    }

    return "Academic result";
  }

  return (
    <div className="grid gap-3 pt-4">
      {onRecordResult && (
        <div className="flex justify-end">
          <Button onClick={onRecordResult}>
            <GraduationCap size={14} />
            Record Result
          </Button>
        </div>
      )}

      {results.length ? (
        <div className="grid gap-2">
          {results
            .slice()
            .sort(
              (a, b) =>
                new Date(b.evaluatedAt).getTime() -
                new Date(a.evaluatedAt).getTime(),
            )
            .map((result) => {
              const student = students.find(
                (item) => item.id === result.studentId,
              );
              return (
                <div
                  key={result.id}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block truncate text-[13px] font-medium text-slate-800">
                        {student?.fullName ?? result.studentId}
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        {activityLabel(result)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        Evaluated {new Date(result.evaluatedAt).toLocaleString()}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {result.feedback || "No feedback"}
                      </span>
                    </div>
                    <strong className="shrink-0 text-sm font-semibold text-[#173557]">
                      {result.score}
                    </strong>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No results recorded"
          description="Teachers record scores and evaluation for students in their assigned class."
        />
      )}
    </div>
  );
}

function AuditTab({ logs }) {
  if (!logs.length) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={History}
          title="No audit activity yet"
          description="Important class changes and administrative interventions will appear here."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2 pt-4">
      {logs.map((log) => (
        <div key={log.id} className="border-b border-slate-100 pb-2 text-xs">
          <strong className="block font-medium text-slate-700">{log.action}</strong>
          <span className="text-slate-500">{log.userName}</span>
          <span className="ml-2 text-slate-400">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClassDetail({
  classItem,
  roleKey,
  canManageCore,
  tab,
  setTab,
  onClose,
  onEdit,
  onAdvanceStatus,
  students,
  onAddStudents,
  onRemoveStudent,
  teachingSchedules,
  supportSchedules,
  onOverrideSupport,
  assignments,
  exams,
  onCreateAssignment,
  onCreateExam,
  onEditAssignment,
  onAssignmentStatus,
  onEditExam,
  onExamStatus,
  results,
  onRecordResult,
  auditLogs,
}) {
  const currentIndex = classItem ? classStatuses.indexOf(classItem.status) : -1;
  const nextStatus =
    currentIndex >= 0 && currentIndex < classStatuses.length - 1
      ? classStatuses[currentIndex + 1]
      : null;

  const tabs = classItem
    ? [
        { key: "Overview", label: "Overview" },
        { key: "Students", label: "Students" },
        { key: "Schedule", label: "Schedule" },
        ...(roleKey !== "TEACHER"
          ? [
              {
                key: "Support",
                label: roleKey === "CS" ? "My Support" : "Support",
              },
            ]
          : []),
        { key: "Assignments", label: "Assignments" },
        { key: "Results", label: "Results" },
        ...(roleKey === "ADMIN" ? [{ key: "Audit", label: "Audit" }] : []),
      ]
    : [];

  return (
    <DetailPanel
      title="Class Detail"
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      footer={
        classItem && canManageCore ? (
          <div className="grid gap-2">
            {onEdit && (
              <Button variant="primary" className="w-full" onClick={onEdit}>
                Edit Class Details
              </Button>
            )}
            {nextStatus && onAdvanceStatus && (
              <Button
                className="w-full"
                onClick={() => onAdvanceStatus(nextStatus)}
              >
                Move to {statusLabel(nextStatus)}
              </Button>
            )}
            {classItem.status === "CLOSED" && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                Closed classes are archived and read-only.
              </div>
            )}
          </div>
        ) : null
      }
    >
      {classItem ? (
        <>
          <div className="border-b border-slate-100 pb-4">
            <strong className="block text-sm font-semibold text-slate-900">
              {classItem.name}
            </strong>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                {classItem.classCode}
              </span>
              <span className="text-slate-300">•</span>
              <StatusLabel status={classItem.status} />
            </div>
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Course</span>
                  <strong className="font-medium">
                    {classItem.courseName ?? courseName(classItem.courseId)}
                  </strong>
                </div>
                <div>
                  <span className={labelClass}>Status</span>
                  <StatusLabel status={classItem.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Teacher</span>
                  <span>
                    {[
                      ...new Set(
                        teachingSchedules.map(
                          (schedule) =>
                            schedule.teacherName ?? schedule.teacherId,
                        ),
                      ),
                    ].join(", ") || "Not assigned"}
                  </span>
                </div>
                <div>
                  <span className={labelClass}>Students</span>
                  <span>{students.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Start date</span>
                  <span>{formatDate(classItem.startDate)}</span>
                </div>
                <div>
                  <span className={labelClass}>End date</span>
                  <span>{formatDate(classItem.endDate)}</span>
                </div>
              </div>

              {roleKey !== "TEACHER" && (
                <div className="py-3.5 text-[13px]">
                  <span className={labelClass}>CS support</span>
                  <span>
                    {[
                      ...new Set(
                        supportSchedules.map(
                          (schedule) =>
                            schedule.employeeName ?? schedule.userId,
                        ),
                      ),
                    ].join(", ") || "Not assigned"}
                  </span>
                </div>
              )}
            </>
          )}

          {tab === "Students" && (
            <StudentsTab
              students={students}
              onAddStudents={onAddStudents}
              onRemoveStudent={onRemoveStudent}
            />
          )}

          {tab === "Schedule" && (
            <ScheduleTab schedules={teachingSchedules} />
          )}

          {tab === "Support" && roleKey !== "TEACHER" && (
            <SupportTab
              schedules={supportSchedules}
              canOverride={
                roleKey === "ADMIN" && Boolean(onOverrideSupport)
              }
              onOverride={onOverrideSupport}
            />
          )}

          {tab === "Assignments" && (
            <AssignmentsTab
              assignments={assignments}
              exams={exams}
              onCreateAssignment={onCreateAssignment}
              onCreateExam={onCreateExam}
              onEditAssignment={onEditAssignment}
              onAssignmentStatus={onAssignmentStatus}
              onEditExam={onEditExam}
              onExamStatus={onExamStatus}
            />
          )}

          {tab === "Results" && (
            <ResultsTab
              students={students}
              results={results}
              assignments={assignments}
              exams={exams}
              onRecordResult={onRecordResult}
            />
          )}

          {tab === "Audit" && roleKey === "ADMIN" && (
            <AuditTab logs={auditLogs} />
          )}
        </>
      ) : (
        <p className="py-6 text-center text-[13px] text-slate-400">
          Select a class to see its details.
        </p>
      )}
    </DetailPanel>
  );
}

export default function ClassesView({
  roleKey,
  canManageCore,
  search,
  onSearch,
  course,
  onCourse,
  status,
  onStatus,
  courses = fallbackCourses,
  onExport,
  onCreate,
  visible,
  selectedId,
  onSelect,
  filteredCount,
  page,
  pageSize,
  onPage,
  selected,
  tab,
  setTab,
  onCloseDetail,
  onEdit,
  onAdvanceStatus,
  students,
  onAddStudents,
  onRemoveStudent,
  teachingSchedules,
  teacherSummary,
  studentCount,
  supportSchedules,
  supportSummary,
  onOverrideSupport,
  assignments,
  exams,
  onCreateAssignment,
  onCreateExam,
  onEditAssignment,
  onAssignmentStatus,
  onEditExam,
  onExamStatus,
  results,
  onRecordResult,
  auditLogs,
  message,
}) {
  const columns = [
    {
      key: "classCode",
      label: "Class Code",
      width: "w-[16%]",
      cellClassName: "font-mono text-xs",
    },
    {
      key: "name",
      label: "Class Name",
      width: "w-[24%]",
      cellClassName: "font-medium text-slate-900",
    },
    {
      key: "courseId",
      label: "Course",
      width: "w-[13%]",
      render: (classItem) =>
        classItem.courseName ?? courseName(classItem.courseId, courses),
    },
    {
      key: "teacher",
      label: "Teacher",
      width: "w-[20%]",
      render: (classItem) =>
        teacherSummary(classItem.id).join(", ") || "Not assigned",
    },
    {
      key: "students",
      label: "Students",
      width: "w-[10%]",
      render: (classItem) => studentCount(classItem.id),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[17%]",
      render: (classItem) => <StatusLabel status={classItem.status} />,
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-3 text-xs text-slate-500">
        {roleKey === "ADMIN"
          ? "Admin view: all classes and system-level supervision."
          : roleKey === "CS"
            ? "CS view: classes within your assigned support scope or created by you."
            : "Teacher view: only classes assigned through TeachingSchedule."}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-80">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search class code, name or teacher..."
            aria-label="Search classes"
          />
        </div>

        <FilterSelect
          value={course}
          onChange={onCourse}
          label="Filter by course"
          options={[
            { value: "ALL", label: "All Courses" },
            ...courses.map((item) => ({ value: item.id, label: item.name })),
          ]}
        />

        <FilterSelect
          value={status}
          onChange={onStatus}
          label="Filter by status"
          options={[
            { value: "ALL", label: "All Status" },
            ...classStatuses.map((item) => ({
              value: item,
              label: statusLabel(item),
            })),
          ]}
        />

        <div className="hidden flex-1 2xl:block" />

        <Button onClick={onExport}>
          <Download size={15} />
          Export
        </Button>

        {onCreate && (
          <Button variant="primary" onClick={onCreate}>
            <Plus size={16} />
            Create Class
          </Button>
        )}
      </div>

      {message && (
        <div className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <EntityTable
          label="Classes"
          columns={columns}
          rows={visible}
          getRowId={(classItem) => classItem.id}
          selectedId={selectedId}
          onRowClick={(classItem) => onSelect(classItem.id)}
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPage}
          itemLabel="classes"
          emptyMessage="No classes match your scope and filters."
        />

        <ClassDetail
          classItem={selected}
          roleKey={roleKey}
          canManageCore={canManageCore}
          tab={tab}
          setTab={setTab}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onAdvanceStatus={onAdvanceStatus}
          students={students}
          onAddStudents={onAddStudents}
          onRemoveStudent={onRemoveStudent}
          teachingSchedules={teachingSchedules}
          supportSchedules={supportSchedules}
          onOverrideSupport={onOverrideSupport}
          assignments={assignments}
          exams={exams}
          onCreateAssignment={onCreateAssignment}
          onCreateExam={onCreateExam}
          onEditAssignment={onEditAssignment}
          onAssignmentStatus={onAssignmentStatus}
          onEditExam={onEditExam}
          onExamStatus={onExamStatus}
          results={results}
          onRecordResult={onRecordResult}
          auditLogs={auditLogs}
        />
      </div>
    </div>
  );
}
