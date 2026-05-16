import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { TeacherProvider } from './contexts/TeacherContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import TeacherLayout from './layouts/TeacherLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AcceptInvite from './pages/auth/AcceptInvite';
import Landing from './pages/Landing';

// Student imports
import { StudentProvider } from './contexts/StudentContext';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboardHome from './pages/student/Dashboard';
import StudentCoursesList from './pages/student/Courses';
import CourseDetails from './pages/student/Courses/CourseDetails';
import StudentGrades from './pages/student/Grades';
import StudentEvents from './pages/student/Events';
import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';
import StudentAssignments from './pages/student/Assignments';
import NotificationsPage from './pages/shared/Notifications';

// Teacher Pages
import TeacherEvents from './pages/teacher/Events';
import TeacherDashboardHome from './pages/teacher/Dashboard';
import CourseList from './pages/teacher/Courses';
import ClassroomHelper from './pages/teacher/Classroom';
import AttendanceHelper from './pages/teacher/Attendance';
import NotesHelper from './pages/teacher/Notes';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherGrades from './pages/teacher/Grades';
import CourseSelector from './pages/teacher/CourseSelector';
import Settings from './pages/teacher/Settings';

// Admin imports
import { AdminProvider } from './contexts/AdminContext';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBranches from './pages/admin/Branches';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminAttendance from './pages/admin/Attendance';
import AdminGrades from './pages/admin/Grades';
import AdminEvents from './pages/admin/Events';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentProvider>
                    <StudentLayout />
                  </StudentProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardHome />} />
              <Route path="courses" element={<StudentCoursesList />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="events" element={<StudentEvents />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['Teacher']}>
                  <TeacherProvider>
                    <TeacherLayout />
                  </TeacherProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboardHome />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="classroom" element={<CourseSelector basePath="/teacher/classroom" title="Classroom" />} />
              <Route path="classroom/:id" element={<ClassroomHelper />} />
              <Route path="attendance" element={<CourseSelector basePath="/teacher/attendance" title="Attendance" />} />
              <Route path="attendance/:id" element={<AttendanceHelper />} />
              <Route path="notes" element={<CourseSelector basePath="/teacher/notes" title="Notes" />} />
              <Route path="notes/:id" element={<NotesHelper />} />
              <Route path="assignments" element={<CourseSelector basePath="/teacher/assignments" title="Assignments" />} />
              <Route path="assignments/:id" element={<TeacherAssignments />} />
              <Route path="grades" element={<CourseSelector basePath="/teacher/grades" title="Grades" />} />
              <Route path="grades/:id" element={<TeacherGrades />} />
              <Route path="events" element={<TeacherEvents />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Super Admin']}>
                  <AdminProvider>
                    <AdminLayout />
                  </AdminProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="branches" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <AdminBranches />
                </ProtectedRoute>
              } />
              <Route path="users" element={<AdminUsers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="grades" element={<AdminGrades />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
