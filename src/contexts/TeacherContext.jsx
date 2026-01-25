/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const TeacherContext = createContext();

export const useTeacher = () => {
    return useContext(TeacherContext);
};

export const TeacherProvider = ({ children }) => {
    // --- State Initialization ---
    const [courses, setCourses] = useState(() => {
        const saved = localStorage.getItem('teacher_courses');
        return saved ? JSON.parse(saved) : [];
    });

    const [students] = useState(() => {
        // Mock global student list for now, or per course?
        // For simplicity, let's just keep a mocked list of students we can add to courses
        return [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
            { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
        ];
    });

    const [attendance, setAttendance] = useState(() => {
        const saved = localStorage.getItem('teacher_attendance');
        return saved ? JSON.parse(saved) : {}; // { courseId: [ { date, records: [] } ] }
    });

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('teacher_notes');
        return saved ? JSON.parse(saved) : {}; // { courseId: [file1, file2] }
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('teacher_courses', JSON.stringify(courses));
    }, [courses]);

    useEffect(() => {
        localStorage.setItem('teacher_attendance', JSON.stringify(attendance));
    }, [attendance]);

    useEffect(() => {
        localStorage.setItem('teacher_notes', JSON.stringify(notes));
    }, [notes]);


    // --- Actions ---

    // Course Actions
    const addCourse = (course) => {
        const newCourse = { ...course, id: Date.now().toString(), students: [], joinCode: Math.random().toString(36).substring(7).toUpperCase() };
        setCourses([...courses, newCourse]);
    };

    const updateCourse = (id, updatedData) => {
        setCourses(courses.map(c => c.id === id ? { ...c, ...updatedData } : c));
    };

    const deleteCourse = (id) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    // Attendance Actions
    const saveAttendance = (courseId, date, records) => {
        setAttendance(prev => {
            const courseAttendance = prev[courseId] || [];
            // Check if update or new
            const existingIndex = courseAttendance.findIndex(a => a.date === date);
            let newCourseAttendance;
            if (existingIndex >= 0) {
                newCourseAttendance = [...courseAttendance];
                newCourseAttendance[existingIndex] = { date, records };
            } else {
                newCourseAttendance = [...courseAttendance, { date, records }];
            }
            return { ...prev, [courseId]: newCourseAttendance };
        });
    };

    // Notes Actions
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
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        students,
        attendance,
        saveAttendance,
        notes,
        addNote,
        deleteNote
    };

    return (
        <TeacherContext.Provider value={value}>
            {children}
        </TeacherContext.Provider>
    );
};
