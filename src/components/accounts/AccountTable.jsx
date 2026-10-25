import EntityTable from '../ui/EntityTable';

const columns = [
  {
    key: 'user',
    label: 'User',
    width: 'w-[32%]',
    render: (acc) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#173557] flex items-center justify-center text-white text-xs font-semibold">
          {acc.initials}
        </div>

        <div>
          <div className="font-medium text-slate-900">{acc.user}</div>
          <div className="text-xs text-slate-400">{acc.code || '—'}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Role',
  },
  {
    key: 'status',
    label: 'Status',
    render: (acc) => (
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            acc.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className={acc.status === 'Active' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {acc.status}
        </span>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
  },
];

export default function AccountTable({
  accounts,
  onRowClick,
  selectedAccountId,
  currentPage,
  totalItems,
  onPageChange,
  itemsPerPage,
}) {
  return (
    <EntityTable
      label="Accounts"
      columns={columns}
      rows={accounts}
      getRowId={(account) => account.id}
      selectedId={selectedAccountId}
      onRowClick={onRowClick}
      page={currentPage}
      pageSize={itemsPerPage}
      total={totalItems}
      onPageChange={onPageChange}
      itemLabel="accounts"
      emptyMessage="Không tìm thấy tài khoản nào phù hợp."
    />
  );
}
