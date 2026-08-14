import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

interface Submission {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  assignmentId: number;
  assignmentTitle: string;
  submittedAt: string;
  score: number | null;
  feedback: string;
  status: 'Submitted' | 'Graded' | 'Late';
}

interface AssignmentInfo {
  id: number;
  title: string;
  totalPoints: number;
}

export default function TeacherSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Submitted' | 'Graded'>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch assignment info
        const assignmentData = await apiClient.get<AssignmentInfo>(
          `/api/assignments/${assignmentId}`
        );
        setAssignment(assignmentData);

        // Fetch submissions from grading endpoint
        const endpoint = filter !== 'All'
          ? `/api/grading/assignments/${assignmentId}/submissions?status=${filter}`
          : `/api/grading/assignments/${assignmentId}/submissions`;
        const submissionsData = await apiClient.get<Submission[]>(endpoint);
        setSubmissions(submissionsData || []);
        setError(null);
      } catch (err) {
        setError('Failed to load submissions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const submittedCount = submissions.filter((s) => s.status !== 'Graded').length;
  const gradedCount = submissions.filter((s) => s.status === 'Graded').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="text-blue-100 hover:text-white mb-2 flex items-center gap-2"
            >
              ← Back to Assignments
            </button>
            <h1 className="text-3xl font-bold mb-2">{assignment?.title}</h1>
            <p className="text-blue-100">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} •{' '}
              {gradedCount} graded • {submittedCount} pending
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{gradedCount}</p>
            <p className="text-blue-100">Graded</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['All', 'Submitted', 'Graded'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
            {status === 'Submitted' && submittedCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">
                {submittedCount}
              </span>
            )}
            {status === 'Graded' && gradedCount > 0 && (
              <span className="ml-2 bg-green-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">
                {gradedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr
                key={submission.id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{submission.studentName}</p>
                    <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                  {new Date(submission.submittedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'Graded'
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'Late'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {submission.score !== null ? (
                      <span className="font-bold text-gray-900">
                        {submission.score}/{assignment?.totalPoints}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm space-x-3">
                  <Link
                    to={`/teacher/submissions/${submission.id}/grade`}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {submission.status === 'Graded' ? 'View Grade' : 'Grade'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-gray-600 text-lg">No submissions yet</p>
          <p className="text-gray-500 mt-2">Students will see this assignment when it's published</p>
        </div>
      )}
    </div>
  );
}