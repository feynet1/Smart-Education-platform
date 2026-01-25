import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { TeacherProvider } from './contexts/TeacherContext';

// Layouts
import TeacherLayout from './layouts/TeacherLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Teacher Pages
import TeacherDashboardHome from './pages/teacher/Dashboard';
import CourseList from './pages/teacher/Courses';
import ClassroomHelper from './pages/teacher/Classroom';
import AttendanceHelper from './pages/teacher/Attendance';
import NotesHelper from './pages/teacher/Notes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

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
              <Route path="classroom/:id" element={<ClassroomHelper />} />
              <Route path="attendance/:id" element={<AttendanceHelper />} />
              <Route path="notes/:id" element={<NotesHelper />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
