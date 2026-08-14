import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  const linkClass = 'block px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition';
  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Admin</h3>
      </div>
      <nav className="p-4 space-y-1">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? 'bg-gray-100' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `${linkClass} ${isActive ? 'bg-gray-100' : ''}`}>
          Users
        </NavLink>
        <NavLink to="/admin/subjects" className={({ isActive }) => `${linkClass} ${isActive ? 'bg-gray-100' : ''}`}>
          Subjects
        </NavLink>
        <NavLink to="/admin/classes" className={({ isActive }) => `${linkClass} ${isActive ? 'bg-gray-100' : ''}`}>
          Classes
        </NavLink>
      </nav>
      <div className="p-4 mt-auto text-xs text-gray-500">© Assignment Submission</div>
    </aside>
  );
}