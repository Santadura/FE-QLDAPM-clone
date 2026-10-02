import {
  ChevronDown,
  Download,
  Plus,
  Search,
  Users,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";
import { classStatuses, courses } from "./mockClasses";

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

function courseName(courseId) {
  return courses.find((course) => course.id === courseId)?.name ?? "—";
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

function RelationPlaceholder({ icon: Icon, title, description }) {
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

function ClassDetail({
  classItem,
  tab,
  setTab,
  onClose,
  onEdit,
  onAdvanceStatus,
}) {
  const currentIndex = classItem
    ? classStatuses.indexOf(classItem.status)
    : -1;
  const nextStatus =
    currentIndex >= 0 && currentIndex < classStatuses.length - 1
      ? classStatuses[currentIndex + 1]
      : null;

  return (
    <DetailPanel
      title="Class Detail"
      tabs={
        classItem
          ? [
              { key: "Overview", label: "Overview" },
              { key: "Students", label: "Students" },
              { key: "Schedule", label: "Schedule" },
              { key: "Assignments", label: "Assignments" },
            ]
          : []
      }
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      footer={
        classItem && (
          <div className="grid gap-2">
            <Button variant="primary" className="w-full" onClick={onEdit}>
              Edit Class Details
            </Button>
            {nextStatus && (
              <Button className="w-full" onClick={() => onAdvanceStatus(nextStatus)}>
                Move to {statusLabel(nextStatus)}
              </Button>
            )}
          </div>
        )
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
                    {courseName(classItem.courseId)}
                  </strong>
                </div>
                <div>
                  <span className={labelClass}>Status</span>
                  <StatusLabel status={classItem.status} />
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

              <div className="py-3.5 text-[13px]">
                <span className={labelClass}>Created by</span>
                <span className="font-mono text-xs text-slate-500">
                  {classItem.createdBy}
                </span>
              </div>
            </>
          )}

          {tab === "Students" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={Users}
                title="No ClassStudent data connected yet"
                description="Students assigned to this class will be displayed here through the ClassStudent relationship."
              />
            </div>
          )}

          {tab === "Schedule" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={CalendarDays}
                title="No teaching schedule connected yet"
                description="Teacher assignment and teaching schedule will be displayed here from TeachingSchedule."
              />
            </div>
          )}

          {tab === "Assignments" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={ClipboardList}
                title="No assignments connected yet"
                description="Assignments and exams belonging to this class will appear here when those modules are implemented."
              />
            </div>
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
  search,
  onSearch,
  course,
  onCourse,
  status,
  onStatus,
  onExport,
  onCreate,
  visible,
  selectedId,
  checked,
  onToggleAll,
  onToggleOne,
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
}) {
  const columns = [
    {
      key: "classCode",
      label: "Class Code",
      width: "w-[18%]",
      cellClassName: "font-mono text-xs break-all",
    },
    {
      key: "name",
      label: "Class Name",
      width: "w-[28%]",
      cellClassName: "font-medium text-slate-900",
    },
    {
      key: "courseId",
      label: "Course",
      width: "w-[18%]",
      render: (classItem) => courseName(classItem.courseId),
    },
    {
      key: "startDate",
      label: "Start",
      width: "w-[18%]",
      render: (classItem) => formatDate(classItem.startDate),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[18%]",
      render: (classItem) => <StatusLabel status={classItem.status} />,
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-80">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by class code or name..."
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

        <Button variant="primary" onClick={onCreate}>
          <Plus size={16} />
          Create Class
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
        <EntityTable
          label="Classes"
          columns={columns}
          rows={visible}
          getRowId={(classItem) => classItem.id}
          selectedId={selectedId}
          onRowClick={(classItem) => onSelect(classItem.id)}
          checkedIds={checked}
          onToggleRow={onToggleOne}
          onTogglePage={onToggleAll}
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPage}
          itemLabel="classes"
          emptyMessage="No classes match your filters."
        />

        <ClassDetail
          classItem={selected}
          tab={tab}
          setTab={setTab}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onAdvanceStatus={onAdvanceStatus}
        />
      </div>
    </div>
  );
}
