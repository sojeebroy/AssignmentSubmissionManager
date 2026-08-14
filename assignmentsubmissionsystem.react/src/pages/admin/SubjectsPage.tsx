import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiClient } from '@/services/apiClient';
import ConfirmDialog from '@/components/ConfirmDialog';

type SubjectRow = {
  id: string;
  name: string;
  code?: string;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SubjectRow | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<SubjectRow[]>('/api/subjects');
      setSubjects(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setFormData({ name: '', code: '' });
    setError('');
    setShowForm(true);
  };

  const onEdit = (s: SubjectRow) => {
    setEditing(s);
    setFormData({ name: s.name, code: s.code || '' });
    setError('');
    setShowForm(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Subject name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: formData.name.trim(), code: formData.code.trim() || null };

      if (editing) {
        await apiClient.put(`/api/subjects/${editing.id}`, payload);
      } else {
        await apiClient.post('/api/subjects', payload);
      }

      setShowForm(false);
      setFormData({ name: '', code: '' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (s: SubjectRow) => {
    setToDelete(s);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await apiClient.delete(`/api/subjects/${toDelete.id}`);
      setConfirmOpen(false);
      setToDelete(null);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete subject');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Subjects</h2>
        <div>
          <button onClick={onCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Create Subject</button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading subjects…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {subjects.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No subjects found. Create one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.code || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onEdit(s)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                          <button onClick={() => confirmDelete(s)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit subject' : 'Create subject'}</h3>
            {error && <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., Mathematics" 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                  placeholder="e.g., MATH101" 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowForm(false); setFormData({ name: '', code: '' }); }} 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} title="Delete subject" message={toDelete ? `Delete subject "${toDelete.name}"? This cannot be undone.` : ''} onConfirm={doDelete} onClose={() => { setConfirmOpen(false); setToDelete(null); }} />
    </AdminLayout>
  );
}
