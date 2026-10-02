import { useMemo, useState } from "react";
import ClassesView from "../features/classes/ClassesView";
import ClassFormModal from "../features/classes/ClassFormModal";
import {
  emptyClassForm,
  initialClasses,
  PAGE_SIZE,
  courses,
} from "../features/classes/mockClasses";

export default function Classes() {
  const [classes, setClasses] = useState(initialClasses);
  const [selectedId, setSelectedId] = useState(initialClasses[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [checked, setChecked] = useState([]);
  const [editing, setEditing] = useState(undefined);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return classes.filter((classItem) => {
      const searchable = `${classItem.classCode} ${classItem.name}`.toLowerCase();

      return (
        searchable.includes(keyword) &&
        (course === "ALL" || classItem.courseId === course) &&
        (status === "ALL" || classItem.status === status)
      );
    });
  }, [classes, search, course, status]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = classes.find((classItem) => classItem.id === selectedId) ?? null;
  const allVisibleChecked =
    visible.length > 0 &&
    visible.every((classItem) => checked.includes(classItem.id));

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setChecked([]);
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
        ? current.filter((id) => !visible.some((classItem) => classItem.id === id))
        : [...new Set([...current, ...visible.map((classItem) => classItem.id)])],
    );
  }

  function exportCsv() {
    const rows = checked.length
      ? classes.filter((classItem) => checked.includes(classItem.id))
      : filtered;

    const csv = [
      [
        "Class Code",
        "Class Name",
        "Course",
        "Start Date",
        "End Date",
        "Status",
        "Created By",
      ],
      ...rows.map((classItem) => [
        classItem.classCode,
        classItem.name,
        courses.find((item) => item.id === classItem.courseId)?.name ?? "",
        classItem.startDate,
        classItem.endDate,
        classItem.status,
        classItem.createdBy,
      ]),
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

  function saveClass(form) {
    if (editing) {
      setClasses((current) =>
        current.map((classItem) =>
          classItem.id === editing.id
            ? {
                ...classItem,
                ...form,
              }
            : classItem,
        ),
      );
    } else {
      const newClass = {
        ...form,
        id: `class-${Date.now()}`,
        createdBy: "admin-demo",
      };

      setClasses((current) => [newClass, ...current]);
      setSelectedId(newClass.id);
      setPage(1);
      setSearch("");
      setCourse("ALL");
      setStatus("ALL");
    }

    setEditing(undefined);
    setTab("Overview");
  }

  function advanceStatus(nextStatus) {
    if (!selected) return;

    setClasses((current) =>
      current.map((classItem) =>
        classItem.id === selected.id
          ? {
              ...classItem,
              status: nextStatus,
            }
          : classItem,
      ),
    );
  }

  return (
    <>
      <ClassesView
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        course={course}
        onCourse={(value) => changeFilter(setCourse, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        onExport={exportCsv}
        onCreate={() => setEditing(null)}
        visible={visible}
        selectedId={selectedId}
        checked={checked}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onSelect={(id) => {
          setSelectedId(id);
          setTab("Overview");
        }}
        filteredCount={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        selected={selected}
        tab={tab}
        setTab={setTab}
        onCloseDetail={() => setSelectedId(null)}
        onEdit={() => setEditing(selected)}
        onAdvanceStatus={advanceStatus}
      />

      {editing !== undefined && (
        <ClassFormModal
          classItem={editing}
          emptyForm={emptyClassForm}
          onClose={() => setEditing(undefined)}
          onSave={saveClass}
        />
      )}
    </>
  );
}
