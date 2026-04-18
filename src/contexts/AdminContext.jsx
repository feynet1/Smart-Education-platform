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

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('admin_users');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Admin User',     email: 'admin@test.com',    role: 'Admin',   status: 'active',   createdAt: '2025-01-01' },
            { id: 2, name: 'Test Teacher',   email: 'teacher@test.com',  role: 'Teacher', status: 'active',   createdAt: '2025-06-15' },
            { id: 3, name: 'Test Student',   email: 'student@test.com',  role: 'Student', status: 'active',   createdAt: '2025-09-01' },
            { id: 4, name: 'Alice Johnson',  email: 'alice@test.com',    role: 'Student', status: 'active',   createdAt: '2025-09-10' },
            { id: 5, name: 'Bob Smith',      email: 'bob@test.com',      role: 'Student', status: 'inactive', createdAt: '2025-08-20' },
            { id: 6, name: 'Prof. Williams', email: 'williams@test.com', role: 'Teacher', status: 'active',   createdAt: '2025-03-12' },
        ];
    });

    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('admin_events');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Spring Semester Starts', date: '2026-01-15', type: 'academic', target: 'all' },
            { id: 2, title: 'Midterm Exams Week',     date: '2026-02-20', type: 'exam',     target: 'students' },
            { id: 3, title: 'Faculty Meeting',        date: '2026-02-05', type: 'meeting',  target: 'teachers' },
        ];
    });

    const [systemLogs, setSystemLogs] = useState(() => {
        const saved = localStorage.getItem('admin_logs');
        return saved ? JSON.parse(saved) : [
            { id: 1, action: 'Admin logged in',                user: 'admin@test.com',   timestamp: '2026-01-27 10:00:00' },
            { id: 2, action: 'Teacher created course "Math 101"', user: 'teacher@test.com', timestamp: '2026-01-26 15:30:00' },
            { id: 3, action: 'Student joined course',          user: 'student@test.com', timestamp: '2026-01-26 16:00:00' },
        ];
    });

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
                    data.forEach(row => { merged[row.key] = row.value; });
                    setSettings(prev => ({ ...prev, ...merged }));
                }
            } catch (err) {
                console.error('Failed to fetch platform settings:', err);
            }
        };
        fetchSettings();
    }, []);

    // Shared error state so UI can show snackbar instead of alert()

    // Fetch real users from Supabase on load
    useEffect(() => {
        const fetchRealUsers = async () => {
            try {
                const { data, error } = await supabase.functions.invoke('admin-user-manager', {
                    body: { action: 'list' }
                });
                if (error) throw error;
                if (data?.users) {
                    const mappedUsers = data.users.map(u => ({
                        id: u.id,
                        name: u.user_metadata?.name || 'Unknown',
                        email: u.email,
                        role: u.user_metadata?.role || 'Student',
                        status: u.banned_until ? 'inactive' : 'active',
                        createdAt: new Date(u.created_at).toISOString().split('T')[0]
                    }));
                    setUsers(prevUsers => {
                        const newEmails = new Set(mappedUsers.map(u => u.email));
                        const filteredMock = prevUsers.filter(u => !newEmails.has(u.email));
                        return [...filteredMock, ...mappedUsers];
                    });
                }
            } catch (err) {
                console.error('Failed to fetch real users:', err);
            }
        };
        fetchRealUsers();
    }, []);

    useEffect(() => { localStorage.setItem('admin_users',    JSON.stringify(users));       }, [users]);
    useEffect(() => { localStorage.setItem('admin_events',   JSON.stringify(events));      }, [events]);
    useEffect(() => { localStorage.setItem('admin_logs',     JSON.stringify(systemLogs));  }, [systemLogs]);

    const stats = {
        totalStudents: users.filter(u => u.role === 'Student').length,
        totalTeachers: users.filter(u => u.role === 'Teacher').length,
        totalCourses:  getTeacherCourses().length,
        activeClasses: getTeacherCourses().length,
    };

    const addLog = (action, user) => {
        const newLog = {
            id: Date.now(),
            action,
            user,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        setSystemLogs(prev => [newLog, ...prev].slice(0, 50));
    };

    // Update role — syncs to Supabase for real users, local-only for mock users
    const updateUserRole = async (userId, newRole) => {
        const user = users.find(u => u.id === userId);
        const prevRole = user?.role;

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        addLog(`Changed user role to ${newRole}`, 'Admin');

        const isRealUser = String(userId).includes('-');
        if (!isRealUser) return { success: true };

        try {
            const { error } = await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'update-role', payload: { userId, role: newRole } }
            });
            if (error) throw error;
            return { success: true };
        } catch (err) {
            // Rollback to previous role
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: prevRole } : u));
            return { success: false, error: `Failed to update role: ${err.message}` };
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
                } catch (_) { /* ignore */ }
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

    const addEvent = (event) => {
        setEvents(prev => [...prev, { ...event, id: Date.now() }]);
        addLog(`Created event: ${event.title}`, 'Admin');
    };

    const deleteEvent = (eventId) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        addLog('Deleted event', 'Admin');
    };

    const updateSettings = async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        addLog('Updated platform settings', 'Admin');
        // Persist each changed key to Supabase
        try {
            const upserts = Object.entries(newSettings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));
            const { error } = await supabase
                .from('platform_settings')
                .upsert(upserts, { onConflict: 'key' });
            if (error) throw error;
        } catch (err) {
            console.error('Failed to save settings to Supabase:', err);
        }
    };

    const value = {
        users, events, systemLogs, settings, stats,
        courses: getTeacherCourses(),
        attendance: getTeacherAttendance(),
        notes: getTeacherNotes(),
        grades: getStudentGrades(),
        enrollments: getStudentEnrollments(),
        updateUserRole, toggleUserStatus, addUser, deleteUser,
        addEvent, deleteEvent, updateSettings, addLog,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
