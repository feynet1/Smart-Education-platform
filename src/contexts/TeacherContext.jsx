/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const TeacherContext = createContext();

export const useTeacher = () => useContext(TeacherContext);

// Generate a random 6-char join code
const generateJoinCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

export const TeacherProvider = ({ children }) => {
    const { user } = useAuth();

    // ── Courses (Supabase) ────────────────────────────────────
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const fetchCourses = async () => {
        if (!user?.id) return;
        setCoursesLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            // Map snake_case to camelCase for compatibility
            setCourses((data || []).map(c => ({
                id: c.id,
                name: c.name,
                subject: c.subject,
                grade: c.grade,
                description: c.description,
                joinCode: c.join_code,
                teacherId: c.teacher_id,
                createdAt: c.created_at,
                students: [],
            })));
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setCoursesLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const addCourse = async (courseData) => {
        if (!user?.id) {
            console.error('[addCourse] No user id — not authenticated');
            return { success: false, error: 'Not authenticated' };
        }
        const joinCode = generateJoinCode();
        console.log('[addCourse] inserting with teacher_id:', user.id);
        try {
            const { data, error } = await supabase
                .from('courses')
                .insert({
                    teacher_id: user.id,
                    name: courseData.name,
                    subject: courseData.subject,
                    grade: courseData.grade,
                    description: courseData.description || null,
                    join_code: joinCode,
                })
                .select()
                .single();
            if (error) {
                console.error('[addCourse] Supabase error:', error);
                throw error;
            }
            console.log('[addCourse] success:', data);
            const mapped = {
                id: data.id,
                name: data.name,
                subject: data.subject,
                grade: data.grade,
                description: data.description,
                joinCode: data.join_code,
                teacherId: data.teacher_id,
                createdAt: data.created_at,
                students: [],
            };
            setCourses(prev => [mapped, ...prev]);
            return { success: true, course: mapped };
        } catch (err) {
            console.error('[addCourse] Failed:', err);
            return { success: false, error: err.message };
        }
    };

    const updateCourse = async (id, updatedData) => {
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    name: updatedData.name,
                    subject: updatedData.subject,
                    grade: updatedData.grade,
                    description: updatedData.description || null,
                })
                .eq('id', id)
                .eq('teacher_id', user.id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Failed to update course:', err);
            await fetchCourses(); // Rollback by refetching
            return { success: false, error: err.message };
        }
    };

    const deleteCourse = async (id) => {
        setCourses(prev => prev.filter(c => c.id !== id));
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id)
                .eq('teacher_id', user.id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Failed to delete course:', err);
            await fetchCourses(); // Rollback
            return { success: false, error: err.message };
        }
    };

    // ── Students (from Supabase profiles) ────────────────────
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .eq('role', 'Student');
                if (error) throw error;
                setStudents((data || []).map(s => ({
                    id: s.id,
                    name: s.name || s.email?.split('@')[0] || 'Unknown',
                    email: s.email,
                })));
            } catch (err) {
                console.error('Failed to fetch students:', err);
            }
        };
        fetchStudents();
    }, []);

    // ── Attendance (Supabase) ─────────────────────────────────
    const [attendance, setAttendance] = useState({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Fetch attendance for a specific course + date
    const fetchAttendance = async (courseId, date) => {
        setAttendanceLoading(true);
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('student_id, student_name, status')
                .eq('course_id', courseId)
                .eq('date', date);
            if (error) throw error;
            // Store as { courseId: { date: [records] } }
            const records = (data || []).map(r => ({
                studentId: r.student_id,
                name: r.student_name,
                status: r.status,
            }));
            setAttendance(prev => ({
                ...prev,
                [courseId]: {
                    ...(prev[courseId] || {}),
                    [date]: records,
                },
            }));
            return records;
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            return [];
        } finally {
            setAttendanceLoading(false);
        }
    };

    // Save attendance — upsert all records for a course + date
    const saveAttendance = async (courseId, date, records) => {
        try {
            // Build upsert rows
            const rows = records.map(r => ({
                course_id: courseId,
                student_id: r.studentId,
                student_name: r.name,
                date,
                status: r.status,
            }));

            const { error } = await supabase
                .from('attendance')
                .upsert(rows, { onConflict: 'course_id,student_id,date' });
            if (error) throw error;

            // Update local state
            setAttendance(prev => ({
                ...prev,
                [courseId]: {
                    ...(prev[courseId] || {}),
                    [date]: records,
                },
            }));
            return { success: true };
        } catch (err) {
            console.error('Failed to save attendance:', err);
            return { success: false, error: err.message };
        }
    };

    // ── Notes (localStorage for now) ─────────────────────────
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('teacher_notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = (courseId, file) => {
        setNotes(prev => {
            const courseNotes = prev[courseId] || [];
            return { ...prev, [courseId]: [...courseNotes, { ...file, id: Date.now() }] };
        });
    };

    const deleteNote = (courseId, noteId) => {
        setNotes(prev => {
            const courseNotes = prev[courseId] || [];
            return { ...prev, [courseId]: courseNotes.filter(n => n.id !== noteId) };
        });
    };

    const value = {
        courses, coursesLoading, fetchCourses,
        addCourse, updateCourse, deleteCourse,
        students,
        attendance, attendanceLoading, fetchAttendance, saveAttendance,
        notes, addNote, deleteNote,
    };

    return (
        <TeacherContext.Provider value={value}>
            {children}
        </TeacherContext.Provider>
    );
};
