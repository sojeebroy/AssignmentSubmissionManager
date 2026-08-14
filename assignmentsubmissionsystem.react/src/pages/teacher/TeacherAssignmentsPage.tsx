import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'Draft' | 'Published' | 'Closed';
  classId: number;
  className: string;
  submissionCount?: number;
  gradedCount?: number;
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Draft' | 'Published' | 'Closed'>('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [user?.id, filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const endpoint = filter !== 'All'
        ? `/api/teachers/${user?.id}/assignments?status=${filter}`
        : `/api/teachers/${user?.id}/assignments`;
      const data = await apiClient.get<Assignment[]>(endpoint);
      setAssignments(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/api/assignments/${assignmentId}`);
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError('Failed to delete assignment');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const draftCount = assignments.filter((a) => a.status === 'Draft').length;
  const publishedCount = assignments.filter((a) => a.status === 'Published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
            <p className="text-blue-100">
              {assignments.length} total • {publishedCount} published • {draftCount} drafts
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/assignments/new')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors flex items-center gap-2"
          >
            + New Assignment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Draft', 'Published', 'Closed'] as const).map((status) => {
          const count = status === 'Draft' ? draftCount : status === 'Published' ? publishedCount : undefined;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
              {count !== undefined && count > 0 && (
                <span className={`rounded-full w-5 h-5 text-xs flex items-center justify-center ${
                  filter === status ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Assignments Grid/List */}
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Status Bar */}
                <div className={`w-1 md:w-1 ${
                  assignment.status === 'Published'
                    ? 'bg-green-500'
                    : assignment.status === 'Draft'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}></div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        assignment.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'Draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{assignment.description?.substring(0, 100)}...</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📅</span>
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📚</span>
                        <span>{assignment.className}</span>
                      </div>
                      {assignment.submissionCount !== undefined && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📤</span>
                          <span>{assignment.submissionCount} submissions</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap md:flex-col md:w-auto md:flex-nowrap">
                    <Link
                      to={`/teacher/assignments/${assignment.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/teacher/assignments/${assignment.id}/submissions`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      Submissions
                    </Link>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-gray-600 text-lg">No assignments yet</p>
          <p className="text-gray-500 mt-2 mb-6">Create your first assignment to get started</p>
          <button
            onClick={() => navigate('/teacher/assignments/new')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Create Assignment
          </button>
        </div>
      )}
    </div>
  );
}