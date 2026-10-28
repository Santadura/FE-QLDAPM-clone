import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import RangeStaffingPanel from "./RangeStaffingPanel";
import { CompactDayAgenda } from "./CompactDayAgenda";
import AssignmentConfirmDialog from "./AssignmentConfirmDialog";
import { buildDayAgenda } from "./dayAgenda";
import { schedulingApi } from "../../services/api";
import { classApi } from "../../services/classApi";
import {
  csWorkTypes,
  saleWorkTypes,
  workplaceOptions,
} from "./mockStaffAssignment";
import { addDays, iso, mondayOf } from "./schedulingUtils";
import {
  buildWeekDays,
  formatWeekLabel,
  isInsideAvailability,
  normalizeAvailability,
  normalizeClass,
  normalizeEmployee,
  normalizeSchedule,
} from "./schedulingApiAdapters";

const fieldClass =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function StatusBadge({ children, tone = "slate" }) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " +
        styles[tone]
      }
    >
      {children}
    </span>
  );
}

function getWorkTypeLabel(role, value) {
  const source = role === "SALE" ? saleWorkTypes : csWorkTypes;
  return source.find((item) => item.value === value)?.label ?? value;
}

export default function StaffAssignmentView({ staffRole = "SALE" }) {
  const role = staffRole === "CS" ? "CS" : "SALE";
  const isSale = role === "SALE";
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [staff, setStaff] = useState([]);
  const [staffAvailability, setStaffAvailability] = useState([]);
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [planError, setPlanError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [form, setForm] = useState({
    date: iso(mondayOf()),
    startTime: isSale ? "08:30" : "17:30",
    endTime: isSale ? "11:30" : "20:30",
    workplaceId: "center-01",
    workType: isSale ? "SALES_SHIFT" : "CLASS_SUPPORT",
    classId: "",
  });
  const [message, setMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const staffWeekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const latestLoad = useRef(0);
  const currentWeekRef = useRef(iso(weekStart));
  currentWeekRef.current = iso(weekStart);
  const loadData = useCallback(async () => {
    const requestedWeek = iso(weekStart);
    const loadId = ++latestLoad.current;
    setLoading(true);
    setLoadError("");

    try {
      const [peopleRows, availabilityRows, scheduleRows, classRows] =
        await Promise.all([
          schedulingApi.employees(role),
          schedulingApi.availability(role, iso(weekStart)),
          schedulingApi.staff(role, iso(weekStart)),
          classApi.planningClasses(),
        ]);

      const nextStaff = (Array.isArray(peopleRows) ? peopleRows : []).map(
        (row) => normalizeEmployee(row, role),
      );
      const nextAvailability = (
        Array.isArray(availabilityRows) ? availabilityRows : []
      ).map((row) => normalizeAvailability(row, role));
      const nextSchedules = (
        Array.isArray(scheduleRows) ? scheduleRows : []
      ).map((row) => normalizeSchedule(row, role));
      const nextClasses = (Array.isArray(classRows) ? classRows : []).map(
        normalizeClass,
      );

      if (loadId !== latestLoad.current || requestedWeek !== currentWeekRef.current) return;
      setStaff(nextStaff);
      setStaffAvailability(nextAvailability);
      setStaffSchedules(nextSchedules);
      setClasses(nextClasses);
      setSelectedUserId((current) =>
        nextStaff.some((person) => person.id === current)
          ? current
          : nextStaff[0]?.id || "",
      );
      setForm((current) => ({
        ...current,
        // Preserve the chosen lesson when refreshing after a successful
        // course-wide assignment. Resetting to Monday made the weekly status
        // show "outside availability" even though the range save succeeded.
        classId:
          nextClasses.some((item) => item.id === current.classId)
            ? current.classId
            : nextClasses.find((item) =>
                ["READY", "RUNNING"].includes(item.status),
              )?.id || "",
      }));
    } catch (error) {
      if (loadId !== latestLoad.current || requestedWeek !== currentWeekRef.current) return;
      setLoadError(error?.message || "Không thể tải dữ liệu phân công.");
    } finally {
      if (loadId === latestLoad.current && requestedWeek === currentWeekRef.current) setLoading(false);
    }
  }, [role, weekStart]);

  useEffect(() => {
    loadData();
    return () => { latestLoad.current += 1; };
  }, [loadData]);

  const workTypes = isSale ? saleWorkTypes : csWorkTypes;
  const selectedStaff = staff.find((item) => item.id === selectedUserId);

  const visibleStaff = useMemo(
    () =>
      staff.filter((person) => {
        const matchesStaff = staffFilter === "all" || person.id === staffFilter;
        const matchesSearch = (person.fullName + " " + person.employeeCode)
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesStaff && matchesSearch;
      }),
    [staff, staffFilter, search],
  );

  const roleAvailability = staffAvailability.filter(
    (item) => item.staffRole === role,
  );
  const roleSchedules = staffSchedules.filter(
    (item) => item.staffRole === role,
  );
  const approvedAvailabilityCount = roleAvailability.filter(
    (item) => item.status === "APPROVED",
  ).length;

  const selectedDay = staffWeekDays.find((day) => day.date === form.date);
  const selectedCampus = workplaceOptions.find(
    (place) => place.id === form.workplaceId,
  )?.label;
  const matchingApprovedSlots = staffAvailability.filter(
    (availability) =>
      availability.employeeId === selectedUserId &&
      availability.staffRole === role &&
      availability.day === selectedDay?.key &&
      (!availability.availableDate ||
        availability.availableDate === form.date) &&
      isInsideAvailability(
        availability,
        form.startTime,
        form.endTime,
      ),
  );
  const selectedAvailability = matchingApprovedSlots.find(
    (availability) =>
      !selectedCampus || !availability.campus ||
      availability.campus.trim().toLocaleLowerCase("vi") ===
        selectedCampus.trim().toLocaleLowerCase("vi"),
  );

  const conflictingSchedule = staffSchedules.find(
    (schedule) =>
      schedule.employeeId === selectedUserId &&
      schedule.date === form.date &&
      schedule.status === "ASSIGNED" &&
      form.startTime < schedule.endTime &&
      form.endTime > schedule.startTime,
  );

  const assignableClasses = classes.filter((item) =>
    ["READY", "RUNNING"].includes(item.status),
  );
  const needsPlan = role === "CS" && form.workType === "CLASS_SUPPORT";
  useEffect(() => {
    let active = true;
    setPlanned([]);
    setPlanError("");
    if (!form.classId || isSale || form.workType !== "CLASS_SUPPORT")
      return () => { active = false; };
    classApi.plannedSessions(form.classId)
      .then((rows) => { if (active) setPlanned((rows || []).filter((s) => s.status === "PLANNED")); })
      .catch((error) => { if (active) setPlanError(error.message || "Không tải được lịch lớp."); });
    return () => { active = false; };
  }, [form.classId, form.workType, isSale]);

  const planKey = (item) =>
    [String(item.date).slice(0,10),String(item.startTime).slice(0,5),String(item.endTime).slice(0,5)].join("|");
  const currentKey = [form.date,form.startTime,form.endTime].join("|");
  const plannedForWeek = planned.filter((item) =>
    String(item.date).slice(0,10) >= iso(weekStart) &&
    String(item.date).slice(0,10) <= iso(addDays(weekStart,6))
  );
  const matchingPlan = plannedForWeek.find((item) => planKey(item) === currentKey);
  const hasSelectedLesson = !needsPlan || Boolean(matchingPlan);
  const availabilityLabel = !hasSelectedLesson
    ? "Chưa chọn buổi"
    : selectedAvailability
      ? "Phù hợp buổi này"
      : matchingApprovedSlots.length
        ? "Khác cơ sở"
        : "Ngoài lịch rảnh buổi này";
  const occupiedSlots = new Set(staffSchedules
    .filter((s) => s.classId === form.classId && s.status === "ASSIGNED" &&
      s.workType === "CLASS_SUPPORT")
    .map(planKey));
  const uncoveredSlots = plannedForWeek.filter((item) => !occupiedSlots.has(planKey(item)));
  function choosePlannedSlot(key) {
    const item = plannedForWeek.find((s) => planKey(s) === key);
    if (item) setForm((current) => ({
      ...current,date:String(item.date).slice(0,10),
      startTime:String(item.startTime).slice(0,5),endTime:String(item.endTime).slice(0,5),
    }));
    setMessage(null);
  }

  function selectStaff(person) {
    setSelectedUserId(person.id);
    setMessage(null);
  }

  function selectAvailability(person, availability) {
    const day = staffWeekDays.find((item) => item.key === availability.day);

    setSelectedUserId(person.id);
    const candidate = needsPlan && plannedForWeek.find((item) =>
      String(item.date).slice(0,10) === day?.date &&
      String(item.startTime).slice(0,5) >= availability.startTime &&
      String(item.endTime).slice(0,5) <= availability.endTime,
    );
    setForm((current) => ({
      ...current,
      ...(needsPlan ? (candidate ? {
        date:String(candidate.date).slice(0,10),
        startTime:String(candidate.startTime).slice(0,5),
        endTime:String(candidate.endTime).slice(0,5),
      } : {}) : {
        date:day?.date ?? current.date,
        startTime:availability.startTime,endTime:availability.endTime,
      }),
      workplaceId: availability.workplaceId,
    }));
    setMessage(null);
  }

  async function submitAssignment() {
    setMessage(null);

    if (!selectedStaff) {
      setMessage({ type: "error", text: "Vui lòng chọn nhân viên." });
      return;
    }

    if (needsPlan && !matchingPlan) {
      setMessage({ type: "error", text: "Hãy chọn đúng buổi học có trong kế hoạch lớp." });
      return;
    }
    if (!selectedAvailability) {
      setMessage({
        type: "error",
        text: "Khung giờ đã chọn không nằm trọn trong lịch rảnh đã được duyệt của nhân viên.",
      });
      return;
    }

    if (conflictingSchedule) {
      setMessage({
        type: "error",
        text: "Nhân viên đã có ca làm trùng với khung giờ này.",
      });
      return;
    }

    try {
      await schedulingApi.assignStaff({
        employeeId: selectedStaff.id,
        staffRole: role,
        workplaceId: form.workplaceId,
        classId:
          role === "CS" && form.workType === "CLASS_SUPPORT"
            ? form.classId || null
            : null,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        workType: form.workType,
      });

      setMessage({
        type: "success",
        text:
          "Đã phân công " +
          selectedStaff.fullName +
          " vào " +
          getWorkTypeLabel(role, form.workType) +
          ".",
      });
      await loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Không thể lưu phân công.",
      });
    }
  }

  async function reviewSlot(item, status) {
    try {
      await schedulingApi.reviewAvailability(item.id, status);
      setMessage({ type: "success", text: "Đã duyệt lịch rảnh." });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Không thể xét duyệt." });
    }
  }

  async function assignWeek() {
    setMessage(null);
    if (!selectedStaff || !form.classId || !needsPlan || !uncoveredSlots.length) return;
    try {
      await schedulingApi.assignSupportBatch({
        employeeId:selectedStaff.id,classId:form.classId,workplaceId:form.workplaceId,
        sessionIds:uncoveredSlots.map((item) => item.id),
      });
      setMessage({ type: "success", text: `Đã phân công CS cho ${uncoveredSlots.length} buổi hỗ trợ.` });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Không thể phân công tuần. Không có ca nào được lưu." });
    }
  }

  function cancelStaffAssignment(schedule) {
    setConfirmAction({ kind: "cancel", schedule });
  }

  function replaceStaff(schedule) {
    if (!selectedStaff || schedule.employeeId === selectedStaff.id) return;
    setConfirmAction({
      kind: "replace", schedule,
      targetId: selectedStaff.id,
      targetName: selectedStaff.fullName,
    });
  }

  async function performCancelStaffAssignment(schedule) {
    try {
      await schedulingApi.cancelStaff(schedule.id);
      setMessage({ type: "success", text: "Đã hủy phân công; lịch sử được giữ lại." });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Không thể hủy phân công." });
    }
  }

  async function performReplaceStaff(schedule, targetId) {
    try {
      if (role === "CS" && schedule.workType === "CLASS_SUPPORT" && schedule.classId) {
        const sessions = await classApi.plannedSessions(schedule.classId);
        const lesson = (sessions || []).find((slot) =>
          slot.status === "PLANNED" && planKey(slot) === planKey(schedule));
        if (!lesson) throw new Error("Không tìm thấy buổi hỗ trợ lớp đang hoạt động.");
        await classApi.assignStaffingRange(schedule.classId, {
          role: "CS", employeeId: targetId,
          workplaceId: schedule.workplaceId || form.workplaceId,
          mode: "REPLACE", sessionIds: [lesson.id],
        });
      } else {
        await schedulingApi.updateStaff(schedule.id, {
          employeeId: targetId, staffRole: role, workplaceId: schedule.workplaceId,
          classId: schedule.classId || null, date: schedule.date,
          startTime: schedule.startTime, endTime: schedule.endTime, workType: schedule.workType,
        });
      }
      setMessage({ type: "success", text: "Đã thay nhân sự buổi này, giữ nguyên lịch cũ trong lịch sử." });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Không đổi được nhân sự." });
    }
  }

  async function confirmAssignmentAction() {
    if (!confirmAction || confirmBusy) return;
    const pending = confirmAction;
    setConfirmBusy(true);
    try {
      if (pending.kind === "cancel") {
        await performCancelStaffAssignment(pending.schedule);
      } else {
        await performReplaceStaff(pending.schedule, pending.targetId);
      }
      setConfirmAction(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  return (
    <div className="space-y-4 font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Lịch rảnh & Phân công {isSale ? "Sale" : "CS"}
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isSale
              ? "Xem lịch rảnh của Sale, kiểm tra ca tư vấn đã xếp và phân công công việc ngay trên cùng một màn hình."
              : "Xem lịch rảnh của CS, kiểm tra ca hỗ trợ đã xếp và phân công công việc ngay trên cùng một màn hình."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">{staff.length}</strong>
            <span className="text-[11px] text-slate-500">{isSale ? "Sale" : "CS"}</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">
              {approvedAvailabilityCount}
            </strong>
            <span className="text-[11px] text-slate-500">Slot rảnh</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">
              {roleSchedules.length}
            </strong>
            <span className="text-[11px] text-slate-500">Ca đã xếp</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-center">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-72">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={"Tìm " + (isSale ? "Sale" : "CS") + "..."}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 outline-none"
          />
        </div>

        <select
          className={fieldClass + " xl:w-56"}
          value={staffFilter}
          onChange={(event) => setStaffFilter(event.target.value)}
        >
          <option value="all">
            Tất cả {isSale ? "Sale" : "CS"}
          </option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-md border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            className="px-2.5 py-2 text-slate-400 hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="border-x border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
            {formatWeekLabel(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            className="px-2.5 py-2 text-slate-400 hover:bg-slate-50"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {(loading || loadError) && (
        <div
          className={
            "rounded-lg border px-4 py-3 text-sm " +
            (loadError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-500")
          }
        >
          {loadError || "Đang tải lịch nhân sự..."}
        </div>
      )}

      <div className={isSale
        ? "grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_370px]"
        : "grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_350px]"}>
        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className={isSale ? "overflow-x-auto" : "max-h-[min(72vh,760px)] overflow-auto overscroll-contain"}>
            <div className="min-w-[1000px]">
              <div className={(isSale ? "" : "sticky top-0 z-10 ") +
                "grid grid-cols-[200px_repeat(7,minmax(112px,1fr))] border-b border-slate-200 bg-slate-50"}>
                <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {isSale ? "Sale" : "CS"}
                </div>
                {staffWeekDays.map((day) => (
                  <div
                    key={day.key}
                    className="border-l border-slate-200 px-2 py-2 text-center"
                  >
                    <strong className="block text-xs text-slate-700">
                      {day.label}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {day.displayDate}
                    </span>
                  </div>
                ))}
              </div>

              {visibleStaff.map((person) => (
                <div
                  key={person.id}
                  className={(isSale ? "min-h-32 " : "h-[164px] ") + "grid grid-cols-[200px_repeat(7,minmax(112px,1fr))] border-b border-slate-200 last:border-b-0"}
                >
                  <button
                    type="button"
                    onClick={() => selectStaff(person)}
                    className={
                      "px-3 py-4 text-left transition " +
                      (selectedUserId === person.id
                        ? "bg-blue-50"
                        : "bg-slate-50 hover:bg-slate-100")
                    }
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173557] text-xs font-semibold text-white">
                        {person.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <StatusBadge tone={isSale ? "emerald" : "violet"}>
                        {role}
                      </StatusBadge>
                    </div>
                    <strong className="block text-xs font-semibold text-slate-900">
                      {person.fullName}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {person.employeeCode}
                    </span>
                  </button>

                  {staffWeekDays.map((day) => {
                    const availabilities = staffAvailability.filter(
                      (item) =>
                        item.employeeId === person.id &&
                        item.staffRole === role &&
                        item.day === day.key &&
                        (!item.availableDate || item.availableDate === day.date),
                    );
                    const schedules = staffSchedules.filter(
                      (schedule) =>
                        schedule.employeeId === person.id &&
                        schedule.staffRole === role &&
                        schedule.date === day.date &&
                        schedule.status === "ASSIGNED",
                    );

                    return isSale ? (
                      <div
                        key={day.key}
                        className="space-y-1.5 border-l border-slate-200 p-2"
                      >
                        {availabilities.map((availability) => (
                          <button
                            key={availability.id}
                            type="button"
                            onClick={() =>
                              selectAvailability(person, availability)
                            }
                            className={
                              "w-full rounded-md border px-2 py-1.5 text-left transition " +
                              (availability.status === "APPROVED"
                                ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                : "border-amber-200 bg-amber-50 hover:bg-amber-100")
                            }
                          >
                            <span className="block text-[11px] font-semibold text-slate-700">
                              {availability.startTime}–{availability.endTime}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {availability.status === "APPROVED"
                                ? "Rảnh"
                                : "Chờ duyệt"}
                            </span>
                          </button>
                        ))}
                        {availabilities.filter((item) => item.status === "PENDING").map((item) => (
                          <div key={`review-${item.id}`} className="flex gap-1 text-[10px]">
                            <button type="button" className="text-emerald-700 underline"
                              onClick={() => reviewSlot(item,"APPROVED")}>Duyệt</button>
                            <button type="button" className="text-red-700 underline"
                              onClick={() => reviewSlot(item,"REJECTED")}>Từ chối</button>
                          </div>
                        ))}

                        {schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5"
                          >
                            <span className="block text-[10px] font-semibold uppercase text-blue-700">
                              Đã xếp ca
                            </span>
                            <span className="block text-[11px] font-medium text-slate-700">
                              {schedule.startTime}–{schedule.endTime}
                            </span>
                            <span className="block truncate text-[10px] text-slate-500">
                              {getWorkTypeLabel(role, schedule.workType)}
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <button type="button" className="text-[10px] text-blue-700 underline"
                                onClick={() => replaceStaff(schedule)}>Đổi nhân sự</button>
                              <button type="button" className="text-[10px] text-rose-700 underline"
                                onClick={() => cancelStaffAssignment(schedule)}>Hủy phân công</button>
                            </div>
                          </div>
                        ))}

                        {!availabilities.length && !schedules.length && (
                          <div className="pt-8 text-center text-slate-300">—</div>
                        )}
                      </div>                    ) : (
                      <CompactDayAgenda
                        key={day.date}
                        items={buildDayAgenda(
                          availabilities,
                          schedules,
                          (schedule) => {
                            const workType = getWorkTypeLabel(role, schedule.workType);
                            const classCode = classes.find((item) => item.id === schedule.classId)?.classCode;
                            return classCode ? workType + " · " + classCode : workType;
                          },
                        )}
                        name={person.fullName}
                        date={day.date}
                        onChooseAvailability={(item) => selectAvailability(person, item)}
                        onReview={reviewSlot}
                        onReplace={replaceStaff}
                        onCancel={cancelStaffAssignment}
                        replacementName={selectedStaff?.fullName}
                        replacementIsDifferent={Boolean(selectedUserId && selectedUserId !== person.id)}
                      />
                    );
                  })}
                </div>
              ))}

              {!visibleStaff.length && (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Không có nhân viên phù hợp bộ lọc.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Lịch rảnh đã duyệt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Chờ duyệt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Đã phân công
            </span>
          </div>
        </section>

        <aside className={isSale
          ? "rounded-lg border border-slate-200 bg-white shadow-sm"
          : "min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto"}>
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <BriefcaseBusiness size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Phân công {isSale ? "Sale" : "CS"}
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">
                Nhân viên đã chọn
              </span>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-slate-900">
                  {selectedStaff?.fullName || "Chưa chọn"}
                </strong>
                {selectedStaff && (
                  <StatusBadge tone={isSale ? "emerald" : "violet"}>
                    {role}
                  </StatusBadge>
                )}
              </div>
              {selectedStaff && (
                <span className="mt-1 block text-[11px] text-slate-400">
                  {selectedStaff.employeeCode}
                </span>
              )}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Công việc / Loại ca
              </span>
              <select
                className={fieldClass}
                value={form.workType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    workType: event.target.value,
                  }))
                }
              >
                {workTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {!isSale && form.workType === "CLASS_SUPPORT" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Lớp cần hỗ trợ
                </span>
                <select
                  className={fieldClass}
                  value={form.classId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      classId: event.target.value, date: "", startTime: "", endTime: "",
                    }))
                  }
                >
                  {assignableClasses.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.classCode} · {classItem.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {needsPlan ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Buổi học cần hỗ trợ
                </span>
                <select className={fieldClass}
                  value={matchingPlan ? currentKey : ""}
                  onChange={(event) => choosePlannedSlot(event.target.value)}>
                  <option value="">Chọn buổi trong lịch đã lập</option>
                  {plannedForWeek.map((slot) => (
                    <option key={slot.id} value={planKey(slot)}>
                      {String(slot.date).slice(0,10)} · {String(slot.startTime).slice(0,5)}–{String(slot.endTime).slice(0,5)}
                    </option>
                  ))}
                </select>
                {planError ? <span className="text-xs text-red-600">{planError}</span> : null}
                {!plannedForWeek.length ? <span className="text-xs text-amber-700">
                  Lớp chưa có buổi học trong tuần này.
                </span> : null}
              </label>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Ngày làm
                  </span>
                  <select className={fieldClass} value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date:event.target.value }))}>
                    {staffWeekDays.map((day) => (
                      <option key={day.date} value={day.date}>
                        {day.label} · {day.date}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>Bắt đầu
                    <input type="time" className={fieldClass} value={form.startTime}
                      onChange={(event) => setForm((current) => ({ ...current,startTime:event.target.value }))} />
                  </label>
                  <label>Kết thúc
                    <input type="time" className={fieldClass} value={form.endTime}
                      onChange={(event) => setForm((current) => ({ ...current,endTime:event.target.value }))} />
                  </label>
                </div>
              </>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Cơ sở
              </span>
              <select
                className={fieldClass}
                value={form.workplaceId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    workplaceId: event.target.value,
                  }))
                }
              >
                {workplaceOptions.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2 rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 size={14} />
                  Kiểm tra lịch rảnh
                </span>
                <StatusBadge tone={hasSelectedLesson && selectedAvailability ? "emerald" : "amber"}>
                  {availabilityLabel}
                </StatusBadge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={14} />
                  Trùng ca
                </span>
                {!hasSelectedLesson ? (
                  <StatusBadge tone="amber">Chưa chọn buổi</StatusBadge>
                ) : conflictingSchedule ? (
                  <StatusBadge tone="amber">Có xung đột</StatusBadge>
                ) : (
                  <StatusBadge tone="emerald">Không xung đột buổi này</StatusBadge>
                )}
              </div>
            </div>
            {needsPlan && (
              <p className="text-[11px] leading-5 text-slate-500">
                Hai trạng thái phía trên chỉ kiểm tra buổi được chọn trong
                phần “Phân công nhanh trong tuần đang xem”, không phản ánh toàn khóa.
                Kết quả phân công toàn khóa được thể hiện riêng bên dưới.
              </p>
            )}

            {message && (
              <div
                className={
                  "rounded-md border px-3 py-2 text-xs " +
                  (message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700")
                }
              >
                {message.type === "success" && (
                  <CheckCircle2 size={14} className="mr-1 inline" />
                )}
                {message.text}
              </div>
            )}

            {needsPlan && (
              <RangeStaffingPanel
                role="CS"
                classId={form.classId}
                employeeId={selectedStaff?.id}
                employeeName={selectedStaff?.fullName}
                workplaceId={form.workplaceId}
                singleSessionId={matchingPlan?.id}
                onApplied={loadData}
              />
            )}
            {needsPlan && (
              <p className="text-[11px] font-medium text-slate-500">
                Phân công nhanh trong tuần đang xem
              </p>
            )}
            <Button
              variant="primary"
              className="w-full"
              onClick={submitAssignment}
              disabled={!selectedStaff || (needsPlan && !matchingPlan)}
            >
              <UserCheck size={16} />
              {needsPlan ? "Phân công riêng buổi đã chọn" : "Xác nhận phân công"}
            </Button>
            {needsPlan ? (
              <Button className="w-full" onClick={assignWeek}
                disabled={!selectedStaff || !form.classId || !uncoveredSlots.length}>
                Phân công {uncoveredSlots.length} buổi hỗ trợ chưa có CS trong tuần
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
      <AssignmentConfirmDialog
        action={confirmAction}
        personName={staff.find((person) => person.id === confirmAction?.schedule.employeeId)?.fullName}
        classCode={classes.find((item) => item.id === confirmAction?.schedule.classId)?.classCode}
        busy={confirmBusy}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAssignmentAction}
      />
    </div>
  );
}
