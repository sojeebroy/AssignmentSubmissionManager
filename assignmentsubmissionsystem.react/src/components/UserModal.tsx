import { useState, useEffect } from 'react';
import type { RegisterRequest } from '@/types/auth';
import { apiClient } from '@/services/apiClient';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (created: any) => void;
  initial?: Partial<RegisterRequest> & { id?: string };
}

export default function UserModal({ open, onClose, onSaved, initial }: Props) {
  const [email, setEmail] = useState(initial?.email ?? '');
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRequest['role']>(initial?.role ?? 'Student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setEmail(initial?.email ?? '');
    setFullName(initial?.fullName ?? '');
    setRole(initial?.role ?? 'Student');
    setPassword('');
    setError('');
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !fullName || (!initial && password.length < 8)) {
      setError('Please fill required fields. Password must be at least 8 characters for new users.');
      return;
    }

    setSubmitting(true);
    try {
      if (initial && initial.id) {
        // update path - send FullName and IsActive
        const payload = { fullName };
        const updated = await apiClient.put(`/api/users/${initial.id}`, payload);
        onSaved(updated);
      } else {
        const payload: RegisterRequest = { email, fullName, password, role };
        const created = await apiClient.post('/api/auth/register', payload);
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit User' : 'Create User'}</h3>
        {error && <div className="mb-4 text-sm text-red-600 p-3 bg-red-50 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!initial} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          {!initial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} disabled={!!initial} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
