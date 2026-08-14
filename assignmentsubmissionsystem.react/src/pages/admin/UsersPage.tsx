import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import UserTable, { type UserRow } from '@/components/UserTable';
import { apiClient } from '@/services/apiClient';
import UserModal from '@/components/UserModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<UserRow[]>('/api/users');
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (u: UserRow) => {
    setEditing(u);
    setModalOpen(true);
  };

  const onSaved = async () => {
    setModalOpen(false);
    setEditing(null);
    await load();
  };

  const confirmDelete = (u: UserRow) => {
    setToDelete(u);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await apiClient.delete(`/api/users/${toDelete.id}`);
      setConfirmOpen(false);
      setToDelete(null);
      await load();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <div>
          <button onClick={onCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Create User</button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading users…</div>
      ) : (
        <>
          <UserTable users={users} onEdit={onEdit} onDelete={confirmDelete} />
        </>
      )}

      {modalOpen && (
        <UserModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} onSaved={onSaved} initial={editing ? { id: editing.id, email: editing.email, fullName: editing.fullName, role: editing.role } : undefined} />
      )}

      <ConfirmDialog open={confirmOpen} title="Delete user" message={toDelete ? `Delete user "${toDelete.fullName}"? This cannot be undone.` : ''} onConfirm={doDelete} onClose={() => { setConfirmOpen(false); setToDelete(null); }} />
    </AdminLayout>
  );
}