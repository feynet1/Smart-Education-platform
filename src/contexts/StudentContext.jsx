/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { scoreToGrade, gradeToPoints, DEFAULT_WEIGHTS, DEFAULT_MAX_MARKS, calcWeightedTotal } from '../utils/gradeUtils';

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

        // Check if already marked Present or Late for this session
        const { data: existing } = await supabase
            .from('attendance')
            .select('id, status')
            .eq('course_id', courseId)
            .eq('student_id', user.id)
            .eq('date', session.date)
            .single();

        if (existing && (existing.status === 'Present' || existing.status === 'Late')) {
            return { success: false, message: 'Already joined this session' };
        }

        // Calculate if late (more than 15 min after session started)
        const startedAt = new Date(session.started_at);
        const now = new Date();
        const minutesLate = (now - startedAt) / 60000;
        const status = minutesLate > 15 ? 'Late' : 'Present';

        try {
            // Use upsert so an existing Absent record gets updated to Present/Late
            const { error } = await supabase
                .from('attendance')
                .upsert({
                    course_id:    courseId,
                    session_id:   session.id,
                    student_id:   user.id,
                    student_name: profile.name || user.email?.split('@')[0] || 'Student',
                    date:         session.date,
                    status,
                }, { onConflict: 'course_id,student_id,date' });
            if (error) throw error;
            // Refresh attendance history so the new record shows up
            fetchAttendanceHistory();
            return { success: true, message: `Marked as ${status}`, status };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // ── Attendance History (Supabase) ────────────────────────
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const fetchAttendanceHistory = async () => {
        if (!user?.id) return;
        setAttendanceLoading(true);
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('id, course_id, date, status, session_id')
                .eq('student_id', user.id)
                .order('date', { ascending: false });
            if (error) throw error;
            setAttendanceRecords(data || []);
        } catch (err) {
            console.error('Failed to fetch attendance history:', err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchAttendanceHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Overall attendance percentage across all courses
    const calculateAttendancePercentage = () => {
        if (attendanceRecords.length === 0) return null;
        const present = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
        return Math.round((present / attendanceRecords.length) * 100);
    };

    // Per-course attendance: { courseId: { total, present, late, absent, percentage } }
    const courseAttendanceStats = enrollments.reduce((acc, courseId) => {
        const records = attendanceRecords.filter(r => r.course_id === courseId);
        if (records.length === 0) {
            acc[courseId] = { total: 0, present: 0, late: 0, absent: 0, percentage: null };
            return acc;
        }
        const present = records.filter(r => r.status === 'Present').length;
        const late    = records.filter(r => r.status === 'Late').length;
        const absent  = records.filter(r => r.status === 'Absent').length;
        acc[courseId] = {
            total: records.length,
            present,
            late,
            absent,
            percentage: Math.round(((present + late) / records.length) * 100),
        };
        return acc;
    }, {});
    const [grades, setGrades] = useState([]);
    const [gradesLoading, setGradesLoading] = useState(false);

    const fetchGrades = async () => {
        if (!user?.id) return;
        setGradesLoading(true);
        try {
            // Fetch all grade entries for this student
            const { data: entries, error: entriesErr } = await supabase
                .from('grade_entries')
                .select('*')
                .eq('student_id', user.id);
            if (entriesErr) throw entriesErr;

            if (!entries || entries.length === 0) {
                setGrades([]);
                return;
            }

            // Get unique course IDs and fetch their weights
            const courseIds = [...new Set(entries.map(e => e.course_id))];
            const { data: weightsData } = await supabase
                .from('course_weights')
                .select('*')
                .in('course_id', courseIds);

            const weightsMap = {};
            (weightsData || []).forEach(w => { weightsMap[w.course_id] = w; });

            // Group entries by course, compute weighted total per course
            const byCourse = {};
            entries.forEach(e => {
                if (!byCourse[e.course_id]) byCourse[e.course_id] = [];
                byCourse[e.course_id].push(e);
            });

            const gradeRows = [];
            Object.entries(byCourse).forEach(([cid, courseEntries]) => {
                const w = weightsMap[cid];

                // Build wMax FIRST before using it
                const wMax = w ? {
                    homework:   w.hw_max     ?? DEFAULT_MAX_MARKS.homework,
                    assignment: w.assign_max ?? DEFAULT_MAX_MARKS.assignment,
                    quiz:       w.quiz_max   ?? DEFAULT_MAX_MARKS.quiz,
                    midterm:    w.mid_max    ?? DEFAULT_MAX_MARKS.midterm,
                    project:    w.proj_max   ?? DEFAULT_MAX_MARKS.project,
                    final_exam: w.final_max  ?? DEFAULT_MAX_MARKS.final_exam,
                } : DEFAULT_MAX_MARKS;

                // One row per category
                courseEntries.forEach(e => {
                    const max = wMax[e.category] ?? DEFAULT_MAX_MARKS[e.category] ?? 100;
                    const pct = Math.min((parseFloat(e.score) / max) * 100, 100);
                    gradeRows.push({
                        id:         e.id,
                        courseId:   e.course_id,
                        subject:    e.category,
                        assessment: e.category,
                        category:   e.category,
                        score:      parseFloat(e.score),
                        maxMark:    max,
                        percentage: parseFloat(pct.toFixed(1)),
                        feedback:   e.feedback || '',
                        date:       e.graded_at,
                        weight:     w?.[e.category] ?? DEFAULT_WEIGHTS[e.category] ?? 0,
                    });
                });

                // Compute weighted total
                const scoreMap = {};
                courseEntries.forEach(e => { scoreMap[e.category] = parseFloat(e.score); });
                const result = calcWeightedTotal(scoreMap, w || DEFAULT_WEIGHTS, wMax);
                if (result != null) {
                    gradeRows.push({
                        id:            `total-${cid}`,
                        courseId:      cid,
                        subject:       'Weighted Total',
                        assessment:    'Final',
                        category:      'total',
                        score:         result.earned,
                        feedback:      '',
                        date:          '',
                        weight:        100,
                        isTotal:       true,
                        isComplete:    result.isComplete,
                        enteredWeight: result.enteredWeight,
                    });
                }
            });

            setGrades(gradeRows);
        } catch (err) {
            console.error('Failed to fetch grades:', err);
        } finally {
            setGradesLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const calculateGPA = () => {
        // Only count courses where all 6 categories have been graded
        const completeTotals = grades.filter(g => g.isTotal && g.isComplete);
        if (completeTotals.length === 0) return '0.00';
        const sum = completeTotals.reduce((acc, g) => acc + gradeToPoints(scoreToGrade(g.score)), 0);
        return (sum / completeTotals.length).toFixed(2);
    };

    const value = {
        enrollments,
        enrolledCourses,
        allCourses,
        activeSessions,
        grades,
        gradesLoading,
        gpa: calculateGPA(),
        attendanceRecords,
        attendanceLoading,
        attendancePercentage: calculateAttendancePercentage(),
        courseAttendanceStats,
        studentGrade: profile?.grade || null,
        enrollInCourse,
        unenroll,
        joinSession,
        fetchActiveSessions,
        fetchAttendanceHistory,
        fetchGrades,
        fetchAllCourses,
        fetchEnrollments,
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};
