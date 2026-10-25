import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { employeeInput } from './EditEmployeeModal';

export default function CertificateModal({ certificate, onClose, onSubmit }) {
  const [form, setForm] = useState({ certificateType: certificate?.certificateType || '', score: certificate?.score ?? '', scoreSW: certificate?.scoreSW ?? '', issueDate: certificate?.issueDate || '', expiryDate: certificate?.expiryDate || '', issuer: certificate?.issuer || '', certificateUrl: certificate?.certificateUrl || '', status: certificate?.status || 'ACTIVE' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const change = (e) => { setForm((v) => ({ ...v, [e.target.name]: e.target.value })); setError(''); };
  async function submit(e) {
    e.preventDefault();
    if (pending) return;
    if (!form.certificateType.trim()) { setError('Please enter a certificate type.'); return; }
    if (form.certificateUrl && !/^https?:\/\//i.test(form.certificateUrl)) { setError('The URL must start with http:// or https://.'); return; }
    setPending(true);
    try {
      const result = await onSubmit({ ...form, certificateType: form.certificateType.trim(),
        score: form.score === '' ? null : Number(form.score), scoreSW: form.scoreSW === '' ? null : Number(form.scoreSW),
        issueDate: form.issueDate || null, expiryDate: form.expiryDate || null, issuer: form.issuer.trim() || null, certificateUrl: form.certificateUrl.trim() || null });
      if (result.ok) onClose(); else setError(result.errors?.general || 'Unable to save the certificate.');
    } catch (err) { setError(err.message); } finally { setPending(false); }
  }
  return (
    <Modal title={certificate ? 'Edit Certificate' : 'Add Certificate'} onClose={() => { if (!pending) onClose(); }} maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">Certificate type<input name="certificateType" required maxLength={30} value={form.certificateType} onChange={change} className={employeeInput} /></label>
          <label className="text-sm">Score<input type="number" name="score" min="0" step="any" value={form.score} onChange={change} className={employeeInput} /></label>
          <label className="text-sm">Speaking/Writing score<input type="number" name="scoreSW" min="0" step="any" value={form.scoreSW} onChange={change} className={employeeInput} /></label>
          <label className="text-sm">Issue date<input type="date" name="issueDate" max={form.expiryDate || undefined} value={form.issueDate} onChange={change} className={employeeInput} /></label>
          <label className="text-sm">Expiry date<input type="date" name="expiryDate" min={form.issueDate || undefined} value={form.expiryDate} onChange={change} className={employeeInput} /></label>
          <label className="text-sm sm:col-span-2">Issuer<input name="issuer" maxLength={100} value={form.issuer} onChange={change} className={employeeInput} /></label>
          <label className="text-sm sm:col-span-2">Certificate URL<input type="url" name="certificateUrl" maxLength={500} value={form.certificateUrl} onChange={change} className={employeeInput} placeholder="https://..." /></label>
          <label className="text-sm">Status<select name="status" value={form.status} onChange={change} className={employeeInput}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" disabled={pending} onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={pending}>{pending ? 'Saving...' : 'Save Certificate'}</Button></div>
      </form>
    </Modal>
  );
}
