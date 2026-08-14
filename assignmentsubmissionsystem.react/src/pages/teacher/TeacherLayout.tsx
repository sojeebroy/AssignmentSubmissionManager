import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/teacher/dashboard', label: 'Dashboard' },
    { path: '/teacher/assignments', label: 'Assignments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg">
          <div className="px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-md text-sm font-medium mb-2 ${
                  location.pathname === link.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}