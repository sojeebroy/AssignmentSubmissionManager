import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

interface Submission {
  id: string;
  assignmentId: string;
  submittedAt: string;
  marks: number | null;
  feedback: string;
  status: 'graded' | 'pending' | 'late';
  // Additional fields we'll map from API
  [key: string]: any;
}

export default function StudentMySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<Submission[]>('/api/submissions');

        if (data) {
          // Add status
          const submissionsWithStatus = data.map((s: any) => ({
            ...s,
            status: s.marks !== null ? 'graded' : 'pending',
          }));

          setSubmissions(submissionsWithStatus);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load submissions:', err);
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Filter submissions
  useEffect(() => {
    let filtered = submissions;

    if (filter !== 'all') {
      filtered = filtered.filter((s) => s.status === filter);
    }

    // Sort by submitted date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    setFilteredSubmissions(filtered);
  }, [submissions, filter]);

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

  const gradedCount = submissions.filter((s) => s.marks !== null).length;
  const pendingCount = submissions.filter((s) => s.marks === null).length;
  const averageScore = submissions.filter((s) => s.marks !== null).length > 0
    ? submissions
        .filter((s) => s.marks !== null)
        .reduce((acc, s) => acc + (s.marks || 0), 0) / submissions.filter((s) => s.marks !== null).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
        <p className="text-blue-100">{submissions.length} total submissions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{submissions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Graded</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{gradedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Average Score</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {averageScore > 0 ? averageScore.toFixed(1) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-2">
        {(['all', 'graded', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'graded' ? `Graded (${gradedCount})` : `Pending (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4"
              style={{
                borderColor: submission.score !== null ? '#10b981' : '#f59e0b',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{submission.assignmentId}</h3>
                  <p className="text-sm text-gray-600 mt-1">Submission ID: {submission.id}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    📅 Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  {submission.marks !== null ? (
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {submission.marks}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⏱ Pending Grade
                    </div>
                  )}
                </div>
              </div>

              {submission.feedback && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-2">Feedback</p>
                  <p className="text-gray-700">{submission.feedback}</p>
                </div>
              )}

              <Link
                to={`/student/assignments/${submission.assignmentId}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Assignment →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
