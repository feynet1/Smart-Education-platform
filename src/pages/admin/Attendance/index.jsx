/**
 * Admin Attendance Monitoring
 * Real data from Supabase attendance table, grouped by course.
 */
import { useState } from 'react';
import {
    Box, Typography, Paper, Grid, FormControl, InputLabel,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, LinearProgress, CircularProgress,
    Button,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const AttendanceMonitoring = () => {
    const { attendance, attendanceLoading, fetchAdminAttendance, courses } = useAdmin();
    const [selectedCourse, setSelectedCourse] = useState('all');

    // attendance = flat array of { id, course_id, student_id, student_name, date, status }
    // Group by course_id and compute stats
    const courseStatsMap = {};

    attendance.forEach(record => {
        const cid = record.course_id;
        if (!courseStatsMap[cid]) {
            courseStatsMap[cid] = { present: 0, absent: 0, late: 0, total: 0, sessions: new Set() };
        }
        courseStatsMap[cid].total++;
        courseStatsMap[cid].sessions.add(record.session_id || record.date);
        if (record.status === 'Present') courseStatsMap[cid].present++;
        else if (record.status === 'Absent') courseStatsMap[cid].absent++;
        else if (record.status === 'Late')   courseStatsMap[cid].late++;
    });

    // Merge with courses list so every course appears (even with 0 records)
    const courseStats = courses.map(course => {
        const s = courseStatsMap[course.id] || { present: 0, absent: 0, late: 0, total: 0, sessions: new Set() };
        const rate = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
        return {
            id:       course.id,
            name:     course.name,
            subject:  course.subject,
            teacher:  course.teacherName || '—',
            present:  s.present,
            absent:   s.absent,
            late:     s.late,
            total:    s.total,
            sessions: s.sessions.size,
            rate,
        };
    });

    const displayStats = selectedCourse === 'all'
        ? courseStats
        : courseStats.filter(s => s.id === selectedCourse);

    // Overall platform stats
    const totalRecords = attendance.length;
    const totalPresent = attendance.filter(r => r.status === 'Present').length;
    const totalLate    = attendance.filter(r => r.status === 'Late').length;
    const totalAbsent  = attendance.filter(r => r.status === 'Absent').length;
    const avgRate      = totalRecords > 0
        ? Math.round(((totalPresent + totalLate) / totalRecords) * 100)
        : 0;
    const uniqueSessions = new Set(attendance.map(r => r.session_id || r.date)).size;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Attendance Monitoring
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Platform-wide attendance — {totalRecords} records across {uniqueSessions} sessions
                    </Typography>
                </Box>
                <Button variant="outlined"
                    startIcon={attendanceLoading ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={fetchAdminAttendance} disabled={attendanceLoading}>
                    Refresh
                </Button>
            </Box>

            {/* Overall Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold"
                            color={avgRate >= 75 ? 'success.main' : avgRate >= 50 ? 'warning.main' : 'error.main'}>
                            {attendanceLoading ? <CircularProgress size={32} /> : `${avgRate}%`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Average Attendance Rate</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {attendanceLoading ? <CircularProgress size={32} /> : totalPresent + totalLate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Present + Late</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="error.main">
                            {attendanceLoading ? <CircularProgress size={32} /> : totalAbsent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Absent</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="text.secondary">
                            {attendanceLoading ? <CircularProgress size={32} /> : uniqueSessions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                    <InputLabel>Filter by Course</InputLabel>
                    <Select value={selectedCourse} label="Filter by Course"
                        onChange={e => setSelectedCourse(e.target.value)}>
                        <MenuItem value="all">All Courses</MenuItem>
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {/* Per-course table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell><strong>Teacher</strong></TableCell>
                                <TableCell align="center"><strong>Sessions</strong></TableCell>
                                <TableCell align="center"><strong>Present</strong></TableCell>
                                <TableCell align="center"><strong>Late</strong></TableCell>
                                <TableCell align="center"><strong>Absent</strong></TableCell>
                                <TableCell><strong>Attendance Rate</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : displayStats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No attendance data yet</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : displayStats.map(stat => (
                                <TableRow key={stat.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{stat.name}</Typography>
                                    </TableCell>
                                    <TableCell>{stat.subject}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">{stat.teacher}</Typography>
                                    </TableCell>
                                    <TableCell align="center">{stat.sessions}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.present} size="small" color="success" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.late} size="small" color="warning" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.absent} size="small" color="error" variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 180 }}>
                                        {stat.total === 0 ? (
                                            <Typography variant="caption" color="text.disabled">No data</Typography>
                                        ) : (
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={stat.rate}
                                                    sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                                    color={stat.rate >= 75 ? 'success' : stat.rate >= 50 ? 'warning' : 'error'} />
                                                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 38 }}>
                                                    {stat.rate}%
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AttendanceMonitoring;
