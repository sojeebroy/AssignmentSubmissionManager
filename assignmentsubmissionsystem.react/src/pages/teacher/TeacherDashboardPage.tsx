import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

interface ClassStats {
  classId: number;
  className: string;
  assignmentCount: number;
  submissionCount: number;
  gradedCount: number;
}

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<ClassStats[]>(`/api/teachers/${user?.id}/stats`);
        setStats(data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.email || 'Teacher'}!</h1>
        <p className="text-blue-100">Manage your assignments, track submissions, and grade student work</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900">{stats.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Assignments</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.reduce((sum, s) => sum + s.assignmentCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending Reviews</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.reduce((sum, s) => sum + (s.submissionCount - s.gradedCount), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium mb-2">Graded</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.reduce((sum, s) => sum + s.gradedCount, 0)}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Classes</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {stats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.classId}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <h3 className="text-xl font-bold">{stat.className}</h3>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  {/* Stat Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📝</span>
                      <span className="text-gray-600">Assignments</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stat.assignmentCount}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📤</span>
                      <span className="text-gray-600">Submissions</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{stat.submissionCount}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">✅</span>
                      <span className="text-gray-600">Graded</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{stat.gradedCount}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Grading Progress</span>
                      <span className="font-semibold text-gray-900">
                        {stat.submissionCount > 0
                          ? `${Math.round((stat.gradedCount / stat.submissionCount) * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            stat.submissionCount > 0
                              ? (stat.gradedCount / stat.submissionCount) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                  <Link
                    to="/teacher/assignments"
                    className="flex-1 px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Assignments
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-gray-600 text-lg">No classes assigned yet</p>
            <p className="text-gray-500 mt-2">Contact your administrator to assign classes</p>
          </div>
        )}
      </div>
    </div>
  );
}