export const classStatuses = [
  "DRAFT",
  "READY",
  "RUNNING",
  "COMPLETED",
  "CLOSED",
];

export const courses = [
  { id: "course-ielts", name: "IELTS" },
  { id: "course-toeic", name: "TOEIC" },
  { id: "course-sat", name: "SAT" },
  { id: "course-toefl", name: "TOEFL iBT" },
];

export const initialClasses = [
  {
    id: "class-0001",
    courseId: "course-ielts",
    classCode: "IELTS-M75-04",
    name: "IELTS Mastery 7.5",
    startDate: "2026-10-06",
    endDate: "2027-01-30",
    status: "RUNNING",
    createdBy: "admin-demo",
  },
  {
    id: "class-0002",
    courseId: "course-toeic",
    classCode: "TOEIC-850-02",
    name: "TOEIC Intensive 850+",
    startDate: "2026-10-12",
    endDate: "2027-01-15",
    status: "READY",
    createdBy: "admin-demo",
  },
  {
    id: "class-0003",
    courseId: "course-toefl",
    classCode: "TOEFL-IBT-01",
    name: "TOEFL iBT Complete",
    startDate: "2026-09-15",
    endDate: "2026-12-20",
    status: "RUNNING",
    createdBy: "cs-demo",
  },
  {
    id: "class-0004",
    courseId: "course-sat",
    classCode: "SAT-ADV-03",
    name: "SAT Math Advanced",
    startDate: "2026-11-01",
    endDate: "2027-02-28",
    status: "DRAFT",
    createdBy: "admin-demo",
  },
  {
    id: "class-0005",
    courseId: "course-ielts",
    classCode: "IELTS-F65-08",
    name: "IELTS Foundation 6.5",
    startDate: "2026-08-01",
    endDate: "2026-11-30",
    status: "COMPLETED",
    createdBy: "cs-demo",
  },
  {
    id: "class-0006",
    courseId: "course-ielts",
    classCode: "IELTS-WR-02",
    name: "IELTS Writing Intensive",
    startDate: "2026-10-20",
    endDate: "2026-12-22",
    status: "READY",
    createdBy: "admin-demo",
  },
  {
    id: "class-0007",
    courseId: "course-toeic",
    classCode: "TOEIC-650-01",
    name: "TOEIC Foundation 650",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    status: "CLOSED",
    createdBy: "admin-demo",
  },
  {
    id: "class-0008",
    courseId: "course-sat",
    classCode: "SAT-FOUND-01",
    name: "SAT Foundation",
    startDate: "2026-10-25",
    endDate: "2027-02-10",
    status: "DRAFT",
    createdBy: "cs-demo",
  },
];

export const PAGE_SIZE = 7;

export const emptyClassForm = {
  courseId: courses[0].id,
  classCode: "",
  name: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
};
