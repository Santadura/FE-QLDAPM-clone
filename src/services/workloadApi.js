import { schedulingApi } from './api'

const ROLE_SCOPES = {
  teacher: ['TEACHER'],
  sale: ['SALE'],
  cs: ['CS'],
}

function monthDates(year, month) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0))
  const monday = new Date(firstDay)
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday)

  const weeks = []
  while (monday <= lastDay) {
    weeks.push(monday.toISOString().slice(0, 10))
    monday.setUTCDate(monday.getUTCDate() + 7)
  }

  return {
    first: firstDay.toISOString().slice(0, 10),
    last: lastDay.toISOString().slice(0, 10),
    weeks,
  }
}

function durationInHours(startTime, endTime) {
  const toMinutes = (time) => {
    const [hours, minutes] = String(time).slice(0, 5).split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutes = toMinutes(endTime) - toMinutes(startTime)
  return minutes > 0 ? minutes / 60 : 0
}

function rolesForManager(roleKey, scope) {
  if (roleKey === 'TC') return ['TEACHER']
  if (roleKey === 'CM') return scope === 'all' ? ['SALE', 'CS'] : ROLE_SCOPES[scope] || []
  return scope === 'all' ? ['TEACHER', 'SALE', 'CS'] : ROLE_SCOPES[scope] || []
}

function scheduleEmployee(schedule, role) {
  if (role === 'TEACHER') {
    return {
      id: schedule.teacherId,
      name: schedule.teacherName,
      code: schedule.teacherCode,
    }
  }
  return {
    id: schedule.employeeId || schedule.userId,
    name: schedule.employeeName,
    code: schedule.employeeCode,
  }
}

export async function getMonthlyWorkload({ year, month, roleKey, scope }) {
  const { first, last, weeks } = monthDates(year, month)
  const isManager = ['TC', 'CM', 'ADMIN'].includes(roleKey)
  const roles = isManager ? rolesForManager(roleKey, scope) : [roleKey]

  if (roles.length === 0) {
    return { employees: [], schedules: [] }
  }

  const results = await Promise.all(roles.map(async (role) => {
    const [employees, schedulesByWeek] = isManager
      ? await Promise.all([
        schedulingApi.employees(role),
        Promise.all(weeks.map((week) => (
          role === 'TEACHER'
            ? schedulingApi.teaching(week)
            : schedulingApi.staff(role, week)
        ))),
      ])
      : [[], await Promise.all(weeks.map((week) => schedulingApi.ownSchedule(week)))]

    const employeeById = new Map(
      employees.map((employee) => [
        employee.id || employee.employeeId,
        employee,
      ]),
    )

    const schedules = schedulesByWeek.flat()
      .filter((schedule) => {
        const date = String(schedule.date).slice(0, 10)
        return date >= first && date <= last && schedule.status === 'ASSIGNED'
      })
      .map((schedule) => {
        const person = scheduleEmployee(schedule, role)
        const employee = employeeById.get(person.id)
        return {
          id: schedule.id,
          employeeId: person.id,
          name: person.name || employee?.fullName || 'Chưa có tên',
          code: person.code || employee?.employeeCode || '',
          role,
          date: String(schedule.date).slice(0, 10),
          startTime: String(schedule.startTime).slice(0, 5),
          endTime: String(schedule.endTime).slice(0, 5),
          hours: durationInHours(schedule.startTime, schedule.endTime),
          workName: role === 'TEACHER'
            ? schedule.className || schedule.classCode || 'Buổi dạy'
            : schedule.workType || 'Ca làm việc',
          isTeaching: role === 'TEACHER',
        }
      })

    return { role, employees, schedules }
  }))

  const schedules = results.flatMap((result) => result.schedules).sort((left, right) => (
    left.date.localeCompare(right.date) ||
    left.startTime.localeCompare(right.startTime) ||
    left.name.localeCompare(right.name, 'vi')
  ))

  const summaries = new Map()
  for (const result of results) {
    for (const employee of result.employees) {
      const id = employee.id || employee.employeeId
      if (!id) continue
      summaries.set(id, {
        id,
        name: employee.fullName || 'Chưa có tên',
        code: employee.employeeCode || '',
        role: result.role,
        workDays: new Set(),
        totalHours: 0,
        teachingSessions: 0,
        assignedSessions: 0,
      })
    }
  }

  for (const schedule of schedules) {
    const employeeKey = schedule.employeeId || `${schedule.role}:${schedule.name}`
    const summary = summaries.get(employeeKey) || {
      id: employeeKey,
      name: schedule.name,
      code: schedule.code,
      role: schedule.role,
      workDays: new Set(),
      totalHours: 0,
      teachingSessions: 0,
      assignedSessions: 0,
    }

    summary.name = schedule.name || summary.name
    summary.code = schedule.code || summary.code
    summary.workDays.add(schedule.date)
    summary.totalHours += schedule.hours
    summary.assignedSessions += 1
    if (schedule.isTeaching) summary.teachingSessions += 1
    summaries.set(employeeKey, summary)
  }

  const employees = [...summaries.values()]
    .map(({ workDays, ...summary }) => ({
      ...summary,
      daysWorked: workDays.size,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'vi'))

  return { employees, schedules }
}
