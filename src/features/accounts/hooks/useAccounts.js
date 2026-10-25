import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccountData } from './useAccountData';
import { accountApi } from '../../../services/accountApi';
import { getRoleKeyFromAccountRole } from '../../../config/roles';
import { mapAccountResponse } from '../accountMapper';

export const useAccounts = () => {
  const { authUser } = useAccountData();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [pending, setPending] = useState(false);
  const mutationPending = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [requestedPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    let active = true;
    if (authUser?.roleKey !== 'ADMIN') return;
    accountApi.list()
      .then((data) => { if (active) setAccounts(data.map(mapAccountResponse)); })
      .catch((error) => { if (active) setLoadError(error.message || 'Không thể tải danh sách tài khoản.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authUser?.username, authUser?.roleKey, reloadCount]);

  const reloadAccounts = () => {
    if (mutationPending.current) return;
    setLoading(true);
    setLoadError('');
    setReloadCount((value) => value + 1);
  };

  const filteredAccounts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchSearch = [account.user, account.username, account.email, account.code]
        .some((value) => value.toLowerCase().includes(search));
      return matchSearch
        && (selectedRole === 'All Roles' || account.role === selectedRole)
        && (selectedStatus === 'All Status' || account.status === selectedStatus);
    });
  }, [accounts, searchTerm, selectedRole, selectedStatus]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (event) => { setSearchTerm(event.target.value); setCurrentPage(1); };
  const handleFilterRole = (event) => { setSelectedRole(event.target.value); setCurrentPage(1); };
  const handleFilterStatus = (event) => { setSelectedStatus(event.target.value); setCurrentPage(1); };
  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const handleExport = () => {
    if (!filteredAccounts.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
    const rows = [
      ['Mã nhân viên', 'Họ tên', 'Tên đăng nhập', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái'],
      ...filteredAccounts.map((account) => [account.code, account.user, account.username, account.email, account.phone, account.role, account.status]),
    ];
    const csv = rows.map((row) => row.map((value) => {
      const text = String(value ?? '');
      const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replaceAll('"', '""')}"`;
    }).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh_sach_tai_khoan_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Xuất file thành công!');
  };

  const mutateAccount = async (request) => {
    if (mutationPending.current) return { ok: false, errors: { general: 'Đang xử lý yêu cầu.' } };
    mutationPending.current = true;
    setPending(true);
    try {
      const data = await request();
      const updated = mapAccountResponse(data);
      setAccounts((current) => current.some((account) => account.id === updated.id)
        ? current.map((account) => account.id === updated.id ? updated : account)
        : [updated, ...current]);
      return { ok: true, account: updated };
    } catch (error) {
      return { ok: false, errors: { general: error.message || 'Không thể cập nhật tài khoản.' } };
    } finally {
      mutationPending.current = false;
      setPending(false);
    }
  };

  const handleAddAccount = async (form) => {
    const result = await mutateAccount(() => accountApi.create({
      fullName: form.fullName.trim(), email: form.email.trim(), password: form.password,
      phone: form.phone.trim() || null, role: getRoleKeyFromAccountRole(form.role),
    }));
    if (result.ok) {
      setSearchTerm('');
      setSelectedRole('All Roles');
      setSelectedStatus('All Status');
      setCurrentPage(1);
      toast.success(`Đã tạo tài khoản. Tên đăng nhập: ${result.account.username}`, { autoClose: 6000 });
    }
    return result;
  };

  const handleToggleLock = async (username) => {
    const account = accounts.find((item) => item.username === username);
    if (!account) return { ok: false };
    const status = account.status === 'Active' ? 'LOCKED' : 'ACTIVE';
    const result = await mutateAccount(() => accountApi.changeStatus(username, status));
    if (result.ok) toast.success(`Đã ${status === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản ${username}.`);
    else toast.error(result.errors?.general || 'Không thể cập nhật trạng thái tài khoản.');
    return result;
  };

  return {
    accounts, authUser, loading, loadError, pending, reloadAccounts,
    searchTerm, selectedRole, selectedStatus, currentPage, totalPages, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus, handlePageChange, handleExport, handleAddAccount, handleToggleLock,
  };
};
