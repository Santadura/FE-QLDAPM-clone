import { useState } from 'react';
import { useEmployees } from '../features/employees/hooks/useEmployees';
import { exportEmployees } from '../features/employees/employeeHelpers';
import EmployeeToolbar from '../components/employees/EmployeeToolbar';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeDetailPanel from '../components/employees/EmployeeDetailPanel';
import AddAccountModal from '../components/accounts/AddAccountModal';
import Button from '../components/ui/Button';

export default function EmployeeManagement() {
  const model = useEmployees();
  const [adding, setAdding] = useState(false);
  return (
    <div className={`grid items-start gap-4 ${model.selectedId ? 'xl:grid-cols-[minmax(0,1fr)_350px]' : 'grid-cols-1'}`}>
      <div className="min-w-0">
        <EmployeeToolbar model={model} onAdd={() => setAdding(true)} onExport={() => exportEmployees(model.rows)} />
        {model.loading ? <div role="status" className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading employees...</div>
          : model.error ? <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"><p>{model.error}</p><Button onClick={model.reload}>Retry</Button></div>
            : <EmployeeTable model={model} />}
      </div>
      {model.selectedId && <EmployeeDetailPanel key={model.selectedId} model={model} />}
      {adding && <AddAccountModal title="Add Employee" submitLabel="Add Employee" onClose={() => setAdding(false)} onSubmit={model.create} />}
    </div>
  );
}
