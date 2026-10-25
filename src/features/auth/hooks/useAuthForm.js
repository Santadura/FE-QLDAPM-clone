import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAccountData } from '../../accounts/hooks/useAccountData';

const authContent = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to access your ERP workspace',
    action: 'Sign In →',
  },
  reset: {
    title: 'Forgot Password?',
    subtitle: 'Enter your email to reset your password',
    action: 'Send Reset Link →',
  },
};

export function useAuthForm(mode = 'login') {
  const { login } = useAccountData();
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ userId: '', password: '', general: '' });
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const copy = authContent[mode];

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { userId: '', password: '', general: '' };

    if (!userId.trim()) {
      newErrors.userId = mode === 'login' ? 'Vui lòng nhập tên đăng nhập.' : 'Vui lòng nhập email.';
      isValid = false;
    }

    if (mode === 'login' && !password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    }

    if (mode === 'reset' && userId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId.trim())) {
      newErrors.userId = 'Email không hợp lệ.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    if (mode === 'reset') {
      setNotice('Đặt lại mật khẩu chưa được kết nối. Chưa có email nào được gửi.');
      return;
    }

    setPending(true);

    try {
      const result = await login(userId, password, rememberMe);
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      toast.success(`Xin chào ${result.user}!`);
      navigate(`/${result.roleKey.toLowerCase()}`, { replace: true });
    } catch {
      toast.error('Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  };

  return {
    copy,
    rememberMe,
    setRememberMe,
    userId,
    setUserId,
    password,
    setPassword,
    showPassword,
    togglePassword,
    pending,
    errors,
    notice,
    handleSubmit,
  };
}
