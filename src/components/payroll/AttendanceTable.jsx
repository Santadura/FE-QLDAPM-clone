const ROLE_LABELS = {
  TEACHER: 'Giáo viên',
  SALE: 'Sale',
  CS: 'CS',
}

function EmptyRow({ columns, children }) {
  return (
    <tr>
      <td colSpan={columns} className="px-5 py-10 text-center text-sm text-slate-400">
        {children}
      </td>
    </tr>
  )
}

export function TeamAttendanceTable({ records, personLabel, onReview }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-800">Tổng hợp công theo nhân viên</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Số liệu được tổng hợp từ các lịch đã phân công trong tháng.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-400">
            <th className="px-5 py-2.5">{personLabel.toUpperCase()}</th>
            <th className="px-5 py-2.5">VAI TRÒ</th>
            <th className="px-5 py-2.5">NGÀY CÔNG</th>
            <th className="px-5 py-2.5">GIỜ THEO LỊCH</th>
            <th className="px-5 py-2.5">BUỔI DẠY</th>
            <th className="px-5 py-2.5">CA / BUỔI ĐƯỢC GIAO</th>
            {onReview && <th className="px-5 py-2.5 text-right">THAO TÁC</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-slate-50 last:border-0">
              <td className="px-5 py-3">
                <div className="font-medium text-slate-800">{record.name}</div>
                {record.code && <div className="text-xs text-slate-400">{record.code}</div>}
              </td>
              <td className="px-5 py-3 text-slate-600">{ROLE_LABELS[record.role] || record.role}</td>
              <td className="px-5 py-3 text-slate-700">{record.daysWorked}</td>
              <td className="px-5 py-3 text-slate-700">{record.totalHours.toFixed(1)} giờ</td>
              <td className="px-5 py-3 text-slate-700">{record.teachingSessions}</td>
              <td className="px-5 py-3 text-slate-700">{record.assignedSessions}</td>
              {onReview && <td className="px-5 py-3 text-right"><button type="button" onClick={() => onReview(record)} className="rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">Review lương</button></td>}
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={onReview ? 7 : 6}>Không có nhân viên phù hợp.</EmptyRow>}
        </tbody>
      </table>
    </div>
  )
}

export function TeamScheduleTable({ records }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-800">Chi tiết lịch được phân công</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Thời lượng được tính từ giờ bắt đầu và kết thúc trên lịch.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-400">
            <th className="px-5 py-2.5">NHÂN VIÊN</th>
            <th className="px-5 py-2.5">NGÀY</th>
            <th className="px-5 py-2.5">CÔNG VIỆC / LỚP</th>
            <th className="px-5 py-2.5">THỜI GIAN</th>
            <th className="px-5 py-2.5">SỐ GIỜ</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-slate-50 last:border-0">
              <td className="px-5 py-3">
                <div className="font-medium text-slate-800">{record.name}</div>
                {record.code && <div className="text-xs text-slate-400">{record.code}</div>}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">{record.date}</td>
              <td className="px-5 py-3 text-slate-700">{record.workName}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                {record.startTime} – {record.endTime}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">{record.hours.toFixed(1)} giờ</td>
            </tr>
          ))}
          {records.length === 0 && (
            <EmptyRow columns={5}>Không có lịch được phân công trong tháng này.</EmptyRow>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function MyAttendanceTable({ records, roleKey }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-800">Lịch công việc được phân công</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          {roleKey === 'TEACHER' ? 'Mỗi dòng là một buổi dạy.' : 'Mỗi dòng là một ca làm việc.'}
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-400">
            <th className="px-5 py-2.5">NGÀY</th>
            <th className="px-5 py-2.5">CÔNG VIỆC / LỚP</th>
            <th className="px-5 py-2.5">THỜI GIAN</th>
            <th className="px-5 py-2.5">SỐ GIỜ</th>
            {roleKey === 'TEACHER' && <th className="px-5 py-2.5">SỐ BUỔI DẠY</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-slate-50 last:border-0">
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">{record.date}</td>
              <td className="px-5 py-3 text-slate-700">{record.workName}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                {record.startTime} – {record.endTime}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">{record.hours.toFixed(1)} giờ</td>
              {roleKey === 'TEACHER' && <td className="px-5 py-3 text-slate-700">1</td>}
            </tr>
          ))}
          {records.length === 0 && (
            <EmptyRow columns={roleKey === 'TEACHER' ? 5 : 4}>
              Không có lịch được phân công trong tháng này.
            </EmptyRow>
          )}
        </tbody>
      </table>
    </div>
  )
}
