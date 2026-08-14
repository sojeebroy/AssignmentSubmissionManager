import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin/users');
      } else if (user.role === 'Teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'Student') {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'badge-danger';
      case 'Teacher':
        return 'badge-primary';
      case 'Student':
        return 'badge-success';
      default:
        return 'badge';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AssignHub
              </span>
              <span className="ml-4 px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Home
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}! 👋</h1>
          <p className="text-gray-600">Here's what you need to know today</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <div className="lg:col-span-2 card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Full Name</span>
                <span className="font-semibold text-gray-900">{user?.fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Email Address</span>
                <span className="font-semibold text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Account Role</span>
                <span className={`badge ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              {user?.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <p className="text-sm text-gray-600 mt-1">Assignments</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">0</div>
                <p className="text-sm text-gray-600 mt-1">Submissions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-sm text-gray-600 mt-1">Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">More Features Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're working hard to add more powerful features to help you manage assignments and submissions effectively.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Explore Features
          </button>
        </div>

        {/* Role-based Quick Links */}
        {user?.role && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.role === 'Admin' && (
                <>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">Manage Users</h4>
                    <p className="text-sm text-gray-600 mt-1">Create and manage user accounts</p>
                  </button>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">Manage Classes</h4>
                    <p className="text-sm text-gray-600 mt-1">Organize classes and assignments</p>
                  </button>
                </>
              )}
              {user.role === 'Teacher' && (
                <>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">Create Assignment</h4>
                    <p className="text-sm text-gray-600 mt-1">Create a new assignment for your class</p>
                  </button>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">Grade Submissions</h4>
                    <p className="text-sm text-gray-600 mt-1">Review and grade student submissions</p>
                  </button>
                </>
              )}
              {user.role === 'Student' && (
                <>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">View Assignments</h4>
                    <p className="text-sm text-gray-600 mt-1">See assignments assigned to you</p>
                  </button>
                  <button className="card text-left hover:border-blue-600 transition">
                    <h4 className="font-bold text-gray-900">My Submissions</h4>
                    <p className="text-sm text-gray-600 mt-1">Track your submitted work</p>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
