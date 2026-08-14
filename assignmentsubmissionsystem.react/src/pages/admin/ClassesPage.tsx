import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiClient } from '@/services/apiClient';
import ClassForm from './components/ClassForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import ClassDetailModal from './components/ClassDetailModal';

type ClassCourseRow = {
  id: string;
  name: string;
  subjectId: string;
  subjectName?: string;
  createdAt: string;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassCourseRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ClassCourseRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClass, setDetailClass] = useState<ClassCourseRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<ClassCourseRow[]>('/api/classcourses');
      setClasses(data || []);
    } catch (err) {
      alert('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (c: ClassCourseRow) => {
    setEditing(c);
    setShowForm(true);
  };

  const onViewDetails = (c: ClassCourseRow) => {
    setDetailClass(c);
    setDetailOpen(true);
  };

  const onSaved = async () => {
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const confirmDelete = (c: ClassCourseRow) => {
    setToDelete(c);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await apiClient.delete(`/api/classcourses/${toDelete.id}`);
      setConfirmOpen(false);
      setToDelete(null);
      await load();
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Classes</h2>
        <div>
          <button onClick={onCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Create Class</button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading classes…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {classes.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No classes found. Create one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.subjectName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onViewDetails(c)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Manage</button>
                          <button onClick={() => onEdit(c)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                          <button onClick={() => confirmDelete(c)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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

      {showForm && (
        <ClassForm open={showForm} initial={editing ?? undefined} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={onSaved} />
      )}

      <ConfirmDialog open={confirmOpen} title="Delete class" message={toDelete ? `Delete class "${toDelete.name}"? This cannot be undone.` : ''} onConfirm={doDelete} onClose={() => { setConfirmOpen(false); setToDelete(null); }} />

      {detailClass && (
        <ClassDetailModal open={detailOpen} classData={detailClass} onClose={() => { setDetailOpen(false); setDetailClass(null); }} onRefresh={load} />
      )}
    </AdminLayout>
  );
}
