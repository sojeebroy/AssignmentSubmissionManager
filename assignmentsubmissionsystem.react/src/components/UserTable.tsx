export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  createdAt?: string;
}

type Props = {
  users: UserRow[];
  onEdit?: (user: UserRow) => void;
  onDelete?: (user: UserRow) => void;
};

export default function UserTable({ users, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-sm text-gray-500">No users found.</td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900 font-medium">{u.fullName}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'Admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'Teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && <button onClick={() => onEdit(u)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</button>}
                    {onDelete && <button onClick={() => onDelete(u)} className="text-sm px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}