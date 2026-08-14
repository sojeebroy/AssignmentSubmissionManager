import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  className: string;
  submitted: boolean;
  submittedAt?: string;
  score?: number;
  status: 'submitted' | 'pending' | 'overdue';
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Get published assignments for the student
        const data = await apiClient.get<Assignment[]>('/api/assignments/published');

        if (data) {
          // Add status based on due date
          const assignmentsWithStatus = data.map((a: any) => {
            const now = new Date();
            const dueDate = new Date(a.dueDate);
            let status: 'submitted' | 'pending' | 'overdue' = 'pending';

            if (a.submitted) status = 'submitted';
            else if (dueDate < now) status = 'overdue';

            return {
              ...a,
              status,
            };
          });

          setAssignments(assignmentsWithStatus);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load assignments:', err);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Filter assignments
  useEffect(() => {
    let filtered = assignments;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((a) => a.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, filter, searchTerm]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Assignments</h1>
        <p className="text-blue-100">{assignments.length} total assignments available</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'submitted', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No assignments found</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              to={`/student/assignments/${assignment.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-transparent hover:border-blue-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.className}</p>
                  <p className="text-sm text-gray-500 mt-2">{assignment.description?.substring(0, 100)}...</p>

                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm font-medium text-gray-700">
                      📌 {assignment.totalPoints} points
                    </span>
                    <span className="text-sm text-gray-600">
                      📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {assignment.status === 'submitted' && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Submitted
                    </div>
                  )}
                  {assignment.status === 'pending' && (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⏱ Pending
                    </div>
                  )}
                  {assignment.status === 'overdue' && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⚠ Overdue
                    </div>
                  )}
                  {assignment.score !== undefined && (
                    <p className="text-sm text-gray-600 mt-2">Score: {assignment.score}/{assignment.totalPoints}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
