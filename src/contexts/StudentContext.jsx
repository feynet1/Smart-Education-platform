/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const StudentContext = createContext();

export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
    const { user, profile } = useAuth();

    // ── Enrolled Courses (Supabase) ───────────────────────────
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        if (!user?.id || !profile) return;
        fetchAllCourses();
        fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profile?.grade]);

    const fetchAllCourses = async () => {
        try {
            // Only fetch courses that match the student's grade
            const studentGrade = profile?.grade;
            let query = supabase.from('courses').select('*');
            if (studentGrade) {
                query = query.eq('grade', studentGrade);
            }
            const { data, error } = await query;
            if (error) throw error;
            setAllCourses((data || []).map(c => ({
                id: c.id,
                name: c.name,
                subject: c.subject,
                grade: c.grade,
                description: c.description,
                joinCode: c.join_code,
                teacherId: c.teacher_id,
            })));
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        }
    };

    const fetchEnrollments = async () => {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user.id);
            if (error && error.code !== '42P01') throw error; // ignore if table doesn't exist yet
            const ids = (data || []).map(e => e.course_id);
            setEnrollments(ids);
        } catch (err) {
            console.error('Failed to fetch enrollments:', err);
        }
    };

    useEffect(() => {
        setEnrolledCourses(allCourses.filter(c => enrollments.includes(c.id)));
    }, [allCourses, enrollments]);

    // Enroll by join code — find course, insert enrollment
    const enrollInCourse = async (joinCode) => {
        const course = allCourses.find(c => c.joinCode === joinCode.toUpperCase());
        if (!course) return { success: false, message: 'Invalid join code' };
        if (enrollments.includes(course.id)) return { success: false, message: 'Already enrolled in this course' };

        try {
            const { error } = await supabase
                .from('enrollments')
                .insert({ student_id: user.id, course_id: course.id });
            if (error) throw error;
            setEnrollments(prev => [...prev, course.id]);
            return { success: true, message: `Enrolled in ${course.name}!`, course };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const unenroll = async (courseId) => {
        try {
            await supabase
                .from('enrollments')
                .delete()
                .eq('student_id', user.id)
                .eq('course_id', courseId);
            setEnrollments(prev => prev.filter(id => id !== courseId));
        } catch (err) {
            console.error('Failed to unenroll:', err);
        }
    };

    // ── Active Sessions ───────────────────────────────────────
    const [activeSessions, setActiveSessions] = useState({}); // { courseId: session }

    useEffect(() => {
        if (enrollments.length === 0) return;
        fetchActiveSessions();
        // Subscribe to session changes
        const channel = supabase
            .channel('student-sessions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'class_sessions',
            }, () => fetchActiveSessions())
            .subscribe();
        return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrollments]);

    const fetchActiveSessions = async () => {
        if (enrollments.length === 0) return;
        try {
            const { data, error } = await supabase
                .from('class_sessions')
                .select('*')
                .in('course_id', enrollments)
                .eq('status', 'open');
            if (error) throw error;
            const map = {};
            (data || []).forEach(s => { map[s.course_id] = s; });
            setActiveSessions(map);
        } catch (err) {
            console.error('Failed to fetch active sessions:', err);
        }
    };

    // Join a session — marks student as Present
    const joinSession = async (courseId) => {
        const session = activeSessions[courseId];
        if (!session) return { success: false, message: 'No active session for this course' };
        if (!user?.id || !profile) return { success: false, message: 'Not authenticated' };

        // Check if already joined
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('session_id', session.id)
            .eq('student_id', user.id)
            .single();

        if (existing) return { success: false, message: 'Already joined this session' };

        // Calculate if late (more than 15 min after session started)
        const startedAt = new Date(session.started_at);
        const now = new Date();
        const minutesLate = (now - startedAt) / 60000;
        const status = minutesLate > 15 ? 'Late' : 'Present';

        try {
            const { error } = await supabase
                .from('attendance')
                .insert({
                    course_id: courseId,
                    session_id: session.id,
                    student_id: user.id,
                    student_name: profile.name || user.email?.split('@')[0] || 'Student',
                    date: session.date,
                    status,
                });
            if (error) throw error;
            return { success: true, message: `Marked as ${status}`, status };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // ── Grades (localStorage for now) ────────────────────────
    const [grades] = useState(() => {
        const saved = localStorage.getItem('student_grades');
        return saved ? JSON.parse(saved) : [
            { id: 1, courseId: '1', subject: 'Mathematics', assessment: 'Midterm Exam', score: 85, grade: 'A', feedback: 'Excellent work!', date: '2026-01-10' },
            { id: 2, courseId: '2', subject: 'Physics', assessment: 'Lab Report', score: 78, grade: 'B+', feedback: 'Good analysis.', date: '2026-01-15' },
        ];
    });

    const calculateGPA = () => {
        if (grades.length === 0) return 0;
        const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'F': 0 };
        const total = grades.reduce((sum, g) => sum + (gradePoints[g.grade] || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const value = {
        enrollments,
        enrolledCourses,
        allCourses,
        activeSessions,
        grades,
        gpa: calculateGPA(),
        attendancePercentage: 100,
        studentGrade: profile?.grade || null,
        enrollInCourse,
        unenroll,
        joinSession,
        fetchActiveSessions,
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};
