import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

interface SubmissionDetail {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  assignmentId: number;
  assignmentTitle: string;
  submittedAt: string;
  submissionText: string;
  score: number | null;
  feedback: string;
  totalPoints: number;
}

export default function TeacherGradingPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        // Use grading endpoint instead of submissions endpoint
        const data = await apiClient.get<SubmissionDetail>(
          `/api/grading/submissions/${submissionId}`
        );
        if (data) {
          setSubmission(data);
          setScore(data.score !== null ? String(data.score) : '');
          setFeedback(data.feedback);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load submission');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const scoreNum = score ? Number(score) : 0;
      if (scoreNum < 0 || scoreNum > (submission?.totalPoints || 100)) {
        setError(`Score must be between 0 and ${submission?.totalPoints}`);
        setSaving(false);
        return;
      }

      // Use grading endpoint for submitting grades
      await apiClient.post(`/api/grading/submissions/${submissionId}/grade`, {
        marks: scoreNum,
        feedback,
      });

      setSuccess('Grade submitted successfully!');
      setTimeout(() => {
        navigate(`/teacher/assignments/${submission?.assignmentId}/submissions`);
      }, 1500);
    } catch (err) {
      setError('Failed to submit grade');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-lg">Submission not found</p>
      </div>
    );
  }

  const scorePercentage = score ? (Number(score) / submission.totalPoints) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <button
          onClick={() => navigate(`/teacher/assignments/${submission.assignmentId}/submissions`)}
          className="text-blue-100 hover:text-white mb-2 flex items-center gap-2"
        >
          ← Back to Submissions
        </button>
        <h1 className="text-3xl font-bold mb-2">Grade Submission</h1>
        <p className="text-blue-100">
          {submission.studentName} • {submission.assignmentTitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Student</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{submission.studentName}</p>
                  <p className="text-gray-600">{submission.studentEmail}</p>
                </div>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Assignment</span>
                <span className="font-medium text-gray-900">{submission.assignmentTitle}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Submitted</span>
                <span className="text-gray-900">
                  {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                  {new Date(submission.submittedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Points</span>
                <span className="font-medium text-gray-900">{submission.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Submission Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Submission</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-64 whitespace-pre-wrap">
              {submission.submissionText}
            </div>
          </div>
        </div>

        {/* Sidebar - Grading Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 space-y-6">
            <form onSubmit={handleSubmitGrade} className="space-y-6">
              {/* Score Input */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-900 mb-2">
                  Score
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max={submission.totalPoints}
                    placeholder="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <div className="px-4 py-2 bg-gray-100 rounded-lg flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      /{submission.totalPoints}
                    </span>
                  </div>
                </div>

                {/* Score Percentage */}
                {score && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Percentage</span>
                      <span className="font-semibold">{scorePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          scorePercentage >= 80
                            ? 'bg-green-500'
                            : scorePercentage >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-900 mb-2">
                  Feedback & Comments
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the student..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Quick Feedback Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Quick Comments</p>
                <div className="space-y-2">
                  {[
                    'Great work! Keep it up.',
                    'Good effort, but needs improvement.',
                    'Please review the rubric and resubmit.',
                    'Excellent understanding of the material.',
                  ].map((comment, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedback((prev) => (prev ? `${prev}\n${comment}` : comment))}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    >
                      {comment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving || !score}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Submitting Grade...' : 'Submit Grade'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}