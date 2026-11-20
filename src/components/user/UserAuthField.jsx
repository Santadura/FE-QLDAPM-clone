import { Eye, EyeOff } from 'lucide-react';

export default function UserAuthField({ label, name, error, icon: Icon, password = false, visible = false, onToggle, ...props }) {
  const id = `user-auth-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">{label}</label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
        <input {...props} id={id} name={name} type={password ? visible ? 'text' : 'password' : props.type || 'text'}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : props['aria-describedby']}
          className={`block w-full rounded-md border py-2 pl-10 pr-3 text-sm outline-none focus:ring-1 ${password ? 'pr-11' : ''} ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#1a365d] focus:ring-[#1a365d]'} disabled:bg-slate-50`} />
        {password && onToggle && <button type="button" onClick={onToggle} disabled={props.disabled} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-[#1a365d]">
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>}
      </div>
      {error && <p id={`${id}-error`} className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
