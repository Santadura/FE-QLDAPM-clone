// Display model for compact week cells. Each assignment stays independent.
export function buildDayAgenda(availabilities = [], assignments = [], scheduleLabel = () => "") {
  const items = [
    ...assignments.map((item) => ({
      key: "schedule:" + item.id,
      type: "schedule",
      data: item,
      startTime: String(item.startTime ?? "").slice(0, 5),
      endTime: String(item.endTime ?? "").slice(0, 5),
      status: "Đã xếp",
      subtitle: scheduleLabel(item),
      color: "blue",
    })),
    ...availabilities.map((item) => {
      const status = String(item.status ?? "").toUpperCase();
      return {
        key: "availability:" + item.id,
        type: "availability",
        data: item,
        startTime: String(item.startTime ?? "").slice(0, 5),
        endTime: String(item.endTime ?? "").slice(0, 5),
        status: status === "APPROVED" ? "Rảnh" : status === "PENDING" ? "Chờ duyệt" : "Từ chối",
        subtitle: item.campus ?? "",
        color: status === "APPROVED" ? "green" : status === "PENDING" ? "amber" : "slate",
      };
    }),
  ];
  // Assignments first, then availability. Preserve every item in details.
  return items.sort((a, b) =>
    Number(b.type === "schedule") - Number(a.type === "schedule") ||
    a.startTime.localeCompare(b.startTime) ||
    a.endTime.localeCompare(b.endTime) ||
    a.key.localeCompare(b.key));
}

export function visibleDayAgenda(items, limit = 3) {
  return { shown: items.slice(0, limit), remaining: Math.max(0, items.length - limit) };
}
