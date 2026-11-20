import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccountData } from '../accounts/hooks/useAccountData';
import { userReturnTo } from './authNavigation';

export function useUserAuthForm(register = false) {
  const { login, registerUser } = useAccountData();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = userReturnTo(location.state?.returnTo);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', remember: false });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);

  function change(event) {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '', general: '' }));
  }

  async function submit(event) {
    event.preventDefault();
    if (pendingRef.current) return;
    const validation = {};
    const username = form.username.trim();
    if (!username) validation.username = 'Vui lòng nhập tên đăng nhập.';
    else if (register && (username.length < 3 || username.length > 50 || !/^[a-zA-Z0-9_]+$/.test(username))) {
      validation.username = 'Tên đăng nhập gồm 3–50 ký tự, chỉ dùng chữ không dấu, số và dấu gạch dưới.';
    }
    if (register && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.trim().length > 100)) validation.email = 'Vui lòng nhập email hợp lệ, tối đa 100 ký tự.';
    if (!form.password.trim()) validation.password = 'Vui lòng nhập mật khẩu.';
    else if (register && (form.password.length < 6 || form.password.length > 72 || new TextEncoder().encode(form.password).length > 72)) validation.password = 'Mật khẩu cần ít nhất 6 ký tự và không vượt quá 72 byte UTF-8.';
    if (register && (!form.confirm || form.password !== form.confirm)) validation.confirm = 'Mật khẩu xác nhận không khớp.';
    setErrors(validation);
    if (Object.keys(validation).length) return;

    pendingRef.current = true;
    setPending(true);
    try {
      const result = register ? await registerUser(form) : await login(form.username, form.password, form.remember, true);
      if (!result.ok) setErrors({ general: result.reason });
      else navigate(returnTo, { replace: true });
    } catch { setErrors({ general: 'Không thể kết nối. Vui lòng thử lại.' }); }
    finally { pendingRef.current = false; setPending(false); }
  }

  return { form, errors, pending, showPassword, togglePassword: () => setShowPassword((current) => !current), change, submit, returnTo };
}
