import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, TextField,
    Snackbar, Alert, CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Avatar, ButtonGroup,
} from '@mui/material';
import { Download, Save, Person } from '@mui/icons-material';
import { format } from 'date-fns';
import { useTeacher } from '../../../contexts/TeacherContext';

const STATUS_CONFIG = {
    Present: { color: 'success', label: 'Present' },
    Late:    { color: 'warning', label: 'Late' },
    Absent:  { color: 'error',   label: 'Absent' },
};

const AttendanceHelper = () => {
    const { id: courseId } = useParams();
    const { courses, fetchAttendance, saveAttendance, attendance, attendanceLoading,
            enrolledStudents, enrolledLoading, fetchEnrolledStudents } = useTeacher();
    const course = courses.find(c => c.id === courseId);

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [rows, setRows] = useState([]);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch enrolled students for this course on mount
    useEffect(() => {
        if (courseId) fetchEnrolledStudents(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const courseStudents = enrolledStudents[courseId] || [];
    const studentsLoading = enrolledLoading[courseId] ?? false;

    // Pre-populate rows when enrolled students load
    useEffect(() => {
        if (courseStudents.length === 0) return;
        setRows(courseStudents.map(s => ({ id: s.id, name: s.name, status: 'Present' })));
    }, [courseStudents.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load saved attendance for selected date (overlay on top of defaults)
    useEffect(() => {
        if (!courseId || !selectedDate || courseStudents.length === 0) return;

        const load = async () => {
            const existing = attendance[courseId]?.[selectedDate];
            const records = existing ?? await fetchAttendance(courseId, selectedDate);
            if (records.length > 0) {
                setRows(prev => prev.map(r => {
                    const found = records.find(rec => rec.studentId === r.id);
                    return found ? { ...r, status: found.status } : r;
                }));
            }
        };
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, selectedDate]);

    // Instant status change — optimistic, no Supabase call until Save
    const setStatus = (studentId, status) => {
        setRows(prev => prev.map(r => r.id === studentId ? { ...r, status } : r));
    };

    const handleSave = async () => {
        setSaving(true);
        const records = rows.map(r => ({ studentId: r.id, name: r.name, status: r.status }));
        const result = await saveAttendance(courseId, selectedDate, records);
        setSaving(false);
        setSnackbar({
            open: true,
            message: result.success ? 'Attendance saved' : result.error || 'Failed to save',
            severity: result.success ? 'success' : 'error',
        });
    };

    const handleExport = () => {
        const csv = [
            ['Name', 'Status', 'Date'].join(','),
            ...rows.map(r => `${r.name},${r.status},${selectedDate}`),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${course?.name}_${selectedDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    const counts = {
        Present: rows.filter(r => r.status === 'Present').length,
        Late:    rows.filter(r => r.status === 'Late').length,
        Absent:  rows.filter(r => r.status === 'Absent').length,
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Attendance</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {course.name} — {format(new Date(selectedDate + 'T00:00:00'), 'MMMM do, yyyy')}
                    </Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        type="date" size="small" value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
                        Export CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={saving || rows.length === 0}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </Box>
            </Box>

            {/* Summary */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                {Object.entries(counts).map(([status, count]) => (
                    <Chip
                        key={status}
                        label={`${status}: ${count}`}
                        color={STATUS_CONFIG[status].color}
                        variant="outlined"
                    />
                ))}
                <Chip label={`Total: ${rows.length}`} variant="outlined" />
            </Box>

            {/* Attendance Table */}
            <Paper elevation={2}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell width={50}>#</TableCell>
                                <TableCell>Student</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center" width={280}>Mark Attendance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceLoading || studentsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                        No students enrolled in this course yet
                                    </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : rows.map((row, index) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
                                                <Person fontSize="small" />
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="medium">
                                                {row.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.status}
                                            size="small"
                                            color={STATUS_CONFIG[row.status]?.color || 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* Instant 3-button toggle */}
                                        <ButtonGroup size="small" variant="outlined">
                                            <Button
                                                color="success"
                                                variant={row.status === 'Present' ? 'contained' : 'outlined'}
                                                onClick={() => setStatus(row.id, 'Present')}
                                            >
                                                Present
                                            </Button>
                                            <Button
                                                color="warning"
                                                variant={row.status === 'Late' ? 'contained' : 'outlined'}
                                                onClick={() => setStatus(row.id, 'Late')}
                                            >
                                                Late
                                            </Button>
                                            <Button
                                                color="error"
                                                variant={row.status === 'Absent' ? 'contained' : 'outlined'}
                                                onClick={() => setStatus(row.id, 'Absent')}
                                            >
                                                Absent
                                            </Button>
                                        </ButtonGroup>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceHelper;
