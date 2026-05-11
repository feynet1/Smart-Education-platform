/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { DEFAULT_MAX_MARKS } from '../utils/gradeUtils';

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
            addTeacherLog('Created course', mapped.name);
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
            addTeacherLog('Deleted course', courses.find(c => c.id === id)?.name || id);
            return { success: true };
        } catch (err) {
            console.error('Failed to delete course:', err);
            await fetchCourses(); // Rollback
            return { success: false, error: err.message };
        }
    };

    // ── Enrolled Students per course ─────────────────────────
    // { courseId: [{ id, name, email }] }
    const [enrolledStudents, setEnrolledStudents] = useState({});
    const [enrolledLoading, setEnrolledLoading] = useState({});

    const fetchEnrolledStudents = async (courseId) => {
        setEnrolledLoading(prev => ({ ...prev, [courseId]: true }));
        try {
            // Step 1: get student IDs enrolled in this course
            const { data: enrollData, error: enrollErr } = await supabase
                .from('enrollments')
                .select('student_id')
                .eq('course_id', courseId);
            if (enrollErr) throw enrollErr;
            if (!enrollData || enrollData.length === 0) {
                setEnrolledStudents(prev => ({ ...prev, [courseId]: [] }));
                return [];
            }
            // Step 2: fetch profiles for those student IDs
            const studentIds = enrollData.map(e => e.student_id);
            const { data: profileData, error: profileErr } = await supabase
                .from('profiles')
                .select('id, name, email')
                .in('id', studentIds);
            if (profileErr) throw profileErr;
            const list = (profileData || []).map(p => ({
                id:    p.id,
                name:  p.name || p.email?.split('@')[0] || 'Unknown',
                email: p.email || '',
            }));
            setEnrolledStudents(prev => ({ ...prev, [courseId]: list }));
            return list;
        } catch (err) {
            console.error('Failed to fetch enrolled students:', err);
            return [];
        } finally {
            setEnrolledLoading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    // Keep a flat list of all students enrolled in any of this teacher's courses
    // Used for grade entry student selector
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (courses.length === 0) return;
        const fetchAllEnrolled = async () => {
            try {
                const courseIds = courses.map(c => c.id);
                // Step 1: get all student IDs enrolled in teacher's courses
                const { data: enrollData, error: enrollErr } = await supabase
                    .from('enrollments')
                    .select('student_id')
                    .in('course_id', courseIds);
                if (enrollErr) throw enrollErr;
                if (!enrollData || enrollData.length === 0) { setStudents([]); return; }
                // Step 2: fetch profiles for those student IDs (deduplicated)
                const uniqueIds = [...new Set(enrollData.map(e => e.student_id))];
                const { data: profileData, error: profileErr } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .in('id', uniqueIds);
                if (profileErr) throw profileErr;
                setStudents((profileData || []).map(p => ({
                    id:    p.id,
                    name:  p.name || p.email?.split('@')[0] || 'Unknown',
                    email: p.email || '',
                })));
            } catch (err) {
                console.error('Failed to fetch enrolled students:', err);
            }
        };
        fetchAllEnrolled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses.length]);

    // ── Teacher Activity Logs ─────────────────────────────────
    const [teacherLogs, setTeacherLogs] = useState([]);

    const fetchTeacherLogs = async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('teacher_activity_logs')
                .select('*')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) throw error;
            setTeacherLogs(data || []);
        } catch (err) {
            console.error('Failed to fetch teacher logs:', err);
        }
    };

    useEffect(() => {
        if (user?.id) fetchTeacherLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const addTeacherLog = async (action, detail = '') => {
        if (!user?.id) return;
        const optimistic = { id: Date.now().toString(), teacher_id: user.id, action, detail, created_at: new Date().toISOString() };
        setTeacherLogs(prev => [optimistic, ...prev].slice(0, 10));
        try {
            await supabase.from('teacher_activity_logs').insert({ teacher_id: user.id, action, detail });
        } catch (err) {
            console.error('Failed to log activity:', err);
        }
    };

    const deleteTeacherLog = async (logId) => {
        setTeacherLogs(prev => prev.filter(l => l.id !== logId));
        try {
            await supabase.from('teacher_activity_logs').delete().eq('id', logId);
        } catch (err) {
            console.error('Failed to delete log:', err);
        }
    };
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
            addTeacherLog('Started session', courses.find(c => c.id === courseId)?.name || courseId);
            return { success: true, session: data };
        } catch (err) {
            console.error('Failed to start session:', err);
            return { success: false, error: err.message };
        }
    };

    // End session — mark enrolled students who haven't joined as Absent
    const endSession = async (courseId) => {
        if (!activeSession) return { success: false, error: 'No active session' };
        try {
            // Get only students enrolled in this specific course
            const enrolled = enrolledStudents[courseId] || await fetchEnrolledStudents(courseId);

            // Find enrolled students who haven't joined
            const joinedIds = sessionAttendance.map(a => a.student_id);
            const absentStudents = enrolled.filter(s => !joinedIds.includes(s.id));

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
            addTeacherLog('Ended session', courses.find(c => c.id === courseId)?.name || courseId);
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
            addTeacherLog('Saved attendance', `${date}`);
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
            addTeacherLog('Uploaded file', file.name);
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
            addTeacherLog('Deleted file', note.file_name);
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

    // ── Grades (Supabase) ─────────────────────────────────────
    const [grades, setGrades] = useState({});          // { courseId: [grade rows] }
    const [gradesLoading, setGradesLoading] = useState({}); // { courseId: boolean }

    // ── Course Weights ────────────────────────────────────────
    const [courseWeights, setCourseWeights] = useState({}); // { courseId: weights }

    const fetchWeights = async (courseId) => {
        try {
            const { data, error } = await supabase
                .from('course_weights')
                .select('*')
                .eq('course_id', courseId)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                setCourseWeights(prev => ({ ...prev, [courseId]: data }));
            }
            return data || null;
        } catch (err) {
            console.error('Failed to fetch weights:', err);
            return null;
        }
    };

    const saveWeights = async (courseId, weights, maxMarks) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        try {
            const row = {
                course_id:  courseId,
                ...weights,
                hw_max:     maxMarks?.homework   ?? DEFAULT_MAX_MARKS.homework,
                assign_max: maxMarks?.assignment ?? DEFAULT_MAX_MARKS.assignment,
                quiz_max:   maxMarks?.quiz       ?? DEFAULT_MAX_MARKS.quiz,
                mid_max:    maxMarks?.midterm    ?? DEFAULT_MAX_MARKS.midterm,
                proj_max:   maxMarks?.project    ?? DEFAULT_MAX_MARKS.project,
                final_max:  maxMarks?.final_exam ?? DEFAULT_MAX_MARKS.final_exam,
                updated_at: new Date().toISOString(),
            };
            const { data, error } = await supabase
                .from('course_weights')
                .upsert(row, { onConflict: 'course_id' })
                .select()
                .single();
            if (error) throw error;
            setCourseWeights(prev => ({ ...prev, [courseId]: data }));
            return { success: true };
        } catch (err) {
            console.error('Failed to save weights:', err);
            return { success: false, error: err.message };
        }
    };

    // ── Grade Entries ─────────────────────────────────────────
    // { courseId: { studentId: { category: entry } } }
    const [gradeEntries, setGradeEntries] = useState({});

    const fetchGradeEntries = async (courseId) => {
        setGradesLoading(prev => ({ ...prev, [courseId]: true }));
        try {
            const { data, error } = await supabase
                .from('grade_entries')
                .select('*')
                .eq('course_id', courseId);
            if (error) throw error;
            // Build nested map: { studentId: { category: entry } }
            const map = {};
            (data || []).forEach(e => {
                if (!map[e.student_id]) map[e.student_id] = { name: e.student_name };
                map[e.student_id][e.category] = e;
            });
            setGradeEntries(prev => ({ ...prev, [courseId]: map }));
            return map;
        } catch (err) {
            console.error('Failed to fetch grade entries:', err);
            return {};
        } finally {
            setGradesLoading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const saveGradeEntry = async ({ courseId, studentId, studentName, category, score, feedback }) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        try {
            const row = {
                course_id:    courseId,
                teacher_id:   user.id,
                student_id:   studentId,
                student_name: studentName,
                category,
                score:        parseFloat(score),
                feedback:     feedback || null,
                graded_at:    new Date().toISOString().split('T')[0],
            };
            const { data, error } = await supabase
                .from('grade_entries')
                .upsert(row, { onConflict: 'course_id,student_id,category' })
                .select()
                .single();
            if (error) throw error;
            // Update local cache
            setGradeEntries(prev => {
                const courseMap = { ...(prev[courseId] || {}) };
                if (!courseMap[studentId]) courseMap[studentId] = { name: studentName };
                courseMap[studentId] = { ...courseMap[studentId], [category]: data };
                return { ...prev, [courseId]: courseMap };
            });
            return { success: true, entry: data };
        } catch (err) {
            console.error('Failed to save grade entry:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteGradeEntry = async (courseId, studentId, category) => {
        // Optimistic remove
        setGradeEntries(prev => {
            const courseMap = { ...(prev[courseId] || {}) };
            if (courseMap[studentId]) {
                const studentMap = { ...courseMap[studentId] };
                delete studentMap[category];
                courseMap[studentId] = studentMap;
            }
            return { ...prev, [courseId]: courseMap };
        });
        try {
            const { error } = await supabase
                .from('grade_entries')
                .delete()
                .eq('course_id', courseId)
                .eq('student_id', studentId)
                .eq('category', category);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Failed to delete grade entry:', err);
            await fetchGradeEntries(courseId);
            return { success: false, error: err.message };
        }
    };

    // Keep old grades/saveGrade/deleteGrade for backward compat
    const fetchGrades = fetchGradeEntries;

    const saveGrade = async (gradeData) => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        try {
            const row = {
                course_id:    gradeData.courseId,
                teacher_id:   user.id,
                student_id:   gradeData.studentId,
                student_name: gradeData.studentName,
                subject:      gradeData.subject,
                assessment:   gradeData.assessment,
                score:        gradeData.score,
                grade:        gradeData.grade,
                feedback:     gradeData.feedback || null,
                graded_at:    gradeData.gradedAt || new Date().toISOString().split('T')[0],
            };
            const { data, error } = await supabase
                .from('grades')
                .upsert(row, { onConflict: 'course_id,student_id,assessment' })
                .select()
                .single();
            if (error) throw error;
            setGrades(prev => {
                const existing = prev[gradeData.courseId] || [];
                const idx = existing.findIndex(g => g.id === data.id);
                const updated = idx >= 0
                    ? existing.map(g => g.id === data.id ? data : g)
                    : [data, ...existing];
                return { ...prev, [gradeData.courseId]: updated };
            });
            addTeacherLog('Graded student', `${gradeData.studentName} — ${gradeData.assessment}`);
            return { success: true, grade: data };
        } catch (err) {
            console.error('Failed to save grade:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteGrade = async (courseId, gradeId) => {
        setGrades(prev => ({
            ...prev,
            [courseId]: (prev[courseId] || []).filter(g => g.id !== gradeId),
        }));
        try {
            const { error } = await supabase.from('grades').delete().eq('id', gradeId);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Failed to delete grade:', err);
            await fetchGradeEntries(courseId);
            return { success: false, error: err.message };
        }
    };

    const value = {
        courses, coursesLoading, fetchCourses,
        addCourse, updateCourse, deleteCourse,
        students, enrolledStudents, enrolledLoading, fetchEnrolledStudents,
        attendance, attendanceLoading, fetchAttendance, saveAttendance,
        activeSession, sessionAttendance,
        fetchActiveSession, startSession, endSession, updateAttendanceStatus,
        notes, notesLoading, uploadProgress, fetchNotes, addNote, deleteNote, getNoteUrl,
        // Weighted grade entries (new system)
        gradeEntries, gradesLoading, courseWeights,
        fetchGradeEntries, saveGradeEntry, deleteGradeEntry,
        fetchWeights, saveWeights,
        // Legacy grade functions (kept for backward compat)
        grades, fetchGrades, saveGrade, deleteGrade,
        teacherLogs, fetchTeacherLogs, deleteTeacherLog,
    };

    return (
        <TeacherContext.Provider value={value}>
            {children}
        </TeacherContext.Provider>
    );
};
