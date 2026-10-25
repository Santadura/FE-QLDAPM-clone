import { useState } from 'react';
import AccountToolbar from '../components/accounts/AccountToolbar';
import AccountTable from '../components/accounts/AccountTable';
import AccountDetailPanel from '../components/accounts/AccountDetailPanel';
import AddAccountModal from '../components/accounts/AddAccountModal';
import { useAccounts } from '../features/accounts/hooks/useAccounts';

export default function AccountManagement() {
  const {
    accounts, authUser, loading, loadError, pending, reloadAccounts,
    searchTerm, selectedRole, selectedStatus, currentPage, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus, handlePageChange, handleExport, handleAddAccount, handleToggleLock,
  } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) || null;

  const onAddAccountSubmit = async (form) => {
    const result = await handleAddAccount(form);
    if (result.ok) setSelectedAccountId(result.account.id);
    return result;
  };

  if (loading) return <div role="status" className="p-6 text-slate-500">Đang tải tài khoản...</div>;
  if (loadError) return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
      <p>{loadError}</p>
      <button onClick={reloadAccounts} className="mt-3 underline">Thử lại</button>
    </div>
  );

  return (
    <div className={`grid items-start gap-4 ${selectedAccount ? 'xl:grid-cols-[minmax(0,1fr)_350px]' : 'grid-cols-1'}`}>
      <div className="min-w-0">
        <AccountToolbar
          searchTerm={searchTerm} onSearch={handleSearch}
          selectedRole={selectedRole} onRoleChange={handleFilterRole}
          selectedStatus={selectedStatus} onStatusChange={handleFilterStatus}
          onExport={handleExport} onAddClick={() => { if (!pending) setIsAddModalOpen(true); }}
        />
        <AccountTable
          accounts={paginatedAccounts} selectedAccountId={selectedAccount?.id}
          onRowClick={(account) => { if (!pending) setSelectedAccountId(account.id); }}
          currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange}
        />
      </div>
      {selectedAccount && (
        <AccountDetailPanel
          account={selectedAccount} pending={pending}
          isCurrentAccount={selectedAccount.username === authUser?.username}
          onClose={() => { if (!pending) setSelectedAccountId(null); }}
          onToggleLock={() => handleToggleLock(selectedAccount.username)}
        />
      )}
      {isAddModalOpen && <AddAccountModal onClose={() => setIsAddModalOpen(false)} onSubmit={onAddAccountSubmit} />}
    </div>
  );
}
