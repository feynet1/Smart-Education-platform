/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const getTeacherCourses = () => {
        const saved = localStorage.getItem('teacher_courses');
        return saved ? JSON.parse(saved) : [];
    };
    const getTeacherAttendance = () => {
        const saved = localStorage.getItem('teacher_attendance');
        return saved ? JSON.parse(saved) : {};
    };
    const getTeacherNotes = () => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {};
    };
    const getStudentGrades = () => {
        const saved = localStorage.getItem('student_grades');
        return saved ? JSON.parse(saved) : [];
    };
    const getStudentEnrollments = () => {
        const saved = localStorage.getItem('student_enrollments');
        return saved ? JSON.parse(saved) : [];
    };

    // Start empty — will be populated from Supabase only
    const [users, setUsers] = useState([]);

    // Clear any stale mock user data from localStorage
    useEffect(() => {
        localStorage.removeItem('admin_users');
    }, []);

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    // Fetch events from Supabase
    const fetchEvents = async () => {
        setEventsLoading(true);
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

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

    // Fetch users from profiles table — single source of truth
    useEffect(() => {
        const fetchRealUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, email, role, phone, created_at');
                if (error) throw error;
                if (data) {
                    const mappedUsers = data.map(u => ({
                        id: u.id,
                        name: u.name || u.email?.split('@')[0] || 'Unknown',
                        email: u.email,
                        role: u.role || 'Student',
                        phone: u.phone || '—',
                        status: 'active',
                        createdAt: new Date(u.created_at).toISOString().split('T')[0]
                    }));
                    setUsers(mappedUsers);
                }
            } catch (err) {
                console.error('Failed to fetch users from profiles:', err);
            }
        };
        fetchRealUsers();
    }, []);

    // (events are now stored in Supabase, not localStorage)

    const stats = {
        totalStudents: users.filter(u => u.role === 'Student').length,
        totalTeachers: users.filter(u => u.role === 'Teacher').length,
        totalCourses:  getTeacherCourses().length,
        activeClasses: getTeacherCourses().length,
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

    // Update role & name — syncs to profiles table
    const updateUserRole = async (userId, newRole, newName) => {
        const user = users.find(u => u.id === userId);
        const prevRole = user?.role;
        const prevName = user?.name;

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId
            ? { ...u, role: newRole, name: newName || u.name }
            : u
        ));
        addLog(`Updated user: role=${newRole}${newName ? `, name=${newName}` : ''}`, 'Admin');

        try {
            const updates = { role: newRole };
            if (newName) updates.name = newName;
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);
            if (error) throw error;

            // Also sync to auth user_metadata via edge function
            await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'update-role', payload: { userId, role: newRole, name: newName || prevName } }
            });
            return { success: true };
        } catch (err) {
            // Rollback
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: prevRole, name: prevName } : u));
            return { success: false, error: `Failed to update user: ${err.message}` };
        }
    };

    // Toggle status — syncs to Supabase for real users (ban/unban)
    const toggleUserStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return { success: false };
        const newStatus = user.status === 'active' ? 'inactive' : 'active';

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        addLog(`Toggled user status to ${newStatus}`, 'Admin');

        const isRealUser = String(userId).includes('-');
        if (!isRealUser) return { success: true };

        try {
            const { error } = await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'update-status', payload: { userId, status: newStatus } }
            });
            if (error) throw error;
            return { success: true };
        } catch (err) {
            // Rollback to previous status
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
                    payload: { email: userData.email, name: userData.name, role: userData.role, redirectTo }
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
            const { data, error } = await supabase
                .from('events')
                .insert({ title: event.title, date: event.date, type: event.type, target: event.target, description: event.description || null })
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

    // Reset all platform data: logs, events (localStorage), courses, attendance, notes, grades, enrollments
    const resetAllData = async () => {
        try {
            // Clear Supabase logs
            const { error } = await supabase.from('activity_logs').delete().neq('id', 0);
            if (error) throw error;

            // Clear all localStorage data
            const keys = [
                'admin_events', 'teacher_courses', 'teacher_attendance',
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

            const { data: settings, error: settingsErr } = await supabase
                .from('platform_settings')
                .select('*');
            if (settingsErr) throw settingsErr;

            const exportData = {
                exported_at: new Date().toISOString(),
                platform_settings: settings,
                activity_logs: logs,
                events: JSON.parse(localStorage.getItem('admin_events') || '[]'),
                courses: JSON.parse(localStorage.getItem('teacher_courses') || '[]'),
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

    const value = {
        users, events, eventsLoading, systemLogs, logsLoading, settings, stats,
        courses: getTeacherCourses(),
        attendance: getTeacherAttendance(),
        notes: getTeacherNotes(),
        grades: getStudentGrades(),
        enrollments: getStudentEnrollments(),
        updateUserRole, toggleUserStatus, addUser, deleteUser,
        addEvent, updateEvent, deleteEvent, updateSettings, addLog, fetchLogs,
        clearAllLogs, resetAllData, exportDatabase,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
