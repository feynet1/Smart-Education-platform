import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { TeacherProvider } from './contexts/TeacherContext';

// Layouts
import TeacherLayout from './layouts/TeacherLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student imports
import { StudentProvider } from './contexts/StudentContext';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboardHome from './pages/student/Dashboard';
import StudentCoursesList from './pages/student/Courses';
import CourseDetails from './pages/student/Courses/CourseDetails';
import StudentGrades from './pages/student/Grades';
import StudentEvents from './pages/student/Events';
import StudentProfile from './pages/student/Profile';

// Teacher Pages
import TeacherDashboardHome from './pages/teacher/Dashboard';
import CourseList from './pages/teacher/Courses';
import ClassroomHelper from './pages/teacher/Classroom';
import AttendanceHelper from './pages/teacher/Attendance';
import NotesHelper from './pages/teacher/Notes';
import CourseSelector from './pages/teacher/CourseSelector';
import Settings from './pages/teacher/Settings';

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
              <Route path="profile" element={<StudentProfile />} />
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
              <Route path="settings" element={<Settings />} />
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
