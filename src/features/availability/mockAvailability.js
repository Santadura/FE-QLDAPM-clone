export const weekDayDefinitions = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

export const shiftDefinitions = [
  { key: "morning", label: "Buổi sáng", range: "08:30 – 11:30" },
  { key: "afternoon", label: "Buổi chiều", range: "14:00 – 17:00" },
  { key: "evening", label: "Buổi tối", range: "18:00 – 21:00" },
];

// Selecting a different shift resets the suggested hours, while edits within
// the same shift and previously saved custom hours remain untouched.
export function applyAvailabilityShift(form, nextShift) {
  if (form.shift === nextShift) return form;
  const definition = shiftDefinitions.find((shift) => shift.key === nextShift);
  if (!definition) return form;

  const [start, end] = definition.range.split(" – ");
  return { ...form, shift: nextShift, start, end };
}

export const initialAvailability = [
  {
    id: "slot-mon-evening",
    day: "mon",
    shift: "evening",
    start: "18:30",
    end: "20:30",
    status: "verified",
    type: "Lịch rảnh định kỳ",
    campus: "Cơ sở chính",
    note: "Có thể hỗ trợ dạy thay nếu lịch được điều chỉnh.",
    submittedAt: "10/10/2024 · 16:40",
    reviewedAt: "11/10/2024 · 09:15",
  },
  {
    id: "slot-tue-evening",
    day: "tue",
    shift: "evening",
    start: "18:30",
    end: "20:30",
    status: "verified",
    type: "Lịch rảnh định kỳ",
    campus: "Cơ sở chính",
    note: "",
    submittedAt: "10/10/2024 · 16:42",
    reviewedAt: "11/10/2024 · 09:16",
  },
  {
    id: "slot-wed-morning",
    day: "wed",
    shift: "morning",
    start: "08:30",
    end: "11:30",
    status: "verified",
    type: "Lịch rảnh theo tuần",
    campus: "Cơ sở chính",
    note: "",
    submittedAt: "10/10/2024 · 16:44",
    reviewedAt: "11/10/2024 · 09:17",
  },
  {
    id: "slot-thu-afternoon",
    day: "thu",
    shift: "afternoon",
    start: "14:00",
    end: "17:00",
    status: "pending",
    type: "Lịch rảnh theo tuần",
    campus: "Cơ sở chính",
    note: "Ưu tiên xếp lịch tại cơ sở chính.",
    submittedAt: "13/10/2024 · 20:10",
    reviewedAt: "",
  },
  {
    id: "slot-thu-evening",
    day: "thu",
    shift: "evening",
    start: "19:00",
    end: "21:00",
    status: "verified",
    type: "Lịch rảnh định kỳ",
    campus: "Cơ sở chính",
    note: "",
    submittedAt: "10/10/2024 · 16:48",
    reviewedAt: "11/10/2024 · 09:20",
  },
  {
    id: "slot-fri-evening",
    day: "fri",
    shift: "evening",
    start: "18:30",
    end: "20:30",
    status: "verified",
    type: "Lịch rảnh định kỳ",
    campus: "Cơ sở chính",
    note: "",
    submittedAt: "10/10/2024 · 16:50",
    reviewedAt: "11/10/2024 · 09:22",
  },
  {
    id: "slot-sat-morning",
    day: "sat",
    shift: "morning",
    start: "09:00",
    end: "11:30",
    status: "verified",
    type: "Lịch rảnh theo tuần",
    campus: "Cơ sở chính",
    note: "",
    submittedAt: "10/10/2024 · 16:52",
    reviewedAt: "11/10/2024 · 09:24",
  },
];

export const emptyAvailabilityForm = {
  day: "mon",
  shift: "morning",
  start: "08:30",
  end: "11:30",
  type: "Lịch rảnh định kỳ",
  campus: "Cơ sở chính",
  note: "",
};

export function getDurationHours(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
}
