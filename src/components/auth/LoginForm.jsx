import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../../features/auth/hooks/useAuthForm';
import Button from '../ui/Button';

export const LoginForm = ({
  mode = 'login',
}) => {
  const { 
    copy, 
    userId, setUserId, 
    password, setPassword, 
    showPassword, togglePassword,
    pending, errors, notice, handleSubmit, rememberMe, setRememberMe
  } = useAuthForm(mode);
  return (
    <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
      <h1 className="text-2xl font-bold text-[#1a365d] mb-2">{copy.title}</h1>
      <p className="text-gray-500 text-sm mb-8">{copy.subtitle}</p>

      {mode === 'login' && (
        <div className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-slate-600">
          <p className="font-semibold text-[#1a365d]">Tài khoản đăng nhập demo</p>
          <p>
            Tài khoản BE seed: <span className="font-mono font-medium">admin, teacher001, tc001, cm001, cs001</span>.
          </p>
          <p>
            Mật khẩu seed: <span className="font-mono font-medium">123456</span>. Ví dụ: <span className="font-mono font-medium">admin / 123456</span>.
          </p>
          <p className="mt-1 text-slate-500">
            Hệ thống đăng nhập bằng JWT từ backend, không dùng tài khoản mock để cấp quyền.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="login-identifier" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {mode === 'login' ? 'Tên đăng nhập' : 'Email'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="login-identifier"
              autoComplete="username"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-sm ${
                errors.userId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d]'
              }`}
              placeholder={mode === 'login' ? 'admin' : 'you@example.com'}
            />
          </div>
          
          {errors.userId && <p className="text-red-500 text-xs mt-2">{errors.userId}</p>}

          {mode === 'reset' && notice && (
            <div className="mt-3 bg-[#1a365d]/5 border border-[#1a365d]/20 text-[#1a365d] p-3 rounded-md text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 shrink-0 text-[#1a365d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* Trường Password */}
        {mode !== 'reset' && (
          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="login-password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 text-sm ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d]'
                }`}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
          </div>
        )}

        {/* Remember me & Forgot Password */}
        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 text-[#1a365d] border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-[#2b5c9e] hover:text-[#1a365d]">
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        {/* Nút Submit */}
        <div>
          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            className="w-full py-2.5"
          >
            {pending ? 'Processing...' : copy.action}
          </Button>
        </div>
      </form>

      {/* Footer Form */}
      {mode === 'reset' ? (
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
           <Link to="/login" className="text-sm font-medium text-[#1a365d] hover:underline">
             ← Back to Sign In
           </Link>
        </div>
      ) : (
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Protected internal system. For access issues, contact your Campus Administrator or IT Helpdesk.
          </p>
        </div>
      )}
    </div>
  );
};
