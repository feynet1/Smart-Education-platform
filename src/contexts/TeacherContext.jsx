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

    // ── Class Sessions ────────────────────────────────────────
    const [activeSession, setActiveSession] = useState(null);
    const [sessionAttendance, setSessionAttendance] = useState([]);

    // Check if there's already an open session for a course
    const fetchActiveSession = async (courseId) => {
        try {
            const { data, error } = await supabase
                .from('class_sessions')
                .select('*')
                .eq('course_id', courseId)
                .eq('status', 'open')
                .single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            setActiveSession(data || null);
            if (data) fetchSessionAttendance(data.id);
        } catch (err) {
            console.error('Failed to fetch active session:', err);
        }
    };

    // Fetch attendance for a session
    const fetchSessionAttendance = async (sessionId) => {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('session_id', sessionId);
            if (error) throw error;
            setSessionAttendance(data || []);
        } catch (err) {
            console.error('Failed to fetch session attendance:', err);
        }
    };

    // Start a new session
    const startSession = async (courseId) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        try {
            const { data, error } = await supabase
                .from('class_sessions')
                .insert({
                    course_id: courseId,
                    teacher_id: user.id,
                    date: new Date().toISOString().split('T')[0],
                    status: 'open',
                })
                .select()
                .single();
            if (error) throw error;
            setActiveSession(data);
            setSessionAttendance([]);
            return { success: true, session: data };
        } catch (err) {
            console.error('Failed to start session:', err);
            return { success: false, error: err.message };
        }
    };

    // End session — mark all enrolled students who haven't joined as Absent
    const endSession = async (courseId) => {
        if (!activeSession) return { success: false, error: 'No active session' };
        try {
            // Get all students
            const { data: allStudents } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('role', 'Student');

            // Find students who haven't joined
            const joinedIds = sessionAttendance.map(a => a.student_id);
            const absentStudents = (allStudents || []).filter(s => !joinedIds.includes(s.id));

            // Insert absent records
            if (absentStudents.length > 0) {
                const absentRows = absentStudents.map(s => ({
                    course_id: courseId,
                    session_id: activeSession.id,
                    student_id: s.id,
                    student_name: s.name || 'Unknown',
                    date: activeSession.date,
                    status: 'Absent',
                }));
                await supabase.from('attendance').upsert(absentRows, {
                    onConflict: 'course_id,student_id,date',
                });
            }

            // Close the session
            const { error } = await supabase
                .from('class_sessions')
                .update({ status: 'closed', closed_at: new Date().toISOString() })
                .eq('id', activeSession.id);
            if (error) throw error;

            setActiveSession(null);
            setSessionAttendance([]);
            return { success: true };
        } catch (err) {
            console.error('Failed to end session:', err);
            return { success: false, error: err.message };
        }
    };

    // Update a student's status in the session
    const updateAttendanceStatus = async (attendanceId, status) => {
        try {
            const { error } = await supabase
                .from('attendance')
                .update({ status })
                .eq('id', attendanceId);
            if (error) throw error;
            setSessionAttendance(prev =>
                prev.map(a => a.id === attendanceId ? { ...a, status } : a)
            );
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Subscribe to realtime attendance updates for active session
    useEffect(() => {
        if (!activeSession?.id) return;
        const channel = supabase
            .channel(`session-${activeSession.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'attendance',
                filter: `session_id=eq.${activeSession.id}`,
            }, (payload) => {
                setSessionAttendance(prev => {
                    const exists = prev.find(a => a.id === payload.new.id);
                    return exists ? prev : [...prev, payload.new];
                });
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'attendance',
                filter: `session_id=eq.${activeSession.id}`,
            }, (payload) => {
                setSessionAttendance(prev =>
                    prev.map(a => a.id === payload.new.id ? payload.new : a)
                );
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [activeSession?.id]);
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

    // ── Notes (Supabase Storage) ──────────────────────────────
    const [notes, setNotes] = useState({});
    const [notesLoading, setNotesLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const fetchNotes = async (courseId) => {
        setNotesLoading(true);
        try {
            const { data, error } = await supabase
                .from('course_notes')
                .select('*')
                .eq('course_id', courseId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setNotes(prev => ({ ...prev, [courseId]: data || [] }));
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setNotesLoading(false);
        }
    };

    const addNote = async (courseId, file) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        const filePath = `${courseId}/${Date.now()}_${file.name}`;
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        try {
            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('course-notes')
                .upload(filePath, file, { upsert: false });
            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('course-notes')
                .getPublicUrl(filePath);

            // Save metadata to DB
            const { data, error: dbError } = await supabase
                .from('course_notes')
                .insert({
                    course_id: courseId,
                    teacher_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    file_type: file.type,
                })
                .select()
                .single();
            if (dbError) throw dbError;

            setNotes(prev => ({
                ...prev,
                [courseId]: [{ ...data, publicUrl: urlData.publicUrl }, ...(prev[courseId] || [])],
            }));
            setUploadProgress(prev => { const n = { ...prev }; delete n[file.name]; return n; });
            return { success: true };
        } catch (err) {
            console.error('Failed to upload note:', err);
            setUploadProgress(prev => { const n = { ...prev }; delete n[file.name]; return n; });
            return { success: false, error: err.message };
        }
    };

    const deleteNote = async (courseId, noteId) => {
        const note = (notes[courseId] || []).find(n => n.id === noteId);
        if (!note) return;
        // Optimistic remove
        setNotes(prev => ({ ...prev, [courseId]: (prev[courseId] || []).filter(n => n.id !== noteId) }));
        try {
            // Delete from storage
            await supabase.storage.from('course-notes').remove([note.file_path]);
            // Delete metadata
            await supabase.from('course_notes').delete().eq('id', noteId);
        } catch (err) {
            console.error('Failed to delete note:', err);
            // Rollback
            setNotes(prev => ({ ...prev, [courseId]: [...(prev[courseId] || []), note] }));
        }
    };

    const getNoteUrl = (filePath) => {
        const { data } = supabase.storage.from('course-notes').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const value = {
        courses, coursesLoading, fetchCourses,
        addCourse, updateCourse, deleteCourse,
        students,
        attendance, attendanceLoading, fetchAttendance, saveAttendance,
        activeSession, sessionAttendance,
        fetchActiveSession, startSession, endSession, updateAttendanceStatus,
        notes, notesLoading, uploadProgress, fetchNotes, addNote, deleteNote, getNoteUrl,
    };

    return (
        <TeacherContext.Provider value={value}>
            {children}
        </TeacherContext.Provider>
    );
};
