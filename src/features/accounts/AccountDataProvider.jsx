import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountDataContext } from './hooks/useAccountData';
import { ACCOUNT_ROLE_MAP } from '../../config/roles';
import { getInitials } from './accountStore';
import { mapAccountResponse } from './accountMapper';
import { getSession, login as backendLogin, saveSession } from '../../services/api';
import { profileApi } from '../../services/profileApi';
import { logoutRequest } from '../../services/authApi';

const ROLE_LABELS = Object.fromEntries(Object.entries(ACCOUNT_ROLE_MAP).map(([label, key]) => [key, label]));
const USERNAME_ALIASES = { teacher: 'teacher001', tc: 'tc001', cm: 'cm001', cs: 'cs001' };

export default function AccountDataProvider({ children }) {
  const [session, setSession] = useState(() => getSession());
  const [profileState, setProfileState] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const profileGeneration = useRef(0);
  const mutation = useRef(null);
  const logoutPending = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const token = session?.token;

  useEffect(() => {
    if (!token) return;
    let active = true;
    const generation = ++profileGeneration.current;
    profileApi.mine()
      .then((data) => {
        if (active && generation === profileGeneration.current && getSession()?.token === token) {
          setProfileState({ token, account: mapAccountResponse(data), error: '' });
        }
      })
      .catch((error) => {
        if (active && generation === profileGeneration.current && getSession()?.token === token) {
          setProfileState({ token, account: null, error: error.message || 'Không thể tải hồ sơ cá nhân.' });
        }
      });
    return () => { active = false; };
  }, [token, reloadCount]);

  useEffect(() => {
    const handleExpiredSession = () => setSession(null);
    window.addEventListener('qldapm:session-expired', handleExpiredSession);
    window.addEventListener('iig:unauthorized', handleExpiredSession);
    return () => {
      window.removeEventListener('qldapm:session-expired', handleExpiredSession);
      window.removeEventListener('iig:unauthorized', handleExpiredSession);
    };
  }, []);

  const authUser = useMemo(() => {
    if (!session?.token || !ROLE_LABELS[session.role]) return null;
    const profile = profileState?.token === session.token ? profileState.account : null;
    return {
      id: session.username,
      username: session.username,
      user: session.username,
      email: '', phone: '', code: '', employeeId: '',
      initials: getInitials(session.username),
      status: 'Active',
      ...profile,
      role: ROLE_LABELS[session.role],
      roleKey: session.role,
    };
  }, [session, profileState]);

  const profileLoading = Boolean(session && profileState?.token !== session.token);
  const profileError = profileState && profileState.token === token ? profileState.error : '';

  const reloadProfile = useCallback(() => {
    if (!token || mutation.current?.token === token) return;
    profileGeneration.current += 1;
    setProfileState(null);
    setReloadCount((current) => current + 1);
  }, [token]);

  async function login(identifier, password, remember) {
    try {
      const input = identifier.trim().toLowerCase();
      const response = await backendLogin(USERNAME_ALIASES[input] ?? input, password);
      const role = response?.role?.toUpperCase();
      if (!response?.token || !response.username || !ROLE_LABELS[role]) {
        return { ok: false, reason: 'Backend không trả về phiên đăng nhập hợp lệ.' };
      }
      const nextSession = {
        token: response.token, tokenType: response.tokenType || 'Bearer', username: response.username, role,
      };
      saveSession(nextSession, Boolean(remember));
      setProfileState(null);
      setSession(nextSession);
      return { ok: true, user: response.username, roleKey: role };
    } catch (error) {
      return { ok: false, reason: error.message || 'Không thể đăng nhập vào backend.' };
    }
  }

  function clearLocalSession(expectedToken) {
    const currentToken = getSession()?.token;
    if (expectedToken && currentToken && currentToken !== expectedToken) return false;
    saveSession(null);
    setSession(null);
    setProfileState(null);
    profileGeneration.current += 1;
    return true;
  }

  async function logout() {
    const activeToken = getSession()?.token;
    if (!activeToken) { clearLocalSession(); return { ok: true }; }
    if (logoutPending.current?.token === activeToken || mutation.current?.token === activeToken) {
      return { ok: false, reason: 'Đang xử lý yêu cầu trước đó. Vui lòng thử lại sau.' };
    }
    const operation = { token: activeToken };
    logoutPending.current = operation;
    setLoggingOut(true);
    try {
      await logoutRequest();
      return { ok: true, sessionChanged: !clearLocalSession(activeToken) };
    } catch (error) {
      // A revoked or expired token is already signed out at the backend.
      if (error.status === 401) return { ok: true, sessionChanged: !clearLocalSession(activeToken) };
      return { ok: false, reason: error.message || 'Không thể đăng xuất khỏi backend. Vui lòng thử lại.' };
    } finally {
      if (logoutPending.current === operation) {
        logoutPending.current = null;
        setLoggingOut(false);
      }
    }
  }

  async function mutateProfile(request, updatesProfile) {
    const activeSession = session;
    if (!activeSession || getSession()?.token !== activeSession.token) {
      return { ok: false, errors: { general: 'Phiên đăng nhập đã hết hiệu lực.' } };
    }
    if (mutation.current?.token === activeSession.token) {
      return { ok: false, errors: { general: 'Đang xử lý yêu cầu trước đó.' } };
    }
    if (logoutPending.current?.token === activeSession.token) {
      return { ok: false, errors: { general: 'Đang đăng xuất. Vui lòng chờ.' } };
    }
    const operation = { token: activeSession.token };
    mutation.current = operation;
    try {
      const data = await request();
      if (getSession()?.token !== activeSession.token) {
        return { ok: false, errors: { general: 'Phiên đăng nhập đã thay đổi.' } };
      }
      if (updatesProfile) {
        if (data.username !== activeSession.username) throw new Error('Thông tin hồ sơ không khớp tài khoản đăng nhập.');
        const account = mapAccountResponse(data);
        // Do not let an older GET replace the profile returned by this save.
        profileGeneration.current += 1;
        setProfileState({ token: activeSession.token, account, error: '' });
        return { ok: true, account };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, errors: { general: error.message || 'Không thể cập nhật thông tin.' } };
    } finally {
      if (mutation.current === operation) mutation.current = null;
    }
  }

  function updateProfile(form) {
    return mutateProfile(() => profileApi.update({
      fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() || null,
      specialization: form.specialization.trim() || null,
    }), true);
  }

  async function changePassword(form) {
    const activeToken = session?.token;
    const result = await mutateProfile(() => profileApi.changePassword({
      currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword,
    }), false);
    // The changed BCrypt hash invalidates every existing credential stamp.
    // Clear this session directly; its JWT can no longer call /auth/logout.
    if (result.ok) clearLocalSession(activeToken);
    return result;
  }

  return (
    <AccountDataContext.Provider value={{ authUser, profileLoading, profileError, reloadProfile, loggingOut, login, logout, updateProfile, changePassword }}>
      {children}
    </AccountDataContext.Provider>
  );
}
