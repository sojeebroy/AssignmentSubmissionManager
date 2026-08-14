import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  status: 'Draft' | 'Published' | 'Closed';
  classId: string;
  className: string;
}

interface Class {
  id: string;
  name: string;
}

export default function TeacherAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isNewAssignment = assignmentId === 'new';

  const [assignment, setAssignment] = useState<Assignment>({
    id: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPoints: 100,
    status: 'Draft',
    classId: '',
    className: '',
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(!isNewAssignment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if user is not available
    if (!user?.id) {
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch classes assigned to this teacher
        try {
          const endpoint = `/api/teachers/${user.id}/classes`;
          const classesData = await apiClient.get<Class[]>(endpoint);
          setClasses(classesData || []);
        } catch (classErr) {
          console.warn('Failed to load classes:', classErr);
          setClasses([]);
          // Don't show error for classes - allow form to still work
        }

        // Fetch assignment if editing
        if (!isNewAssignment && assignmentId) {
          try {
            const assignmentData = await apiClient.get<any>(`/api/assignments/${assignmentId}`);
            if (assignmentData) {
              // Map backend fields to frontend model
              setAssignment((prev) => ({
                ...prev,
                id: assignmentData.id,
                title: assignmentData.title ?? prev.title,
                description: assignmentData.description ?? prev.description,
                dueDate: assignmentData.deadlineUtc
                  ? new Date(assignmentData.deadlineUtc).toISOString().split('T')[0]
                  : prev.dueDate,
                totalPoints: assignmentData.maxMarks ?? prev.totalPoints,
                status: assignmentData.status ?? prev.status,
                classId: assignmentData.classId ?? prev.classId,
                className: assignmentData.className ?? prev.className,
              }));
            }
          } catch (assignmentErr) {
            console.error('Failed to load assignment:', assignmentErr);
            setError('Failed to load assignment details');
          }
        }
        setError(null);
      } catch (err) {
        console.error('Unexpected error:', err);
        // Don't show error for new assignments - allow user to continue
        if (isNewAssignment) {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch after auth initialized (user may be null briefly)
    fetchData();
  }, [assignmentId, isNewAssignment, user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: name === 'totalPoints' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!assignment.title.trim()) {
      setError('Please enter an assignment title');
      return;
    }
    if (!assignment.dueDate) {
      setError('Please select a due date');
      return;
    }
    if (!assignment.classId) {
      setError('Please select a class');
      return;
    }
    if (assignment.totalPoints <= 0) {
      setError('Please enter total points greater than 0');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare data for API (map frontend field names to backend)
      // Convert date string (YYYY-MM-DD) to ISO DateTime format at end of day
      const dueDateObj = new Date(assignment.dueDate);
      dueDateObj.setHours(23, 59, 59, 999); // Set to end of day

      const apiData = {
        classId: assignment.classId,
        title: assignment.title.trim(),
        description: assignment.description.trim(),
        deadlineUtc: dueDateObj.toISOString(),
        maxMarks: Number(assignment.totalPoints),
      };

      if (isNewAssignment) {
        await apiClient.post('/api/assignments', apiData);
      } else {
        await apiClient.put(`/api/assignments/${assignment.id}`, apiData);
      }
      navigate('/teacher/assignments');
    } catch (err) {
      console.error('Error saving assignment:', err);
      // Provide detailed error message from API or generic fallback
      const errorMsg = 
        (err as any)?.response?.data?.message || 
        (err as any)?.response?.data?.errors?.deadlineUtc?.[0] ||
        (err as any)?.response?.data?.errors?.maxMarks?.[0] ||
        (err as any)?.response?.data?.errors?.classId?.[0] ||
        'Failed to save assignment';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      setError(null);

      // Use PATCH endpoint for publishing
      await apiClient.patch(`/api/assignments/${assignment.id}/publish`, {});

      setAssignment((prev) => ({ ...prev, status: 'Published' }));
      setError(null);
    } catch (err) {
      console.error('Error publishing assignment:', err);
      // Provide detailed error message from API or generic fallback
      const errorMsg = 
        (err as any)?.response?.data?.message || 
        (err as any)?.response?.data?.errors?.status?.[0] ||
        'Failed to publish assignment';
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {isNewAssignment ? 'Create New Assignment' : 'Edit Assignment'}
        </h1>
        <p className="text-blue-100">
          {isNewAssignment ? 'Add a new assignment for your class' : 'Update assignment details'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* Class Selection */}
        <div>
          <label htmlFor="classId" className="block text-sm font-medium text-gray-900 mb-2">
            Class <span className="text-red-600">*</span>
          </label>
          <select
            id="classId"
            name="classId"
            value={assignment.classId}
            onChange={handleChange}
            disabled={!isNewAssignment}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
            required
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
            Assignment Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={assignment.title}
            onChange={handleChange}
            placeholder="e.g., Chapter 5 Exercises"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={assignment.description}
            onChange={handleChange}
            placeholder="Provide detailed instructions for the assignment"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Due Date and Total Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900 mb-2">
              Due Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={assignment.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          {/* Total Points */}
          <div>
            <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-900 mb-2">
              Total Points <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="totalPoints"
              name="totalPoints"
              value={assignment.totalPoints}
              onChange={handleChange}
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Status Badge */}
        {!isNewAssignment && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {assignment.status}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/teacher/assignments')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 transition-colors"
          >
            {saving ? 'Saving...' : isNewAssignment ? 'Create Assignment' : 'Save Changes'}
          </button>

          {!isNewAssignment && assignment.status === 'Draft' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}