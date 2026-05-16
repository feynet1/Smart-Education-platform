/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { scoreToGrade, DEFAULT_WEIGHTS, DEFAULT_MAX_MARKS } from '../utils/gradeUtils';
import useAuth from '../hooks/useAuth';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const { profile } = useAuth();
    const currentUserRole = profile?.role;
    const currentUserBranchId = profile?.branch_id;

    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [activeBranchFilter, setActiveBranchFilter] = useState(null);

    const applyBranchFilter = (query) => {
        if (currentUserRole === 'Admin') {
            return query.eq('branch_id', currentUserBranchId);
        } else if (currentUserRole === 'Super Admin' && activeBranchFilter) {
            return query.eq('branch_id', activeBranchFilter);
        }
        return query;
    };

    const fetchBranches = async () => {
        setBranchesLoading(true);
        try {
            const { data, error } = await supabase.from('branches').select('*').order('name');
            if (error) throw error;
            setBranches(data || []);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setBranchesLoading(false);
        }
    };
    useEffect(() => { fetchBranches(); }, [currentUserRole]);

    const addBranch = async (branchData) => {
        try {
            const { data, error } = await supabase.from('branches').insert({
                ...branchData,
                created_by: profile?.id
            }).select().single();
            if (error) throw error;
            setBranches(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateBranch = async (id, branchData) => {
        try {
            const { error } = await supabase.from('branches').update(branchData).eq('id', id);
            if (error) throw error;
            setBranches(prev => prev.map(b => b.id === id ? { ...b, ...branchData } : b));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const deleteBranch = async (id) => {
        try {
            const { error } = await supabase.from('branches').delete().eq('id', id);
            if (error) throw error;
            setBranches(prev => prev.filter(b => b.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const getTeacherNotes = () => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {};
    };
    const getStudentEnrollments = () => {
        const saved = localStorage.getItem('student_enrollments');
        return saved ? JSON.parse(saved) : [];
    };

    // ── Attendance (Supabase) ─────────────────────────────────
    const [adminAttendance, setAdminAttendance] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const fetchAdminAttendance = async () => {
        setAttendanceLoading(true);
        try {
            let query = supabase
                .from('attendance')
                .select('id, course_id, student_id, student_name, date, status, session_id, branch_id')
                .order('date', { ascending: false });
            query = applyBranchFilter(query);
            const { data, error } = await query;
            if (error) throw error;
            setAdminAttendance(data || []);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAdminAttendance(); }, [currentUserRole, currentUserBranchId, activeBranchFilter]);

    // ── Grades (Supabase grade_entries) ──────────────────────
    const [adminGrades, setAdminGrades] = useState([]);
    const [adminGradesLoading, setAdminGradesLoading] = useState(false);

    const fetchAdminGrades = async () => {
        setAdminGradesLoading(true);
        try {
            let entriesQuery = supabase.from('grade_entries').select('*').order('created_at', { ascending: false });
            entriesQuery = applyBranchFilter(entriesQuery);

            // Fetch all grade entries + course weights in parallel
            const [{ data: entries, error: entriesErr }, { data: weightsData, error: weightsErr }] =
                await Promise.all([
                    entriesQuery,
                    supabase.from('course_weights').select('*'),
                ]);
            if (entriesErr) throw entriesErr;
            if (weightsErr) throw weightsErr;

            // Build weights map: courseId → weights row
            const weightsMap = {};
            (weightsData || []).forEach(w => { weightsMap[w.course_id] = w; });

            // Group entries by (course_id, student_id)
            const studentCourseMap = {};
            (entries || []).forEach(e => {
                const key = `${e.course_id}__${e.student_id}`;
                if (!studentCourseMap[key]) {
                    studentCourseMap[key] = {
                        courseId:    e.course_id,
                        studentId:   e.student_id,
                        studentName: e.student_name,
                        entries:     {},
                        latestDate:  e.graded_at,
                    };
                }
                studentCourseMap[key].entries[e.category] = parseFloat(e.score);
                if (e.graded_at > studentCourseMap[key].latestDate) {
                    studentCourseMap[key].latestDate = e.graded_at;
                }
            });

            // Compute weighted total using raw marks + max marks
            const gradeRows = Object.values(studentCourseMap).map(sc => {
                const w = weightsMap[sc.courseId];

                // Max marks per category (from course_weights or defaults)
                const maxMarks = {
                    homework:   w?.hw_max     ?? DEFAULT_MAX_MARKS.homework,
                    assignment: w?.assign_max ?? DEFAULT_MAX_MARKS.assignment,
                    quiz:       w?.quiz_max   ?? DEFAULT_MAX_MARKS.quiz,
                    midterm:    w?.mid_max    ?? DEFAULT_MAX_MARKS.midterm,
                    project:    w?.proj_max   ?? DEFAULT_MAX_MARKS.project,
                    final_exam: w?.final_max  ?? DEFAULT_MAX_MARKS.final_exam,
                };

                // Weighted contribution: (raw/max * 100) * weight / 100
                let weightedSum = 0;
                Object.entries(sc.entries).forEach(([cat, raw]) => {
                    const weight = w?.[cat] ?? DEFAULT_WEIGHTS[cat] ?? 0;
                    const max    = maxMarks[cat] ?? 1;
                    const pct    = Math.min((raw / max) * 100, 100);
                    weightedSum += (pct * weight) / 100;
                });

                const total  = Math.min(parseFloat(weightedSum.toFixed(2)), 100);
                const letter = scoreToGrade(total);

                // Build display entries: show raw/max for each category
                const displayEntries = {};
                Object.entries(sc.entries).forEach(([cat, raw]) => {
                    displayEntries[cat] = { raw, max: maxMarks[cat] };
                });

                return {
                    id:             `${sc.courseId}-${sc.studentId}`,
                    courseId:       sc.courseId,
                    studentName:    sc.studentName,
                    entries:        displayEntries,
                    score:          total,
                    grade:          letter,
                    date:           sc.latestDate,
                };
            }).sort((a, b) => b.score - a.score);

            setAdminGrades(gradeRows);
        } catch (err) {
            console.error('Failed to fetch grades:', err);
        } finally {
            setAdminGradesLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAdminGrades(); }, [currentUserRole, currentUserBranchId, activeBranchFilter]);

    // ── Users (Supabase profiles) ─────────────────────────────
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('id, name, email, role, phone, status, grade, created_at, branch_id')
                .order('created_at', { ascending: false });
            query = applyBranchFilter(query);
            const { data, error } = await query;
            if (error) throw error;
            setUsers((data || []).map(u => ({
                id: u.id,
                name: u.name || u.email?.split('@')[0] || 'Unknown',
                email: u.email,
                role: u.role || 'Student',
                branch_id: u.branch_id,
                phone: u.phone || '—',
                grade: u.grade || '—',
                // Fall back to 'active' if status column does not exist yet
                status: u.status || 'active',
                createdAt: new Date(u.created_at).toISOString().split('T')[0],
            })));
        } catch (err) {
            console.error('Failed to fetch users from profiles:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    // ── Courses (Supabase) ────────────────────────────────────
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            let coursesQuery = supabase.from('courses').select('*').order('created_at', { ascending: false });
            coursesQuery = applyBranchFilter(coursesQuery);

            // Fetch courses, teacher profiles, and enrollment counts in parallel
            const [{ data: coursesData, error: coursesErr }, { data: profilesData, error: profilesErr },
                   { data: enrollData }] =
                await Promise.all([
                    coursesQuery,
                    supabase.from('profiles').select('id, name').eq('role', 'Teacher'),
                    supabase.from('enrollments').select('course_id'),
                ]);

            if (coursesErr) throw coursesErr;
            if (profilesErr) throw profilesErr;
            // enrollErr is non-fatal — table may not exist yet

            // Build teacher name lookup
            const teacherMap = {};
            (profilesData || []).forEach(p => { teacherMap[p.id] = p.name || '—'; });

            // Build enrollment count lookup: { courseId: count }
            const enrollMap = {};
            (enrollData || []).forEach(e => {
                enrollMap[e.course_id] = (enrollMap[e.course_id] || 0) + 1;
            });

            setCourses((coursesData || []).map(c => ({
                id:          c.id,
                name:        c.name,
                subject:     c.subject,
                grade:       c.grade,
                description: c.description,
                joinCode:    c.join_code,
                teacherId:   c.teacher_id,
                branchId:    c.branch_id,
                teacherName: teacherMap[c.teacher_id] || '—',
                createdAt:   c.created_at,
                students:    enrollMap[c.id] || 0,
            })));
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setCoursesLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchCourses(); }, [currentUserRole, currentUserBranchId, activeBranchFilter]);

    const deleteCourse = async (courseId) => {
        const course = courses.find(c => c.id === courseId);
        setCourses(prev => prev.filter(c => c.id !== courseId));
        try {
            const { error } = await supabase.from('courses').delete().eq('id', courseId);
            if (error) throw error;
            addLog(`Deleted course: ${course?.name ?? courseId}`, 'Admin');
            return { success: true };
        } catch (err) {
            console.error('Failed to delete course:', err);
            setCourses(prev => [...prev, course].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            return { success: false, error: err.message };
        }
    };

    // Clear any stale mock user data from localStorage and load real users
    useEffect(() => {
        localStorage.removeItem('admin_users');
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserRole, currentUserBranchId, activeBranchFilter]); 

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    // Fetch events from Supabase
    const fetchEvents = async () => {
        setEventsLoading(true);
        try {
            let query = supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            
            if (currentUserRole === 'Admin') {
                query = query.or(`branch_id.eq.${currentUserBranchId},branch_id.is.null`);
            } else if (currentUserRole === 'Super Admin' && activeBranchFilter) {
                query = query.eq('branch_id', activeBranchFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setEventsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchEvents(); }, [currentUserRole, currentUserBranchId, activeBranchFilter]);

    const [systemLogs, setSystemLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Fetch activity logs from Supabase
    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('id, action, user, created_at')
                .order('created_at', { ascending: false })
                .limit(200);
            if (error) throw error;
            const mapped = (data || []).map(row => ({
                id: row.id,
                action: row.action,
                user: row.user,
                timestamp: new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19),
            }));
            setSystemLogs(mapped);
        } catch (err) {
            console.error('Failed to fetch activity logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const [settings, setSettings] = useState({
        registrationEnabled: false,
        academicYear: '2025-2026',
        semesterName: 'Spring 2026',
        maintenanceMode: false,
    });

    // Load settings from Supabase on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('platform_settings')
                    .select('key, value');
                if (error) throw error;
                if (data?.length) {
                    const merged = {};
                    data.forEach(row => {
                        // jsonb returns values as JS types directly
                        merged[row.key] = row.value;
                    });
                    setSettings(prev => ({ ...prev, ...merged }));
                }
            } catch (err) {
                console.error('Failed to fetch platform settings:', err);
            }
        };
        fetchSettings();
    }, []);

    // (users are fetched on mount via fetchUsers above)

    // (events are now stored in Supabase, not localStorage)

    const stats = {
        totalStudents: users.filter(u => u.role === 'Student').length,
        totalTeachers: users.filter(u => u.role === 'Teacher').length,
        totalCourses:  courses.length,
        activeClasses: courses.length,
    };

    const addLog = async (action, user) => {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const optimistic = { id: Date.now(), action, user, timestamp };
        setSystemLogs(prev => [optimistic, ...prev].slice(0, 200));
        try {
            await supabase.from('activity_logs').insert({ action, user });
        } catch (err) {
            console.error('Failed to persist log:', err);
        }
    };

    // Update role, name, and branch — syncs to profiles table
    const updateUserRole = async (userId, newRole, newName, newBranchId, newGrade) => {
        const user = users.find(u => u.id === userId);
        const prevRole = user?.role;
        const prevName = user?.name;
        const prevBranchId = user?.branch_id;
        const prevGrade = user?.grade;

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId
            ? { ...u, role: newRole, name: newName || u.name, branch_id: newBranchId !== undefined ? newBranchId : u.branch_id, grade: newGrade !== undefined ? newGrade : u.grade }
            : u
        ));
        addLog(`Updated user: role=${newRole}${newName ? `, name=${newName}` : ''}`, 'Admin');

        try {
            const updates = { role: newRole };
            if (newName) updates.name = newName;
            if (newBranchId !== undefined) updates.branch_id = newBranchId || null;
            if (newGrade !== undefined) updates.grade = newGrade || null;
            
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);
            if (error) throw error;

            // Also sync to auth user_metadata via edge function
            await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'update-role', payload: { userId, role: newRole, name: newName || prevName, branch_id: newBranchId !== undefined ? newBranchId || null : prevBranchId, grade: newGrade !== undefined ? newGrade || null : prevGrade } }
            });
            return { success: true };
        } catch (err) {
            // Rollback
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: prevRole, name: prevName, branch_id: prevBranchId, grade: prevGrade } : u));
            return { success: false, error: `Failed to update user: ${err.message}` };
        }
    };

    // Toggle status — persists to profiles table AND bans/unbans in auth
    const toggleUserStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return { success: false };
        const newStatus = user.status === 'active' ? 'inactive' : 'active';

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        addLog(`${newStatus === 'inactive' ? 'Deactivated' : 'Activated'} user: ${user.name}`, 'Admin');

        try {
            // 1. Persist status to profiles table
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);
            if (profileErr) throw profileErr;

            // 2. Ban/unban in Supabase Auth via edge function
            await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'update-status', payload: { userId, status: newStatus } }
            });

            return { success: true };
        } catch (err) {
            // Rollback
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: user.status } : u));
            return { success: false, error: `Failed to update status: ${err.message}` };
        }
    };

    // Add user — sends invite email, user sets their own password via the invite link
    const addUser = async (userData) => {
        try {
            const redirectTo = `${window.location.origin}/accept-invite`;
            const { data, error } = await supabase.functions.invoke('admin-user-manager', {
                body: {
                    action: 'invite',
                    payload: { email: userData.email, name: userData.name, role: userData.role, branch_id: userData.branch_id, grade: userData.grade, redirectTo }
                }
            });
            if (error) {
                // Extract real error message from edge function response body
                let msg = error.message || 'Unknown error';
                try {
                    const context = await error.context?.json?.();
                    if (context?.error) msg = context.error;
                } catch { /* ignore */ }
                throw new Error(msg);
            }

            const newUser = {
                id: data.user.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                branch_id: userData.branch_id || null,
                grade: userData.grade || '—',
                status: 'invited',
                createdAt: new Date().toISOString().split('T')[0]
            };
            setUsers(prev => [newUser, ...prev]);
            addLog(`Invited new user: ${userData.name}`, 'Admin');
            return { success: true };
        } catch (err) {
            const msg = err.message || 'Unknown error';
            console.error('[addUser] invite failed:', msg);
            return { success: false, error: msg };
        }
    };

    // Delete user — removes from Supabase for real users
    const deleteUser = async (userId) => {
        const isRealUser = String(userId).includes('-');
        const user = users.find(u => u.id === userId);

        if (!isRealUser) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            addLog(`Deleted local mock user: ${user?.name ?? userId}`, 'Admin');
            return { success: true };
        }

        try {
            const { error } = await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'delete', payload: { userId } }
            });
            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== userId));
            addLog(`Deleted user: ${user?.name ?? userId}`, 'Admin');
            return { success: true };
        } catch (err) {
            const msg = err.message || 'Unknown error';
            return { success: false, error: msg };
        }
    };

    const addEvent = async (event) => {
        try {
            const newEvent = { 
                title: event.title, date: event.date, type: event.type, 
                target: event.target, description: event.description || null 
            };
            if (currentUserRole === 'Admin') {
                newEvent.branch_id = currentUserBranchId;
            } else if (currentUserRole === 'Super Admin') {
                if ('branch_id' in event) {
                    newEvent.branch_id = event.branch_id || null;
                } else if (activeBranchFilter) {
                    newEvent.branch_id = activeBranchFilter;
                }
            }

            const { data, error } = await supabase
                .from('events')
                .insert(newEvent)
                .select()
                .single();
            if (error) throw error;
            setEvents(prev => [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
            addLog(`Created event: ${event.title}`, 'Admin');
            return { success: true };
        } catch (err) {
            console.error('Failed to create event:', err);
            return { success: false, error: err.message };
        }
    };

    const updateEvent = async (eventId, updates) => {
        const prev = events.find(e => e.id === eventId);
        setEvents(evts => evts.map(e => e.id === eventId ? { ...e, ...updates } : e));
        try {
            const { error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', eventId);
            if (error) throw error;
            addLog(`Updated event: ${updates.title || prev?.title}`, 'Admin');
            return { success: true };
        } catch (err) {
            setEvents(evts => evts.map(e => e.id === eventId ? prev : e));
            return { success: false, error: err.message };
        }
    };

    const deleteEvent = async (eventId) => {
        const event = events.find(e => e.id === eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
        try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            addLog(`Deleted event: ${event?.title}`, 'Admin');
            return { success: true };
        } catch (err) {
            setEvents(prev => [...prev, event].sort((a, b) => new Date(a.date) - new Date(b.date)));
            return { success: false, error: err.message };
        }
    };

    // ── Danger Zone ──────────────────────────────────────────

    // Clear all activity logs from Supabase
    const clearAllLogs = async () => {
        try {
            const { error } = await supabase.from('activity_logs').delete().neq('id', 0);
            if (error) throw error;
            setSystemLogs([]);
            return { success: true };
        } catch (err) {
            console.error('Failed to clear logs:', err);
            return { success: false, error: err.message };
        }
    };

    // Reset all platform data: logs, events, attendance, notes, grades, enrollments
    const resetAllData = async () => {
        try {
            // Clear Supabase logs
            const { error } = await supabase.from('activity_logs').delete().neq('id', 0);
            if (error) throw error;

            // Clear remaining localStorage data (legacy keys)
            const keys = [
                'admin_events', 'teacher_attendance',
                'teacher_notes', 'student_grades', 'student_enrollments',
            ];
            keys.forEach(k => localStorage.removeItem(k));

            // Reset state
            setSystemLogs([]);
            setEvents([]);
            return { success: true };
        } catch (err) {
            console.error('Failed to reset data:', err);
            return { success: false, error: err.message };
        }
    };

    // Export all logs as a downloadable JSON
    const exportDatabase = async () => {
        try {
            const { data: logs, error: logsErr } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (logsErr) throw logsErr;

            const { data: settingsData, error: settingsErr } = await supabase
                .from('platform_settings')
                .select('*');
            if (settingsErr) throw settingsErr;

            const { data: coursesData, error: coursesErr } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });
            if (coursesErr) throw coursesErr;

            const exportData = {
                exported_at: new Date().toISOString(),
                platform_settings: settingsData,
                activity_logs: logs,
                courses: coursesData,
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eduplatform_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            return { success: true };
        } catch (err) {
            console.error('Failed to export database:', err);
            return { success: false, error: err.message };
        }
    };
    const updateSettings = async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        addLog('Updated platform settings', 'Admin');
        try {
            const upserts = Object.entries(newSettings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));
            const { error } = await supabase
                .from('platform_settings')
                .upsert(upserts, { onConflict: 'key' });
            if (error) {
                console.error('Supabase settings upsert error:', error);
                throw error;
            }
            console.log('[settings] saved to Supabase:', newSettings);
            return { success: true };
        } catch (err) {
            console.error('Failed to save settings to Supabase:', err.message);
            return { success: false, error: err.message };
        }
    };

    const sendNotification = async (userId, title, message, type = 'info', link = null) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{ user_id: userId, title, message, type, link }]);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Failed to send notification:', err);
            return { success: false, error: err.message };
        }
    };

    const broadcastNotification = async (title, message, type = 'info', link = null, targetRole = 'all') => {
        try {
            let targetUsers = users;
            if (targetRole !== 'all') {
                targetUsers = users.filter(u => u.role.toLowerCase() === targetRole.toLowerCase());
            }
            
            const inserts = targetUsers.map(u => ({
                user_id: u.id,
                title,
                message,
                type,
                link
            }));

            if (inserts.length === 0) return { success: true };

            const { error } = await supabase
                .from('notifications')
                .insert(inserts);
            
            if (error) throw error;
            addLog(`Broadcasted notification: ${title} to ${targetRole}`, 'Admin');
            return { success: true };
        } catch (err) {
            console.error('Failed to broadcast notification:', err);
            return { success: false, error: err.message };
        }
    };

    const value = {
        users, usersLoading, fetchUsers,
        events, eventsLoading, systemLogs, logsLoading, settings, stats,
        courses, coursesLoading, fetchCourses, deleteCourse,
        grades: adminGrades, gradesLoading: adminGradesLoading, fetchAdminGrades,
        attendance: adminAttendance, attendanceLoading, fetchAdminAttendance,
        notes: getTeacherNotes(),
        enrollments: getStudentEnrollments(),
        updateUserRole, toggleUserStatus, addUser, deleteUser,
        addEvent, updateEvent, deleteEvent, updateSettings, addLog, fetchLogs,
        clearAllLogs, resetAllData, exportDatabase,
        branches, branchesLoading, fetchBranches, addBranch, updateBranch, deleteBranch,
        activeBranchFilter, setActiveBranchFilter, currentUserBranchId, currentUserRole,
        sendNotification, broadcastNotification
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
