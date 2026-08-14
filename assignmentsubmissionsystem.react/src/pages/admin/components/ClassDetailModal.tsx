import { useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';

type ClassCourseRow = { id: string; name: string; subjectId: string; subjectName?: string; createdAt: string };
type UserDto = { id: string; fullName: string; email: string; role: string };
type TeacherAssignmentDto = { id: string; teacherId: string; teacherName?: string; classId: string; assignedAt: string };
type StudentEnrollmentDto = { id: string; studentId: string; studentName?: string; classId: string; enrolledAt: string };

type Props = {
  open: boolean;
  classData: ClassCourseRow;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function ClassDetailModal({ open, classData, onClose }: Props) {
  const [tab, setTab] = useState<'teachers' | 'students'>('teachers');
  const [teachers, setTeachers] = useState<TeacherAssignmentDto[]>([]);
  const [students, setStudents] = useState<StudentEnrollmentDto[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserDto[]>([]);
  const [allStudents, setAllStudents] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, classData.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, s, at, as_] = await Promise.all([
        apiClient.get<TeacherAssignmentDto[]>(`/api/classcourses/${classData.id}/teachers`),
        apiClient.get<StudentEnrollmentDto[]>(`/api/classcourses/${classData.id}/students`),
        apiClient.get<UserDto[]>('/api/users?role=Teacher'),
        apiClient.get<UserDto[]>('/api/users?role=Student')
      ]);
      setTeachers(t || []);
      setStudents(s || []);
      setAllTeachers(at || []);
      setAllStudents(as_ || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignTeacher = async () => {
    if (!selectedTeacher) return;
    try {
      await apiClient.post(`/api/classcourses/${classData.id}/teachers`, { teacherId: selectedTeacher, classId: classData.id });
      setSelectedTeacher('');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to assign teacher');
    }
  };

  const removeTeacher = async (teacherId: string) => {
    if (!confirm('Remove this teacher?')) return;
    try {
      await apiClient.delete(`/api/classcourses/${classData.id}/teachers/${teacherId}`);
      await loadData();
    } catch (err) {
      alert('Failed to remove teacher');
    }
  };

  const enrollStudent = async () => {
    if (!selectedStudent) return;
    try {
      await apiClient.post(`/api/classcourses/${classData.id}/students`, { studentId: selectedStudent, classId: classData.id });
      setSelectedStudent('');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to enroll student');
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!confirm('Remove this student?')) return;
    try {
      await apiClient.delete(`/api/classcourses/${classData.id}/students/${studentId}`);
      await loadData();
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-semibold mb-4">{classData.name} - Manage Members</h3>

        <div className="flex gap-4 mb-6 border-b">
          <button onClick={() => setTab('teachers')} className={`px-4 py-2 font-medium ${tab === 'teachers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Teachers ({teachers.length})</button>
          <button onClick={() => setTab('students')} className={`px-4 py-2 font-medium ${tab === 'students' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Students ({students.length})</button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : tab === 'teachers' ? (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="flex gap-2">
                <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="flex-1 border rounded px-3 py-2">
                  <option value="">-- Select teacher to add --</option>
                  {allTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                  ))}
                </select>
                <button onClick={assignTeacher} disabled={!selectedTeacher} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Add</button>
              </div>
            </div>

            {teachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No teachers assigned yet.</div>
            ) : (
              <div className="space-y-2">
                {teachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-800">{t.teacherName}</div>
                      <div className="text-xs text-gray-500">Assigned: {new Date(t.assignedAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => removeTeacher(t.teacherId)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="flex gap-2">
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="flex-1 border rounded px-3 py-2">
                  <option value="">-- Select student to enroll --</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                  ))}
                </select>
                <button onClick={enrollStudent} disabled={!selectedStudent} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Enroll</button>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No students enrolled yet.</div>
            ) : (
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-800">{s.studentName}</div>
                      <div className="text-xs text-gray-500">Enrolled: {new Date(s.enrolledAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => removeStudent(s.studentId)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}
