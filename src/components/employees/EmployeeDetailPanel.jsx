import { useState } from 'react';
import { Link } from 'react-router-dom';
import DetailPanel from '../ui/DetailPanel';
import Button from '../ui/Button';
import { getInitials } from '../../features/accounts/accountStore';
import { EMPLOYEE_ROLES, formatNumber, formatDate } from '../../features/employees/employeeHelpers';
import { EmployeeStatus } from './EmployeeTable';
import EditEmployeeModal from './EditEmployeeModal';
import CertificateModal from './CertificateModal';
import EmployeeRecords from './EmployeeRecords';
import EmployeeStatusModal from './EmployeeStatusModal';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'schedules', label: 'Schedule' },
  { key: 'salaries', label: 'Salary' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'history', label: 'History' },
];

function Info({ label, children }) {
  return <div className="flex justify-between gap-4 text-[13px]"><dt className="shrink-0 text-slate-500">{label}</dt><dd className="break-all text-right font-medium text-slate-900">{children || '—'}</dd></div>;
}

export default function EmployeeDetailPanel({ model }) {
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [certificateForm, setCertificateForm] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const employee = model.employee;
  const isCurrentEmployee = employee?.username === model.authUser?.username;
  const role = model.authUser?.roleKey;
  const payroll = role === 'ADMIN' ? '/admin/monitor/payroll' : role === 'TC' ? '/tc/payroll'
    : `/cm/payroll/${employee?.role === 'CS' ? 'cs' : 'sale'}`;

  return (
    <DetailPanel title="Employee Detail" tabs={tabs} activeTab={tab}
      onTabChange={(next) => { if (!model.pending) setTab(next); }}
      onClose={() => { if (!model.pending) model.setSelectedId(null); }}
      footer={employee && <div className="space-y-2">
        <Button className="w-full" variant="primary" disabled={model.pending} onClick={() => setEditing(true)}>Edit Employee</Button>
        <Button className="w-full" disabled={model.pending} onClick={() => setStatusOpen(true)}>Change Status</Button>
        <Link to={payroll} className="flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50">Manage Salary</Link>
      </div>}>
      <div className="max-h-[calc(100dvh-310px)] overflow-y-auto">
        {model.detailError ? <div role="alert" className="space-y-3 text-sm text-red-600"><p>{model.detailError}</p><Button onClick={model.reload}>Retry</Button></div>
          : !employee ? <p role="status" className="text-sm text-slate-500">Loading employee...</p>
            : <>
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#173557] text-lg font-semibold text-white">{getInitials(employee.fullName)}</span>
                <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{employee.fullName}</p><p className="truncate text-xs text-slate-500">{employee.employeeCode}</p><EmployeeStatus value={employee.status} /></div>
              </div>
              {tab === 'overview' ? <dl className="space-y-3">
                <Info label="Role">{EMPLOYEE_ROLES[employee.role] || employee.role}</Info>
                <Info label="Email">{employee.email}</Info><Info label="Phone">{employee.phone}</Info>
                <Info label="Specialization">{employee.specialization}</Info>
                <Info label="Salary rank">{employee.salaryRank}</Info><Info label="Rank amount">{formatNumber(employee.rankAmount)}</Info>
                <Info label="Last salary review">{formatDate(employee.reviewedDate)}</Info>
                <Info label="Username">{employee.username}</Info>
                <Info label="Account status">{employee.accountStatus === 'ACTIVE' ? 'Active' : employee.accountStatus === 'LOCKED' ? 'Locked' : employee.accountStatus}</Info>
                <Info label="Employee ID">{employee.employeeId}</Info><Info label="Created date">{employee.createdAt}</Info>
              </dl> : <>
                {tab === 'schedules' && <h3 className="mb-3 text-xs font-semibold text-slate-700">Assigned schedule this week</h3>}
                <EmployeeRecords employeeId={employee.employeeId} resource={tab} weekStart={model.weekStart} revision={model.revision} pending={model.pending} onCertificate={(value) => setCertificateForm({ certificate: value })} />
                {tab === 'schedules' && <><h3 className="mb-3 mt-5 text-xs font-semibold text-slate-700">Registered availability</h3><EmployeeRecords employeeId={employee.employeeId} resource="availabilities" weekStart={model.weekStart} revision={model.revision} /></>}
              </>}
            </>}
      </div>
      {editing && employee && <EditEmployeeModal employee={employee} onClose={() => setEditing(false)} onSubmit={(form) => model.update(employee.employeeId, form)} />}
      {certificateForm && employee && <CertificateModal certificate={certificateForm.certificate} onClose={() => setCertificateForm(null)} onSubmit={(form) => model.saveCertificate(employee.employeeId, certificateForm.certificate?.certificateId, form)} />}
      {statusOpen && employee && <EmployeeStatusModal employee={employee} isCurrentEmployee={isCurrentEmployee}
        onClose={() => setStatusOpen(false)} onSubmit={(status) => model.changeStatus(employee.employeeId, status)} />}
    </DetailPanel>
  );
}
