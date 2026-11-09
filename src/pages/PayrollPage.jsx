import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, GraduationCap, RefreshCw, Users } from 'lucide-react'
import {
  MyAttendanceTable,
  TeamAttendanceTable,
  TeamScheduleTable,
} from '../components/payroll/AttendanceTable'
import { payrollApi } from '../services/payrollApi'
import { getMonthlyWorkload } from '../services/workloadApi'
import SalaryReviewRequestModal from '../components/payroll/SalaryReviewRequestModal'
import SalaryReviewDecisionModal from '../components/payroll/SalaryReviewDecisionModal'
import { toast } from 'react-toastify'

const SCOPE_LABELS = {
  teacher: 'giáo viên',
  sale: 'nhân viên Sale',
  cs: 'nhân viên CS',
  all: 'nhân viên',
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="mb-2 text-[11px] font-semibold tracking-wide text-slate-400">{label}</div>
        <div className="mb-1 text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{detail}</div>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={16} />
      </div>
    </div>
  )
}

const REVIEW_ROLE_META = {
  TEACHER: { label: 'Giáo viên', tone: 'border-blue-200 bg-blue-50 text-blue-800' },
  SALE: { label: 'Sale', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  CS: { label: 'CS', tone: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800' },
}
const formatMoney = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(value || 0)) + ' đ/giờ'

function PendingReviewTable({ role, reviews, onDecide }) {
  const meta = REVIEW_ROLE_META[role]
  return <section className="font-review overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className={`flex items-center justify-between border-b px-5 py-3 ${meta.tone}`}>
      <div><h3 className="font-semibold">Review lương {meta.label}</h3><p className="mt-0.5 text-xs opacity-80">{reviews.length} yêu cầu đang chờ Admin xử lý</p></div>
      <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold">{reviews.length}</span>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-500"><tr><th className="px-5 py-3">NHÂN VIÊN</th><th className="px-5 py-3">BẬC HIỆN TẠI</th><th className="px-5 py-3">BẬC ĐỀ XUẤT</th><th className="px-5 py-3">LÝ DO REVIEW</th><th className="px-5 py-3 text-right">THAO TÁC</th></tr></thead><tbody>
      {reviews.map((review) => <tr key={review.id} className="border-t border-slate-100 align-top"><td className="px-5 py-3"><div className="font-medium text-slate-800">{review.employeeName}</div><div className="mt-1 text-xs text-slate-400">Gửi lúc {new Date(review.createdAt).toLocaleDateString('vi-VN')}</div></td><td className="px-5 py-3"><div className="font-medium">{review.currentRank || 'Chưa gán bậc'}</div><div className="mt-1 text-xs text-slate-500">Mức hiện tại chưa thiết lập</div></td><td className="px-5 py-3"><div className="font-medium text-blue-700">{review.proposedRank}</div><div className="mt-1 text-xs text-slate-500">{formatMoney(review.proposedAmount)}</div></td><td className="max-w-sm px-5 py-3 text-slate-600">{review.reason}</td><td className="px-5 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => onDecide(review.id, 'APPROVE')} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Duyệt</button><button type="button" onClick={() => onDecide(review.id, 'REJECT')} className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Từ chối</button></div></td></tr>)}
      {!reviews.length && <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-400">Không có yêu cầu chờ duyệt cho {meta.label}.</td></tr>}
    </tbody></table></div>
  </section>
}

export default function PayrollPage({ scope = 'teacher', roleKey = 'TEACHER', title, subtitle }) {
  const [period, setPeriod] = useState(currentMonth)
  const [data, setData] = useState({ employees: [], schedules: [] })
  const [ranks, setRanks] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewEmployee, setReviewEmployee] = useState(null)
  const [salaryProfile, setSalaryProfile] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [decisionReview, setDecisionReview] = useState(null)
  const [decisionSaving, setDecisionSaving] = useState(false)
  const [decisionError, setDecisionError] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const managerView = ['TC', 'CM', 'ADMIN'].includes(roleKey)
  const [year, month] = period.split('-').map(Number)

  const requestWorkload = useCallback(
    () => getMonthlyWorkload({ year, month, roleKey, scope }),
    [year, month, roleKey, scope],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await requestWorkload()
      setData(result)
      if (roleKey === 'ADMIN') setReviews(await payrollApi.reviews('PENDING'))
    } catch (requestError) {
      setData({ employees: [], schedules: [] })
      setError(requestError.message || 'Không thể tải dữ liệu công.')
    } finally {
      setLoading(false)
    }
  }, [requestWorkload])

  const calculate = useCallback(async () => {
    setLoading(true); setError('')
    try {
      await payrollApi.calculate({ period })
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Không thể tính bảng lương.')
    } finally { setLoading(false) }
  }, [period, refresh])

  useEffect(() => {
    let active = true
    requestWorkload()
      .then((result) => {
        if (active) {
          setData(result)
          setError('')
          if (roleKey === 'ADMIN') payrollApi.reviews('PENDING').then(setReviews).catch(() => {})
        }
      })
      .catch((requestError) => {
        if (active) {
          setData({ employees: [], schedules: [] })
          setError(requestError.message || 'Không thể tải dữ liệu công.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [requestWorkload, managerView, roleKey])

  async function openReview(employee) {
    setReviewEmployee(employee); setSalaryProfile(null); setReviewError(''); setReviewLoading(true)
    try {
      const [profile, nextRanks] = await Promise.all([payrollApi.salaryProfile(employee.id), payrollApi.ranks(employee.role)])
      setSalaryProfile(profile); setRanks(nextRanks)
    } catch (requestError) {
      setReviewError(requestError.message || 'Không tải được dữ liệu review lương.')
    } finally { setReviewLoading(false) }
  }

  async function submitReview({ proposedSalaryRankId, reason }) {
    if (!reviewEmployee) return
    setReviewSaving(true); setReviewError('')
    try {
      await payrollApi.createReview({ employeeId: reviewEmployee.id, proposedSalaryRankId, reason })
      setReviewEmployee(null)
      toast.success(`Đã gửi review lương của ${reviewEmployee.name} đến Admin.`, { icon: '✓' })
    } catch (requestError) { setReviewError(requestError.message || 'Không thể tạo yêu cầu review.') }
    finally { setReviewSaving(false) }
  }

  async function decideReview(note) {
    if (!decisionReview) return
    setDecisionSaving(true); setDecisionError('')
    try {
      await payrollApi.decideReview(decisionReview.id, { decision: decisionReview.decision, note })
      setReviews(await payrollApi.reviews('PENDING'))
      toast.success(decisionReview.decision === 'APPROVE' ? 'Đã duyệt yêu cầu và cập nhật bậc lương mới.' : 'Đã từ chối yêu cầu review lương.', { icon: decisionReview.decision === 'APPROVE' ? '✓' : '↗' })
      setDecisionReview(null)
    } catch (requestError) { setDecisionError(requestError.message || 'Không thể cập nhật yêu cầu.') }
    finally { setDecisionSaving(false) }
  }

  const employeeFilter = search.trim().toLocaleLowerCase('vi')
  const employees = useMemo(
    () => data.employees.filter((employee) => (
      `${employee.name} ${employee.code}`.toLocaleLowerCase('vi').includes(employeeFilter)
    )),
    [data.employees, employeeFilter],
  )
  const schedules = useMemo(
    () => data.schedules.filter((schedule) => (
      `${schedule.name} ${schedule.code}`.toLocaleLowerCase('vi').includes(employeeFilter)
    )),
    [data.schedules, employeeFilter],
  )

  const totalDays = data.employees.reduce((sum, employee) => sum + employee.daysWorked, 0)
  const totalHours = data.employees.reduce((sum, employee) => sum + employee.totalHours, 0)
  const teachingSessions = data.employees.reduce((sum, employee) => sum + employee.teachingSessions, 0)
  const monthLabel = period
    ? new Date(year, month - 1, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : ''
  const viewerRole = managerView ? scope : roleKey.toLowerCase()
  const workloadName = SCOPE_LABELS[scope] || 'nhân viên'
  const pendingReviewsByRole = useMemo(() => ({
    TEACHER: reviews.filter((review) => review.roleId === 'TEACHER'),
    SALE: reviews.filter((review) => review.roleId === 'SALE'),
    CS: reviews.filter((review) => review.roleId === 'CS'),
  }), [reviews])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title || `Quản lý công ${workloadName}`}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle || 'Tổng hợp ngày công, giờ làm và buổi dạy từ lịch đã được phân công.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <CalendarDays size={15} className="text-slate-400" />
            <span className="sr-only">Chọn tháng</span>
            <input
              type="month"
              value={period}
              onChange={(event) => {
                if (event.target.value) {
                  setError('')
                  setLoading(true)
                  setPeriod(event.target.value)
                }
              }}
              className="bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setError('')
              setLoading(true)
              refresh()
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          {managerView && (
            <button type="button" onClick={calculate} disabled={loading}
              className="rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50">
              Tính bảng lương
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Bảng lương chốt theo từng ca/buổi và mức lương có hiệu lực tại ngày làm việc. Giáo viên chỉ được tính
        buổi có CS xác nhận có mặt/đi trễ; Sale và CS tính các ca đã phân công.
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải dữ liệu công: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="NHÂN VIÊN CÓ LỊCH"
          value={data.employees.filter((employee) => employee.assignedSessions > 0).length}
          detail={`${data.employees.length} nhân viên trong phạm vi`}
          icon={Users}
        />
        <StatCard
          label="TỔNG NGÀY CÔNG"
          value={totalDays}
          detail="Tổng ngày làm việc theo lịch"
          icon={CalendarDays}
        />
        <StatCard
          label="TỔNG GIỜ THEO LỊCH"
          value={`${totalHours.toFixed(1)} giờ`}
          detail="Tính từ giờ bắt đầu và kết thúc"
          icon={Clock3}
        />
        <StatCard
          label="BUỔI DẠY"
          value={teachingSessions}
          detail="Số lịch dạy được phân công"
          icon={GraduationCap}
        />
      </div>

      {managerView ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Công theo từng nhân viên</h3>
              <p className="mt-1 text-xs text-slate-500">Kỳ tổng hợp: {monthLabel}</p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc mã nhân viên"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 sm:w-72"
            />
          </div>
          {loading
            ? <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu công...</p>
            : <TeamAttendanceTable records={employees} personLabel={workloadName} onReview={['TC', 'CM'].includes(roleKey) ? openReview : undefined} />}
          {!loading && <TeamScheduleTable records={schedules} />}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Chi tiết lịch làm việc</h3>
            <p className="mt-1 text-xs text-slate-500">Kỳ tổng hợp: {monthLabel}</p>
          </div>
          {loading
            ? <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu công...</p>
            : <MyAttendanceTable records={data.schedules} roleKey={viewerRole.toUpperCase()} />}
        </div>
      )}
      {roleKey === 'ADMIN' && <section className="font-review space-y-4"><div><h3 className="text-lg font-bold tracking-tight text-slate-800">Yêu cầu review lương chờ duyệt</h3><p className="mt-1 text-sm text-slate-500">Phê duyệt sẽ áp dụng bậc lương mới từ ngày duyệt; từ chối cho phép TC/CM gửi lại ngay sau khi điều chỉnh đề xuất.</p></div><PendingReviewTable role="TEACHER" reviews={pendingReviewsByRole.TEACHER} onDecide={(id, decision) => setDecisionReview({ ...reviews.find((review) => review.id === id), decision })} /><PendingReviewTable role="SALE" reviews={pendingReviewsByRole.SALE} onDecide={(id, decision) => setDecisionReview({ ...reviews.find((review) => review.id === id), decision })} /><PendingReviewTable role="CS" reviews={pendingReviewsByRole.CS} onDecide={(id, decision) => setDecisionReview({ ...reviews.find((review) => review.id === id), decision })} /></section>}
      <SalaryReviewRequestModal employee={reviewEmployee} profile={salaryProfile} ranks={ranks.filter((rank) => rank.status === 'ACTIVE')} loading={reviewLoading} saving={reviewSaving} error={reviewError} onClose={() => setReviewEmployee(null)} onSubmit={submitReview} />
      <SalaryReviewDecisionModal review={decisionReview} saving={decisionSaving} error={decisionError} onClose={() => setDecisionReview(null)} onSubmit={decideReview} />
    </div>
  )
}
