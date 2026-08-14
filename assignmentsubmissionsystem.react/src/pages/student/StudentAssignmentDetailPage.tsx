import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  className: string;
  status: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  answerContent: string;
  submittedAt: string;
  status: string;
  marks: number | null;
  feedback: string;
  updatedAt?: string;
}

export default function StudentAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch assignment details
        const assignmentData = await apiClient.get<Assignment>(`/api/assignments/${assignmentId}`);
        setAssignment(assignmentData);

        // Try to fetch existing submission for this assignment
        try {
          // Get all student submissions and find the one for this assignment
          const allSubmissions = await apiClient.get<Submission[]>('/api/submissions');
          if (allSubmissions && Array.isArray(allSubmissions)) {
            // Find submission for this specific assignment
            const existingSubmission = allSubmissions.find(
              (s: any) => s.assignmentId === assignmentId
            );
            if (existingSubmission) {
              setSubmission(existingSubmission);
              setSubmissionText(existingSubmission.answerContent);
            }
          }
        } catch {
          // No submissions yet, that's fine
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load assignment:', err);
        setError('Failed to load assignment details');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  const isOverdue = assignment && new Date(assignment.dueDate) < new Date();
  const hasSubmitted = !!submission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionText.trim()) {
      setError('Please enter your submission');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (hasSubmitted && !isEditing) {
        setError('Already submitted. Click edit to update your submission.');
        setSaving(false);
        return;
      }

      if (submission && isEditing) {
        // Update existing submission
        await apiClient.put(`/api/submissions/${submission.id}`, {
          answerContent: submissionText,
        });
        setSuccess('Submission updated successfully!');
      } else {
        // Create new submission
        await apiClient.post('/api/submissions', {
          assignmentId,
          answerContent: submissionText,
        });
        setSuccess('Submission created successfully!');
      }

      // Refresh submission data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error submitting:', err);
      const errorMsg = (err as any)?.response?.data?.message || 'Failed to submit assignment';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assignment not found</p>
        <button
          onClick={() => navigate('/student/assignments')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to assignments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <button
          onClick={() => navigate('/student/assignments')}
          className="text-blue-100 hover:text-white mb-2 flex items-center gap-2"
        >
          ← Back to Assignments
        </button>
        <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-blue-100">{assignment.className}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Assignment Details */}
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Assignment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className={`text-lg font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString()}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-lg font-semibold text-gray-900">{assignment.totalPoints} points</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </div>

        {/* Submission Status */}
        {submission && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Submission</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-blue-700">Submitted At</p>
                <p className="font-medium text-gray-900">{new Date(submission.submittedAt).toLocaleString()}</p>
              </div>

              {submission.marks !== null && (
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold text-green-600">{submission.marks}/{assignment.totalPoints}</p>
                </div>
              )}

              {submission.feedback && (
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600 mb-1">Feedback</p>
                  <p className="text-gray-900">{submission.feedback}</p>
                </div>
              )}
            </div>

            {!isOverdue && !submission.feedback && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Submission'}
              </button>
            )}
          </div>
        )}

        {/* Submission Form */}
        {!submission || isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {submission ? 'Update Your Submission' : 'Submit Your Work'}
            </h3>

            <div>
              <label htmlFor="submission" className="block text-sm font-medium text-gray-900 mb-2">
                Your Submission <span className="text-red-600">*</span>
              </label>
              <textarea
                id="submission"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your submission text here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Character count: {submissionText.length}
              </p>
            </div>

            {isOverdue && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ This assignment is overdue. Submitting now will be marked as late.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {saving ? 'Submitting...' : submission && isEditing ? 'Update Submission' : 'Submit Assignment'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSubmissionText(submission?.answerContent || '');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="border-t pt-6">
            <p className="text-gray-600">
              You have already submitted this assignment.
              {!submission.feedback && !isOverdue && ' You can still edit your submission.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
