import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { employeeApi } from '../../../services/employeeApi';
import { accountApi } from '../../../services/accountApi';
import { getRoleKeyFromAccountRole } from '../../../config/roles';
import { useAccountData } from '../../accounts/hooks/useAccountData';
import { currentWeek } from '../employeeHelpers';

export function useEmployees() {
  const { authUser, reloadProfile } = useAccountData();
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [revision, setRevision] = useState(0);
  const [listState, setListState] = useState(null);
  const [detailState, setDetailState] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [pending, setPending] = useState(false);
  const mutation = useRef(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const searchQuery = search.trim();
  const key = JSON.stringify([authUser?.username, authUser?.roleKey, weekStart, revision, searchQuery, role, status]);
  const detailKey = JSON.stringify([authUser?.username, authUser?.roleKey, selectedId, revision]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      employeeApi.list(weekStart, { search: searchQuery, role, status })
        .then((rows) => { if (active) setListState({ key, rows }); })
        .catch((error) => { if (active) setListState({ key, error: error.message }); });
    }, searchQuery ? 300 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [key, weekStart, searchQuery, role, status]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    employeeApi.detail(selectedId)
      .then((employee) => { if (active) setDetailState({ key: detailKey, employee }); })
      .catch((error) => { if (active) setDetailState({ key: detailKey, error: error.message }); });
    return () => { active = false; };
  }, [selectedId, detailKey]);

  const rows = listState?.key === key ? listState.rows || [] : [];

  const pageSize = 7;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const reload = () => setRevision((v) => v + 1);
  const changeFilter = (setter) => (value) => { setter(value); setPage(1); };

  async function runMutation(request, success) {
    if (mutation.current) return { ok: false, errors: { general: 'A request is already in progress.' } };
    mutation.current = true;
    setPending(true);
    try {
      const data = await request();
      success(data);
      reload();
      return { ok: true };
    } catch (error) {
      return { ok: false, errors: { general: error.message || 'Unable to save employee details.' } };
    } finally {
      mutation.current = false;
      setPending(false);
    }
  }

  const create = (form) => runMutation(() => accountApi.create({
    fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() || null,
    password: form.password, role: getRoleKeyFromAccountRole(form.role),
  }), (data) => {
    setSelectedId(data.employeeId);
    setSearch(''); setRole(''); setStatus(''); setPage(1);
    toast.success(`Employee and account created. Username: ${data.username}`, { autoClose: 6000 });
  });

  const update = (id, form) => runMutation(() => employeeApi.update(id, form), (data) => {
    if (data.username === authUser?.username) reloadProfile();
    toast.success('Employee details updated.');
  });

  const saveCertificate = (id, certificateId, form) => runMutation(
    () => employeeApi.saveCertificate(id, certificateId, form),
    () => toast.success('Certificate saved.'),
  );

  const changeStatus = (id, nextStatus) => runMutation(
    () => employeeApi.changeStatus(id, nextStatus),
    () => toast.success(nextStatus === 'INACTIVE' ? 'Employee deactivated and account locked.' : 'Employment status updated. Account login status is unchanged.'),
  );

  return {
    authUser, weekStart, setWeekStart: changeFilter(setWeekStart), search, setSearch: changeFilter(setSearch),
    role, setRole: changeFilter(setRole), status, setStatus: changeFilter(setStatus),
    rows, paginatedRows: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    page: currentPage, setPage, pageSize, selectedId, setSelectedId,
    loading: listState?.key !== key, error: listState?.key === key ? listState.error : '',
    employee: detailState?.key === detailKey ? detailState.employee : null,
    detailError: detailState?.key === detailKey ? detailState.error : '',
    revision, reload, pending, create, update, saveCertificate, changeStatus,
  };
}
