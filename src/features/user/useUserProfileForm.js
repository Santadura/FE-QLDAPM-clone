import { useState } from 'react';
import { getSession } from '../../services/api';

const profileKey = (username) => `qldapm.user.demo-profile.v1:${encodeURIComponent(username)}`;

function readProfile(account) {
  const fallback = {
    fullName: account.user && account.user !== account.username ? account.user : '',
    phone: account.phone || '',
    email: account.email || '',
  };
  try {
    const stored = JSON.parse(localStorage.getItem(profileKey(account.username)));
    if (!stored || typeof stored !== 'object') return fallback;
    return Object.fromEntries(Object.entries(fallback).map(([field, value]) => [field, typeof stored[field] === 'string' ? stored[field] : value]));
  } catch {
    return fallback;
  }
}

export default function useUserProfileForm(account) {
  const [savedProfile, setSavedProfile] = useState(() => readProfile(account));
  const [form, setForm] = useState(savedProfile);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const dirty = Object.keys(form).some((field) => form[field] !== savedProfile[field]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, general: undefined }));
    setSaved(false);
  }

  function resetForm() {
    setForm(savedProfile);
    setErrors({});
    setSaved(false);
  }

  function saveProfile(event) {
    event.preventDefault();
    setSaved(false);
    const session = getSession();
    if (session?.username !== account.username || session.role !== 'USER') {
      setErrors({ general: 'Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.' });
      return;
    }
    const profile = Object.fromEntries(Object.entries(form).map(([field, value]) => [field, value.trim()]));
    const validation = {};
    if (!profile.fullName || profile.fullName.length > 100) validation.fullName = 'Họ và tên phải có từ 1 đến 100 ký tự.';
    if (!profile.email || profile.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) validation.email = 'Vui lòng nhập email hợp lệ, tối đa 100 ký tự.';
    if (profile.phone && (profile.phone.length > 15 || !/^\+?[0-9]{9,15}$/.test(profile.phone))) validation.phone = 'Số điện thoại phải có 9–15 chữ số, có thể bắt đầu bằng + và tối đa 15 ký tự.';
    setErrors(validation);
    if (Object.keys(validation).length) return;

    try {
      // Hồ sơ mẫu chỉ lưu trên trình duyệt, chưa cập nhật User hoặc Student ở backend.
      localStorage.setItem(profileKey(account.username), JSON.stringify(profile));
      setSavedProfile(profile);
      setForm(profile);
      setSaved(true);
    } catch {
      setErrors({ general: 'Không thể lưu hồ sơ trên trình duyệt. Vui lòng kiểm tra quyền lưu trữ rồi thử lại.' });
    }
  }

  return { form, savedProfile, errors, saved, dirty, updateField, resetForm, saveProfile };
}
