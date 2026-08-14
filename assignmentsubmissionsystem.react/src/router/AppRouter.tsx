import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Admin pages
import UsersPage from '@/pages/admin/UsersPage';
import ClassesPage from '@/pages/admin/ClassesPage';
import SubjectsPage from '@/pages/admin/SubjectsPage';
import AdminLayout from '@/pages/admin/AdminLayout';

// Teacher pages
import TeacherLayout from '@/pages/teacher/TeacherLayout';
import TeacherDashboardPage from '@/pages/teacher/TeacherDashboardPage';
import TeacherAssignmentsPage from '@/pages/teacher/TeacherAssignmentsPage';
import TeacherAssignmentDetailPage from '@/pages/teacher/TeacherAssignmentDetailPage';
import TeacherSubmissionsPage from '@/pages/teacher/TeacherSubmissionsPage';
import TeacherGradingPage from '@/pages/teacher/TeacherGradingPage';

// Student pages
import StudentLayout from '@/pages/student/StudentLayout';
import StudentDashboardPage from '@/pages/student/StudentDashboardPage';
import StudentAssignmentsPage from '@/pages/student/StudentAssignmentsPage';
import StudentAssignmentDetailPage from '@/pages/student/StudentAssignmentDetailPage';
import StudentMySubmissionsPage from '@/pages/student/StudentMySubmissionsPage';

export function AppRouter() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth().catch(() => {});
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin area - require Admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={['Admin']}>
              <AdminLayout>
                <Navigate to="/admin/users" replace />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={['Admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute requiredRole={['Admin']}>
              <SubjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute requiredRole={['Admin']}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        {/* Teacher area - require Teacher role */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherLayout>
                <Navigate to="/teacher/dashboard" replace />
              </TeacherLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherAssignmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId/submissions"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherSubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/submissions/:submissionId/grade"
          element={
            <ProtectedRoute requiredRole={['Teacher']}>
              <TeacherGradingPage />
            </ProtectedRoute>
          }
        />

        {/* Student area - require Student role */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole={['Student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="assignments/:assignmentId" element={<StudentAssignmentDetailPage />} />
          <Route path="my-submissions" element={<StudentMySubmissionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
