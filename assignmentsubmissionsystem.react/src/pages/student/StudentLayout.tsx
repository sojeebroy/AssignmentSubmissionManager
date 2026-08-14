import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function StudentLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/student/dashboard" className="text-2xl font-bold text-blue-600">
                AssignmentHub
              </Link>
              <div className="hidden md:flex gap-1">
                <Link
                  to="/student/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/student/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/student/assignments"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/student/assignments')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Assignments
                </Link>
                <Link
                  to="/student/my-submissions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/student/my-submissions')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  My Submissions
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
