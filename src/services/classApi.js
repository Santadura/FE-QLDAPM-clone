import { apiRequest } from "./api";

export const classApi = {
  list: () => apiRequest("/classes"),
  detail: (classId) => apiRequest(`/classes/${classId}`),
  courses: () => apiRequest("/classes/courses"),
  create: (payload) =>
    apiRequest("/classes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (classId, payload) =>
    apiRequest(`/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  changeStatus: (classId, status) =>
    apiRequest(`/classes/${classId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  addStudents: (classId, studentIds) =>
    apiRequest(`/classes/${classId}/students`, {
      method: "POST",
      body: JSON.stringify({ studentIds }),
    }),
  removeStudent: (classId, studentId) =>
    apiRequest(`/classes/${classId}/students/${studentId}`, {
      method: "DELETE",
    }),
  eligibility: (classId, studentId) =>
    apiRequest(`/classes/${classId}/students/${studentId}/eligibility`),
  studentCandidates: (classId) =>
    apiRequest(`/classes/${classId}/student-candidates`),
  createAssignment: (classId, payload) =>
    apiRequest(`/classes/${classId}/assignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateAssignment: (classId, assignmentId, payload) =>
    apiRequest(`/classes/${classId}/assignments/${assignmentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  changeAssignmentStatus: (classId, assignmentId, status) =>
    apiRequest(`/classes/${classId}/assignments/${assignmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  createExam: (classId, payload) =>
    apiRequest(`/classes/${classId}/exams`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateExam: (classId, examId, payload) =>
    apiRequest(`/classes/${classId}/exams/${examId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  changeExamStatus: (classId, examId, status) =>
    apiRequest(`/classes/${classId}/exams/${examId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  upsertResult: (classId, payload) =>
    apiRequest(`/classes/${classId}/results`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  overrideSupport: (classId, scheduleId, payload) =>
    apiRequest(`/classes/${classId}/staff-schedules/${scheduleId}/override`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
