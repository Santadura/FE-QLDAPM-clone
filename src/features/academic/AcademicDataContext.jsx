import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { studentApi } from "../../services/studentApi";
import { classApi } from "../../services/classApi";

const AcademicDataContext = createContext(null);

function toDateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function toTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function mergeById(...lists) {
  const map = new Map();
  lists.flat().filter(Boolean).forEach((item) => {
    if (item?.id) map.set(item.id, { ...(map.get(item.id) ?? {}), ...item });
  });
  return [...map.values()];
}

function mergeMemberships(...lists) {
  const map = new Map();
  lists.flat().filter(Boolean).forEach((item) => {
    if (!item?.classId || !item?.studentId) return;
    const key = `${item.classId}:${item.studentId}`;
    map.set(key, { ...(map.get(key) ?? {}), ...item });
  });
  return [...map.values()];
}

function mapStudentSummary(item) {
  return {
    id: item.studentId,
    studentCode: item.studentCode,
    fullName: item.fullName,
    email: item.email ?? "",
    phone: item.phone ?? "",
    level: item.level ?? "",
    status: item.status,
    tone: "slate",
  };
}

function mapStudentDetail(detail) {
  const student = mapStudentSummary(detail);

  return {
    student,
    targets: (detail.targets ?? []).map((target) => ({
      id: target.id,
      studentId: detail.studentId,
      courseId: target.courseId,
      targetType: target.targetType,
      targetValue: Number(target.targetValue),
    })),
    memberships: (detail.classes ?? []).map((item) => ({
      id: item.membershipId,
      studentId: detail.studentId,
      classId: item.classId,
      status: item.membershipStatus,
      joinedAt: item.joinedAt,
      inactiveReason: item.inactiveReason,
      inactivatedAt: item.inactivatedAt,
    })),
    results: (detail.results ?? []).map((item) => ({
      id: item.id,
      studentId: detail.studentId,
      classId: item.classId,
      assignmentId: item.assignmentId,
      examId: item.examId,
      score: item.score,
      feedback: item.feedback ?? "",
      evaluatedBy: item.evaluatedBy,
      evaluatedAt: item.evaluatedAt,
    })),
  };
}

function mapClassSummary(item) {
  return {
    id: item.classId,
    courseId: item.courseId,
    courseName: item.courseName,
    classCode: item.classCode,
    name: item.name,
    startDate: toDateOnly(item.startDate),
    endDate: toDateOnly(item.endDate),
    status: item.status,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    studentCount: item.studentCount,
    teacherNames: item.teacherNames ?? [],
  };
}

function mapClassDetail(detail) {
  const classItem = {
    id: detail.classId,
    courseId: detail.course?.courseId,
    courseName: detail.course?.name,
    classCode: detail.classCode,
    name: detail.name,
    startDate: toDateOnly(detail.startDate),
    endDate: toDateOnly(detail.endDate),
    status: detail.status,
    createdBy: detail.createdBy,
    createdAt: detail.createdAt,
  };

  return {
    classItem,
    requirements: (detail.targetRequirements ?? []).map((item) => ({
      id: item.id,
      classId: detail.classId,
      targetType: item.targetType,
      requiredTarget: Number(item.requiredTarget),
    })),
    memberships: (detail.students ?? []).map((student) => ({
      id: `${detail.classId}:${student.studentId}`,
      classId: detail.classId,
      studentId: student.studentId,
      status: student.membershipStatus ?? "ACTIVE",
      joinedAt: student.joinedAt,
    })),
    rosterStudents: (detail.students ?? []).map((student) => ({
      id: student.studentId,
      studentCode: student.studentCode,
      fullName: student.fullName,
      phone: student.phone ?? "",
      email: student.email ?? "",
      status: student.status,
      tone: "slate",
    })),
    teachingSchedules: (detail.teachingSchedules ?? []).map((item) => ({
      id: item.id,
      classId: detail.classId,
      teacherId: item.teacherId,
      teacherName: item.teacherName,
      date: toDateOnly(item.date),
      startTime: toTime(item.startTime),
      endTime: toTime(item.endTime),
      status: item.status,
    })),
    staffSchedules: (detail.staffSchedules ?? []).map((item) => ({
      id: item.id,
      classId: detail.classId,
      userId: item.employeeId,
      employeeName: item.employeeName,
      staffRole: "CS",
      date: toDateOnly(item.date),
      startTime: toTime(item.startTime),
      endTime: toTime(item.endTime),
      workType: item.workType,
      status: item.status,
      assignmentSource: item.assignmentSource,
    })),
    assignments: (detail.assignments ?? []).map((item) => ({
      id: item.id,
      classId: detail.classId,
      teacherId: item.teacherId,
      title: item.title,
      description: item.description ?? "",
      deadline: toDateOnly(item.deadline),
      status: item.status,
      createdAt: item.createdAt,
    })),
    exams: (detail.exams ?? []).map((item) => ({
      id: item.id,
      classId: detail.classId,
      teacherId: item.teacherId,
      title: item.title,
      description: item.description ?? "",
      duration: item.duration,
      examDate: toDateOnly(item.examDate),
      status: item.status,
      createdAt: item.createdAt,
    })),
    results: (detail.results ?? []).map((item) => ({
      id: item.id,
      studentId: item.studentId,
      classId: detail.classId,
      assignmentId: item.assignmentId,
      examId: item.examId,
      score: item.score,
      feedback: item.feedback ?? "",
      evaluatedBy: item.evaluatedBy,
      evaluatedAt: item.evaluatedAt,
    })),
    auditLogs: (detail.auditLogs ?? []).map((item) => ({
      id: item.id,
      userName: item.username ?? "System",
      action: item.action,
      description: item.description ?? "",
      entityType: "CLASS",
      entityId: detail.classId,
      createdAt: item.createdAt,
    })),
  };
}

function studentPayload(form) {
  const targets = Object.fromEntries(
    Object.entries(form.targets ?? {})
      .map(([courseId, values]) => [
        courseId,
        Object.fromEntries(
          Object.entries(values ?? {})
            .filter(([, value]) => value !== "" && value != null)
            .map(([type, value]) => [type, Number(value)]),
        ),
      ])
      .filter(([, values]) => Object.keys(values).length > 0),
  );

  return {
    studentCode: form.studentCode?.trim(),
    fullName: form.fullName?.trim(),
    email: form.email?.trim() || null,
    phone: form.phone?.trim() || null,
    level: form.level?.trim() || null,
    targets,
  };
}

function classPayload(form) {
  const values = form.requiredTargets?.[form.courseId] ?? {};
  return {
    courseId: form.courseId,
    classCode: form.classCode?.trim(),
    name: form.name?.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    targetRequirements: Object.entries(values)
      .filter(([, value]) => value !== "" && value != null)
      .map(([targetType, requiredTarget]) => ({
        targetType,
        requiredTarget: Number(requiredTarget),
      })),
  };
}

function failure(error) {
  return {
    ok: false,
    reason: error?.message || "Request failed.",
    status: error?.status,
  };
}

export function AcademicDataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [studentTargets, setStudentTargets] = useState([]);
  const [classTargetRequirements, setClassTargetRequirements] = useState([]);
  const [classAccessScopes] = useState([]);
  const [teachingSchedules, setTeachingSchedules] = useState([]);
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [studentList, classList, courseList] = await Promise.all([
        studentApi.list(),
        classApi.list(),
        classApi.courses(),
      ]);

      const [studentDetails, classDetails] = await Promise.all([
        Promise.all((studentList ?? []).map((item) => studentApi.detail(item.studentId))),
        Promise.all((classList ?? []).map((item) => classApi.detail(item.classId))),
      ]);

      const mappedStudentDetails = studentDetails.map(mapStudentDetail);
      const mappedClassDetails = classDetails.map(mapClassDetail);

      setStudents(
        mergeById(
          (studentList ?? []).map(mapStudentSummary),
          mappedStudentDetails.map((item) => item.student),
          mappedClassDetails.flatMap((item) => item.rosterStudents),
        ),
      );
      setClasses(
        mergeById(
          (classList ?? []).map(mapClassSummary),
          mappedClassDetails.map((item) => item.classItem),
        ),
      );
      setStudentTargets(mappedStudentDetails.flatMap((item) => item.targets));
      setClassTargetRequirements(
        mappedClassDetails.flatMap((item) => item.requirements),
      );
      setClassStudents(
        mergeMemberships(
          mappedStudentDetails.flatMap((item) => item.memberships),
          mappedClassDetails.flatMap((item) => item.memberships),
        ),
      );
      setTeachingSchedules(
        mappedClassDetails.flatMap((item) => item.teachingSchedules),
      );
      setStaffSchedules(mappedClassDetails.flatMap((item) => item.staffSchedules));
      setAssignments(mappedClassDetails.flatMap((item) => item.assignments));
      setExams(mappedClassDetails.flatMap((item) => item.exams));
      setStudentResults(
        mergeById(
          mappedStudentDetails.flatMap((item) => item.results),
          mappedClassDetails.flatMap((item) => item.results),
        ),
      );
      setAuditLogs(mappedClassDetails.flatMap((item) => item.auditLogs));
      setCourses(
        (courseList ?? []).map((item) => ({
          id: item.courseId,
          name: item.name,
        })),
      );
    } catch (error) {
      setLoadError(error?.message || "Could not load academic data.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData().catch(() => {});
  }, [refreshData]);

  const mutate = useCallback(
    async (request, successValue = {}) => {
      try {
        const response = await request();
        await refreshData();
        return { ok: true, ...successValue, response };
      } catch (error) {
        return failure(error);
      }
    },
    [refreshData],
  );

  const addStudent = useCallback(
    (form) =>
      mutate(async () => {
        const student = await studentApi.create(studentPayload(form));
        return student;
      }).then((result) =>
        result.ok
          ? { ...result, student: mapStudentSummary(result.response) }
          : result,
      ),
    [mutate],
  );

  const updateStudent = useCallback(
    (studentId, form) =>
      mutate(() => studentApi.update(studentId, studentPayload(form))),
    [mutate],
  );

  const deleteStudent = useCallback(
    (studentId) => mutate(() => studentApi.remove(studentId)),
    [mutate],
  );

  const changeStudentStatus = useCallback(
    async (studentId, nextStatus) => {
      try {
        const response = await studentApi.changeStatus(studentId, nextStatus);
        await refreshData();
        return {
          ok: true,
          deactivatedClassIds: response?.deactivatedClassIds ?? [],
        };
      } catch (error) {
        return failure(error);
      }
    },
    [refreshData],
  );

  const addClass = useCallback(
    (form) =>
      mutate(() => classApi.create(classPayload(form))).then((result) =>
        result.ok
          ? { ...result, classItem: mapClassDetail(result.response).classItem }
          : result,
      ),
    [mutate],
  );

  const updateClass = useCallback(
    (classId, form) =>
      mutate(() => classApi.update(classId, classPayload(form))),
    [mutate],
  );

  const advanceClassStatus = useCallback(
    (classId, nextStatus) =>
      mutate(() => classApi.changeStatus(classId, nextStatus)),
    [mutate],
  );

  const assignStudentsToClass = useCallback(
    async (studentIds, classId) => {
      try {
        const response = await classApi.addStudents(classId, studentIds);
        await refreshData();
        return { ok: true, added: response?.affected ?? studentIds.length };
      } catch (error) {
        return failure(error);
      }
    },
    [refreshData],
  );

  const removeStudentFromClass = useCallback(
    (studentId, classId) =>
      mutate(() => classApi.removeStudent(classId, studentId)),
    [mutate],
  );

  const getClassStudentCandidates = useCallback(async (classId) => {
    const rows = await classApi.studentCandidates(classId);
    return (rows ?? []).map((row) => ({
      student: {
        id: row.student.studentId,
        studentCode: row.student.studentCode,
        fullName: row.student.fullName,
        phone: row.student.phone ?? "",
        email: row.student.email ?? "",
        status: row.student.status,
        tone: "slate",
      },
      alreadyActive: row.alreadyActive,
      eligibility: {
        eligible: row.eligibility.eligible,
        code: row.eligibility.code,
        reasons: row.eligibility.reasons ?? [],
        checks: Object.entries(row.eligibility.requiredTargets ?? {}).map(
          ([targetType, requiredTarget]) => ({
            targetType,
            requiredTarget: Number(requiredTarget),
            targetValue:
              row.eligibility.studentTargets?.[targetType] == null
                ? null
                : Number(row.eligibility.studentTargets[targetType]),
          }),
        ),
      },
    }));
  }, []);

  const getStudentClassEligibility = useCallback(
    (studentId, classId) => {
      const student = students.find((item) => item.id === studentId);
      const classItem = classes.find((item) => item.id === classId);
      if (!student || !classItem) {
        return {
          eligible: false,
          reasons: ["Student or class was not found."],
          checks: [],
        };
      }

      const requirements = classTargetRequirements.filter(
        (item) => item.classId === classId,
      );
      const targetMap = new Map(
        studentTargets
          .filter(
            (item) =>
              item.studentId === studentId && item.courseId === classItem.courseId,
          )
          .map((item) => [item.targetType, Number(item.targetValue)]),
      );

      const reasons = [];
      if (student.status !== "Active") reasons.push("Student status must be Active.");
      if (!["DRAFT", "READY", "RUNNING"].includes(classItem.status)) {
        reasons.push("Class is not accepting roster changes.");
      }
      if (!requirements.length) reasons.push("Class target requirement is not configured.");

      const checks = requirements.map((requirement) => {
        const targetValue = targetMap.get(requirement.targetType);
        if (targetValue == null) {
          reasons.push(`Missing target ${requirement.targetType} for this course.`);
        } else if (targetValue < Number(requirement.requiredTarget)) {
          reasons.push(
            `${requirement.targetType} target is below the class requirement.`,
          );
        }
        return {
          targetType: requirement.targetType,
          requiredTarget: Number(requirement.requiredTarget),
          targetValue: targetValue ?? null,
        };
      });

      return { eligible: reasons.length === 0, reasons, checks };
    },
    [students, classes, classTargetRequirements, studentTargets],
  );

  const overrideSupport = useCallback(
    (scheduleId, newCsId, reason, _actor, allowConflict = false) => {
      const schedule = staffSchedules.find((item) => item.id === scheduleId);
      if (!schedule) return Promise.resolve({ ok: false, reason: "Support schedule not found." });

      return mutate(() =>
        classApi.overrideSupport(schedule.classId, scheduleId, {
          newCsId,
          reason,
          allowConflict,
        }),
      );
    },
    [staffSchedules, mutate],
  );

  const addAssignment = useCallback(
    (data) =>
      mutate(() =>
        classApi.createAssignment(data.classId, {
          title: data.title,
          description: data.description,
          deadline: data.deadline,
        }),
      ),
    [mutate],
  );

  const updateAssignment = useCallback(
    (assignmentId, data) => {
      const assignment = assignments.find((item) => item.id === assignmentId);
      if (!assignment) return Promise.resolve({ ok: false, reason: "Assignment not found." });
      return mutate(() =>
        classApi.updateAssignment(assignment.classId, assignmentId, {
          title: data.title,
          description: data.description,
          deadline: data.deadline,
        }),
      );
    },
    [assignments, mutate],
  );

  const changeAssignmentStatus = useCallback(
    (assignmentId, nextStatus) => {
      const assignment = assignments.find((item) => item.id === assignmentId);
      if (!assignment) return Promise.resolve({ ok: false, reason: "Assignment not found." });
      return mutate(() =>
        classApi.changeAssignmentStatus(
          assignment.classId,
          assignmentId,
          nextStatus,
        ),
      );
    },
    [assignments, mutate],
  );

  const addExam = useCallback(
    (data) =>
      mutate(() =>
        classApi.createExam(data.classId, {
          title: data.title,
          description: data.description,
          duration: Number(data.duration),
          examDate: data.examDate,
        }),
      ),
    [mutate],
  );

  const updateExam = useCallback(
    (examId, data) => {
      const exam = exams.find((item) => item.id === examId);
      if (!exam) return Promise.resolve({ ok: false, reason: "Exam not found." });
      return mutate(() =>
        classApi.updateExam(exam.classId, examId, {
          title: data.title,
          description: data.description,
          duration: Number(data.duration),
          examDate: data.examDate,
        }),
      );
    },
    [exams, mutate],
  );

  const changeExamStatus = useCallback(
    (examId, nextStatus) => {
      const exam = exams.find((item) => item.id === examId);
      if (!exam) return Promise.resolve({ ok: false, reason: "Exam not found." });
      return mutate(() =>
        classApi.changeExamStatus(exam.classId, examId, nextStatus),
      );
    },
    [exams, mutate],
  );

  const upsertStudentResult = useCallback(
    (data) =>
      mutate(() =>
        classApi.upsertResult(data.classId, {
          studentId: data.studentId,
          assignmentId: data.assignmentId ?? null,
          examId: data.examId ?? null,
          score: Number(data.score),
          feedback: data.feedback ?? "",
        }),
      ),
    [mutate],
  );

  const value = useMemo(
    () => ({
      students,
      classes,
      classStudents,
      studentTargets,
      classTargetRequirements,
      classAccessScopes,
      teachingSchedules,
      staffSchedules,
      assignments,
      exams,
      studentResults,
      auditLogs,
      courses,
      loading,
      loadError,
      refreshData,
      addStudent,
      updateStudent,
      deleteStudent,
      changeStudentStatus,
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
    }),
    [
      students,
      classes,
      classStudents,
      studentTargets,
      classTargetRequirements,
      classAccessScopes,
      teachingSchedules,
      staffSchedules,
      assignments,
      exams,
      studentResults,
      auditLogs,
      courses,
      loading,
      loadError,
      refreshData,
      addStudent,
      updateStudent,
      deleteStudent,
      changeStudentStatus,
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
    ],
  );

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  );
}

export function useAcademicData() {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used inside AcademicDataProvider");
  }
  return context;
}
