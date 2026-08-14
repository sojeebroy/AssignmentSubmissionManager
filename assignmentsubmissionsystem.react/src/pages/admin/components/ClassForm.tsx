import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

type SubjectDto = { id: string; name: string; code?: string };

type Props = {
  open: boolean;
  initial?: { id?: string; name: string; subjectId: string };
  onClose: () => void;
  onSaved: () => void;
};

export default function ClassForm({ open, initial, onClose, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '');
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setSubjectId(initial?.subjectId ?? '');
    setError('');
    loadSubjects();
  }, [open, initial]);

  const loadSubjects = async () => {
    try {
      const data = await apiClient.get<SubjectDto[]>('/api/subjects');
      setSubjects(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!subjectId) {
      setError('Subject is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), subjectId };
      if (initial?.id) {
        await apiClient.put(`/api/classcourses/${initial.id}`, payload);
      } else {
        await apiClient.post('/api/classcourses', payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">{initial?.id ? 'Edit class' : 'Create class'}</h3>
        {error && <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Class 10-A" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Select a subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
