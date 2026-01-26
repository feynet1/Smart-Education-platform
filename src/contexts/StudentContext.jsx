/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export const useStudent = () => {
    return useContext(StudentContext);
};

export const StudentProvider = ({ children }) => {
    // --- Read Teacher Data ---
    // Courses created by teachers
    const getTeacherCourses = () => {
        const saved = localStorage.getItem('teacher_courses');
        return saved ? JSON.parse(saved) : [];
    };

    // Notes uploaded by teachers
    const getTeacherNotes = () => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {};
    };

    // Attendance marked by teachers
    const getTeacherAttendance = () => {
        const saved = localStorage.getItem('teacher_attendance');
        return saved ? JSON.parse(saved) : {};
    };

    // --- Student-specific State ---
    const [enrollments, setEnrollments] = useState(() => {
        const saved = localStorage.getItem('student_enrollments');
        return saved ? JSON.parse(saved) : []; // Array of course IDs
    });

    const [grades] = useState(() => {
        const saved = localStorage.getItem('student_grades');
        return saved ? JSON.parse(saved) : [
            // Mock grades data
            { id: 1, courseId: '1', subject: 'Mathematics', assessment: 'Midterm Exam', score: 85, grade: 'A', feedback: 'Excellent work!', date: '2026-01-10' },
            { id: 2, courseId: '2', subject: 'Physics', assessment: 'Lab Report', score: 78, grade: 'B+', feedback: 'Good analysis.', date: '2026-01-15' },
            { id: 3, courseId: '1', subject: 'Mathematics', assessment: 'Quiz 1', score: 92, grade: 'A+', feedback: 'Perfect!', date: '2026-01-20' },
        ];
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('student_enrollments', JSON.stringify(enrollments));
    }, [enrollments]);

    useEffect(() => {
        localStorage.setItem('student_grades', JSON.stringify(grades));
    }, [grades]);

    // --- Computed Values ---
    const enrolledCourses = getTeacherCourses().filter(course => enrollments.includes(course.id));

    const calculateGPA = () => {
        if (grades.length === 0) return 0;
        const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };
        const total = grades.reduce((sum, g) => sum + (gradePoints[g.grade] || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const calculateAttendance = () => {
        const attendance = getTeacherAttendance();
        let present = 0;
        let total = 0;
        enrollments.forEach(courseId => {
            const courseAttendance = attendance[courseId] || [];
            courseAttendance.forEach(record => {
                record.records.forEach(r => {
                    total++;
                    if (r.status === 'Present') present++;
                });
            });
        });
        return total > 0 ? Math.round((present / total) * 100) : 100;
    };

    // --- Actions ---
    const enrollInCourse = (joinCode) => {
        const courses = getTeacherCourses();
        const course = courses.find(c => c.joinCode === joinCode);
        if (!course) {
            return { success: false, message: 'Invalid join code' };
        }
        if (enrollments.includes(course.id)) {
            return { success: false, message: 'Already enrolled in this course' };
        }
        setEnrollments([...enrollments, course.id]);
        return { success: true, message: `Enrolled in ${course.name}!`, course };
    };

    const unenroll = (courseId) => {
        setEnrollments(enrollments.filter(id => id !== courseId));
    };

    const value = {
        enrollments,
        enrolledCourses,
        allCourses: getTeacherCourses(),
        notes: getTeacherNotes(),
        attendance: getTeacherAttendance(),
        grades,
        gpa: calculateGPA(),
        attendancePercentage: calculateAttendance(),
        enrollInCourse,
        unenroll,
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};
