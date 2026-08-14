import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

interface DashboardStats {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  gradedSubmissions: number;
  averageScore: number;
}

interface RecentAssignment {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  daysUntilDue: number;
  status: 'submitted' | 'pending' | 'overdue';
}

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch published assignments for student
        const assignmentsData = await apiClient.get<any[]>('/api/assignments/published');

        // Calculate stats
        const totalAssignments = assignmentsData?.length || 0;
        const submittedAssignments = assignmentsData?.filter((a: any) => a.submitted)?.length || 0;
        const pendingAssignments = totalAssignments - submittedAssignments;

        // Fetch student submissions for grading info
        const submissionsData = await apiClient.get<any[]>('/api/submissions');
        const gradedSubmissions = submissionsData?.filter((s: any) => s.score !== null)?.length || 0;
        const averageScore = submissionsData && submissionsData.length > 0
          ? submissionsData
              .filter((s: any) => s.score !== null)
              .reduce((acc: number, s: any) => acc + s.score, 0) / gradedSubmissions
          : 0;

        setStats({
          totalAssignments,
          submittedAssignments,
          pendingAssignments,
          gradedSubmissions,
          averageScore: Math.round(averageScore * 10) / 10,
        });

        // Prepare recent assignments (next 5 due)
        const now = new Date();
        const recentList: RecentAssignment[] = [];

        if (assignmentsData) {
          for (const a of assignmentsData) {
            const daysUntilDue = Math.ceil((new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let status: 'submitted' | 'pending' | 'overdue' = 'pending';
            if (a.submitted) status = 'submitted';
            else if (new Date(a.dueDate) < now) status = 'overdue';

            recentList.push({
              id: a.id,
              title: a.title,
              className: a.className,
              dueDate: a.dueDate,
              daysUntilDue,
              status,
            });
          }

          recentList.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
        }

        setRecentAssignments(recentList.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
        <p className="text-blue-100">Here's your assignment overview</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-medium">Total Assignments</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalAssignments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-medium">Submitted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.submittedAssignments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingAssignments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-medium">Graded</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.gradedSubmissions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-medium">Average Score</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.averageScore.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Assignments</h2>
          <Link
            to="/student/assignments"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming assignments</p>
        ) : (
          <div className="space-y-3">
            {recentAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/student/assignments/${assignment.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.className}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      assignment.status === 'submitted'
                        ? 'text-green-600'
                        : assignment.status === 'overdue'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {assignment.status === 'submitted' && '✓ Submitted'}
                    {assignment.status === 'overdue' && '⚠ Overdue'}
                    {assignment.status === 'pending' && `Due in ${assignment.daysUntilDue} day${assignment.daysUntilDue !== 1 ? 's' : ''}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
