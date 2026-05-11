import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, TextField,
    Snackbar, Alert, CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Avatar, ButtonGroup, Tabs, Tab,
    LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import { Download, Save, Person, History, EditCalendar, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import { supabase } from '../../../supabaseClient';
import { useTeacher } from '../../../contexts/TeacherContext';

const STATUS_CONFIG = {
    Present: { color: 'success' },
    Late:    { color: 'warning' },
    Absent:  { color: 'error' },
};

const AttendanceHelper = () => {
    const { id: courseId } = useParams();
    const { courses, fetchAttendance, saveAttendance, attendance, attendanceLoading,
            enrolledStudents, enrolledLoading, fetchEnrolledStudents } = useTeacher();
    const course = courses.find(c => c.id === courseId);

    const [tab, setTab] = useState(0); // 0 = Mark, 1 = History
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [rows, setRows] = useState([]);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // ── History state ─────────────────────────────────────────
    const [history, setHistory] = useState([]); // flat attendance records
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!courseId) return;
        setHistoryLoading(true);
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('student_id, student_name, date, status')
                .eq('course_id', courseId)
                .order('date', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error('Failed to fetch attendance history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [courseId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchEnrolledStudents(courseId), fetchHistory()]);
            setSnackbar({ open: true, message: 'Data refreshed', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Refresh failed', severity: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchEnrolledStudents(courseId);
            fetchHistory();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const courseStudents = enrolledStudents[courseId] || [];
    const studentsLoading = enrolledLoading[courseId] ?? false;

    // Pre-populate rows when enrolled students load
    useEffect(() => {
        if (courseStudents.length === 0) return;
        setRows(courseStudents.map(s => ({ id: s.id, name: s.name, status: 'Present' })));
    }, [courseStudents.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load saved attendance for selected date
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

    const setStatus = (studentId, status) => {
        setRows(prev => prev.map(r => r.id === studentId ? { ...r, status } : r));
    };

    const handleSave = async () => {
        setSaving(true);
        const records = rows.map(r => ({ studentId: r.id, name: r.name, status: r.status }));
        const result = await saveAttendance(courseId, selectedDate, records);
        setSaving(false);
        if (result.success) {
            fetchHistory(); // refresh history after save
        }
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

    // ── Per-student history stats ─────────────────────────────
    const studentStats = courseStudents.map(student => {
        const records = history.filter(r => r.student_id === student.id);
        const present = records.filter(r => r.status === 'Present').length;
        const late    = records.filter(r => r.status === 'Late').length;
        const absent  = records.filter(r => r.status === 'Absent').length;
        const total   = records.length;
        const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : null;
        return { id: student.id, name: student.name, present, late, absent, total, rate };
    });

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
                    <Typography variant="subtitle1" color="text.secondary">{course.name}</Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
                                {refreshing
                                    ? <CircularProgress size={20} color="inherit" />
                                    : <Refresh />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    {tab === 0 && (
                        <>
                            <TextField type="date" size="small" value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} />
                            <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
                                Export CSV
                            </Button>
                            <Button variant="contained"
                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                onClick={handleSave} disabled={saving || rows.length === 0}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {/* Tabs */}
            <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<EditCalendar />} iconPosition="start" label="Mark Attendance" />
                    <Tab icon={<History />} iconPosition="start" label="Student History" />
                </Tabs>

                <Box p={2}>
                    {/* ── Tab 0: Mark Attendance ── */}
                    {tab === 0 && (
                        <>
                            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                {Object.entries(counts).map(([status, count]) => (
                                    <Chip key={status} label={`${status}: ${count}`}
                                        color={STATUS_CONFIG[status].color} variant="outlined" />
                                ))}
                                <Chip label={`Total: ${rows.length}`} variant="outlined" />
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell width={50}>#</TableCell>
                                            <TableCell>Student</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                            <TableCell align="center" width={280}>Mark</TableCell>
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
                                                        No students enrolled yet
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
                                                    <Chip label={row.status} size="small"
                                                        color={STATUS_CONFIG[row.status]?.color || 'default'} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <ButtonGroup size="small" variant="outlined">
                                                        <Button color="success"
                                                            variant={row.status === 'Present' ? 'contained' : 'outlined'}
                                                            onClick={() => setStatus(row.id, 'Present')}>
                                                            Present
                                                        </Button>
                                                        <Button color="warning"
                                                            variant={row.status === 'Late' ? 'contained' : 'outlined'}
                                                            onClick={() => setStatus(row.id, 'Late')}>
                                                            Late
                                                        </Button>
                                                        <Button color="error"
                                                            variant={row.status === 'Absent' ? 'contained' : 'outlined'}
                                                            onClick={() => setStatus(row.id, 'Absent')}>
                                                            Absent
                                                        </Button>
                                                    </ButtonGroup>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* ── Tab 1: Student History ── */}
                    {tab === 1 && (
                        historyLoading || studentsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : studentStats.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" py={4}>
                                No students enrolled yet
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell>Student</TableCell>
                                            <TableCell align="center">Sessions</TableCell>
                                            <TableCell align="center">Present</TableCell>
                                            <TableCell align="center">Late</TableCell>
                                            <TableCell align="center">Absent</TableCell>
                                            <TableCell>Attendance Rate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentStats.map(s => (
                                            <TableRow key={s.id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
                                                            {s.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {s.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{s.total}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={s.present} size="small" color="success" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={s.late} size="small" color="warning" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={s.absent} size="small" color="error" variant="outlined" />
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 180 }}>
                                                    {s.rate != null ? (
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            <LinearProgress
                                                                variant="determinate" value={s.rate}
                                                                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                                                color={s.rate >= 75 ? 'success' : s.rate >= 50 ? 'warning' : 'error'} />
                                                            <Typography variant="body2" fontWeight="bold"
                                                                sx={{ minWidth: 38 }}
                                                                color={s.rate >= 75 ? 'success.main' : s.rate >= 50 ? 'warning.main' : 'error.main'}>
                                                                {s.rate}%
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="text.disabled">No data</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    )}
                </Box>
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceHelper;
