/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminContext = createContext();

export const useAdmin = () => {
    return useContext(AdminContext);
};

export const AdminProvider = ({ children }) => {
    // --- Aggregate Data from Teacher & Student localStorage ---

    // Get all courses created by teachers
    const getTeacherCourses = () => {
        const saved = localStorage.getItem('teacher_courses');
        return saved ? JSON.parse(saved) : [];
    };

    // Get all attendance records
    const getTeacherAttendance = () => {
        const saved = localStorage.getItem('teacher_attendance');
        return saved ? JSON.parse(saved) : {};
    };

    // Get all notes
    const getTeacherNotes = () => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {};
    };

    // Get student grades
    const getStudentGrades = () => {
        const saved = localStorage.getItem('student_grades');
        return saved ? JSON.parse(saved) : [];
    };

    // Get student enrollments
    const getStudentEnrollments = () => {
        const saved = localStorage.getItem('student_enrollments');
        return saved ? JSON.parse(saved) : [];
    };

    // --- Admin-specific State ---
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('admin_users');
        return saved ? JSON.parse(saved) : [
            // Mock users
            { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'Admin', status: 'active', createdAt: '2025-01-01' },
            { id: 2, name: 'Test Teacher', email: 'teacher@test.com', role: 'Teacher', status: 'active', createdAt: '2025-06-15' },
            { id: 3, name: 'Test Student', email: 'student@test.com', role: 'Student', status: 'active', createdAt: '2025-09-01' },
            { id: 4, name: 'Alice Johnson', email: 'alice@test.com', role: 'Student', status: 'active', createdAt: '2025-09-10' },
            { id: 5, name: 'Bob Smith', email: 'bob@test.com', role: 'Student', status: 'inactive', createdAt: '2025-08-20' },
            { id: 6, name: 'Prof. Williams', email: 'williams@test.com', role: 'Teacher', status: 'active', createdAt: '2025-03-12' },
        ];
    });

    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('admin_events');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Spring Semester Starts', date: '2026-01-15', type: 'academic', target: 'all' },
            { id: 2, title: 'Midterm Exams Week', date: '2026-02-20', type: 'exam', target: 'students' },
            { id: 3, title: 'Faculty Meeting', date: '2026-02-05', type: 'meeting', target: 'teachers' },
        ];
    });

    const [systemLogs, setSystemLogs] = useState(() => {
        const saved = localStorage.getItem('admin_logs');
        return saved ? JSON.parse(saved) : [
            { id: 1, action: 'Admin logged in', user: 'admin@test.com', timestamp: '2026-01-27 10:00:00' },
            { id: 2, action: 'Teacher created course "Math 101"', user: 'teacher@test.com', timestamp: '2026-01-26 15:30:00' },
            { id: 3, action: 'Student joined course', user: 'student@test.com', timestamp: '2026-01-26 16:00:00' },
        ];
    });

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('admin_settings');
        return saved ? JSON.parse(saved) : {
            registrationEnabled: true,
            academicYear: '2025-2026',
            semesterName: 'Spring 2026',
            maintenanceMode: false,
        };
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('admin_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('admin_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('admin_logs', JSON.stringify(systemLogs));
    }, [systemLogs]);

    useEffect(() => {
        localStorage.setItem('admin_settings', JSON.stringify(settings));
    }, [settings]);

    // --- Computed Stats ---
    const stats = {
        totalStudents: users.filter(u => u.role === 'Student').length,
        totalTeachers: users.filter(u => u.role === 'Teacher').length,
        totalCourses: getTeacherCourses().length,
        activeClasses: getTeacherCourses().length, // Simplified
    };

    // --- Actions ---
    const updateUserRole = (userId, newRole) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        addLog(`Changed user role to ${newRole}`, 'Admin');
    };

    const toggleUserStatus = (userId) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
        addLog('Toggled user status', 'Admin');
    };

    const addUser = async (userData) => {
        try {
            const { data, error } = await supabase.functions.invoke('admin-user-manager', {
                body: { 
                    action: 'create', 
                    payload: { ...userData, password: 'TemporaryPassword123!' } 
                }
            });
            
            if (error) throw error;
            
            const newUser = {
                id: data.user.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0]
            };
            setUsers([newUser, ...users]);
            addLog(`Added new Supabase user: ${userData.name}`, 'Admin');
        } catch (err) {
            console.error("Failed to add user:", err);
            // Show the actual error message from Supabase or network:
            const errorMsg = err.message || err.error?.message || "Unknown error";
            alert(`Failed to create user in Supabase: ${errorMsg}`);
        }
    };

    const deleteUser = async (userId) => {
        try {
            // Check if it's a test/mock user without a real Supabase UUID
            if (!String(userId).includes('-')) {
                const user = users.find(u => u.id === userId);
                setUsers(users.filter(u => u.id !== userId));
                addLog(`Deleted local mock user: ${user ? user.name : userId}`, 'Admin');
                return;
            }

            const { error } = await supabase.functions.invoke('admin-user-manager', {
                body: { action: 'delete', payload: { userId } }
            });
            
            if (error) throw error;
            
            const user = users.find(u => u.id === userId);
            setUsers(users.filter(u => u.id !== userId));
            addLog(`Deleted Supabase user: ${user ? user.name : userId}`, 'Admin');
        } catch (err) {
            console.error("Failed to delete user:", err);
            const errorMsg = err.message || err.error?.message || "Unknown error";
            alert(`Failed to delete user in Supabase: ${errorMsg}`);
        }
    };

    const addEvent = (event) => {
        setEvents((prevEvents) => {
            const newEvent = { ...event, id: Date.now() };
            return [...prevEvents, newEvent];
        });
        addLog(`Created event: ${event.title}`, 'Admin');
    };

    const deleteEvent = (eventId) => {
        setEvents(events.filter(e => e.id !== eventId));
        addLog('Deleted event', 'Admin');
    };

    const addLog = (action, user) => {
        const newLog = {
            id: Date.now(),
            action,
            user,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        setSystemLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    const updateSettings = (newSettings) => {
        setSettings({ ...settings, ...newSettings });
        addLog('Updated platform settings', 'Admin');
    };

    const value = {
        // State
        users,
        events,
        systemLogs,
        settings,
        stats,
        // Data accessors
        courses: getTeacherCourses(),
        attendance: getTeacherAttendance(),
        notes: getTeacherNotes(),
        grades: getStudentGrades(),
        enrollments: getStudentEnrollments(),
        // Actions
        updateUserRole,
        toggleUserStatus,
        addUser,
        deleteUser,
        addEvent,
        deleteEvent,
        updateSettings,
        addLog,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
