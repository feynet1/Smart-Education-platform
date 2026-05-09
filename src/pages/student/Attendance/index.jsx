import { useState } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    MenuItem, Select, FormControl, InputLabel, LinearProgress,
    Grid,
} from '@mui/material';
import { useStudent } from '../../../contexts/StudentContext';

const statusColor = (status) => {
    if (status === 'Present') return 'success';
    if (status === 'Late')    return 'warning';
    return 'error';
};

const StudentAttendance = () => {
    const {
        attendanceRecords,
        attendanceLoading,
        attendancePercentage,
        courseAttendanceStats,
        enrolledCourses,
    } = useStudent();

    const [filterCourse, setFilterCourse] = useState('all');

    const filteredRecords = filterCourse === 'all'
        ? attendanceRecords
        : attendanceRecords.filter(r => r.course_id === filterCourse);

    const present = filteredRecords.filter(r => r.status === 'Present').length;
    const late    = filteredRecords.filter(r => r.status === 'Late').length;
    const total   = filteredRecords.length;
    const pct     = total > 0 ? Math.round(((present + late) / total) * 100) : null;

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Attendance</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Your attendance record across all courses
                </Typography>
            </Box>

            {/* Overall summary */}
            <Box display="flex" gap={3} mb={4} flexWrap="wrap">
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 130 }}>
                    <Typography variant="h4" fontWeight="bold"
                        color={attendancePercentage == null ? 'text.secondary'
                             : attendancePercentage >= 75 ? 'success.main'
                             : attendancePercentage >= 50 ? 'warning.main' : 'error.main'}>
                        {attendanceLoading ? '…' : attendancePercentage != null ? `${attendancePercentage}%` : '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Overall Rate</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 130 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                        {attendanceLoading ? '…' : attendanceRecords.filter(r => r.status === 'Present').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Present</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 130 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {attendanceLoading ? '…' : attendanceRecords.filter(r => r.status === 'Late').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Late</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 130 }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                        {attendanceLoading ? '…' : attendanceRecords.filter(r => r.status === 'Absent').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Absent</Typography>
                </Paper>
            </Box>

            {/* Per-course breakdown */}
            {enrolledCourses.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Per-Course Breakdown</Typography>
                    <Grid container spacing={2}>
                        {enrolledCourses.map(course => {
                            const stats = courseAttendanceStats[course.id];
                            const coursePct = stats?.percentage;
                            const color = coursePct == null ? 'info'
                                        : coursePct >= 75 ? 'success'
                                        : coursePct >= 50 ? 'warning' : 'error';
                            return (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            {course.name}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                                            <Typography variant="caption" color="text.secondary">
                                                {stats?.total ?? 0} sessions
                                            </Typography>
                                            <Typography variant="caption" fontWeight="bold"
                                                color={`${color}.main`}>
                                                {coursePct != null ? `${coursePct}%` : 'No data'}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={coursePct ?? 0}
                                            color={color}
                                            sx={{ height: 6, borderRadius: 1 }} />
                                        {stats && stats.total > 0 && (
                                            <Box display="flex" gap={1} mt={1}>
                                                <Chip label={`${stats.present} Present`} size="small" color="success" variant="outlined" />
                                                {stats.late > 0 && <Chip label={`${stats.late} Late`} size="small" color="warning" variant="outlined" />}
                                                {stats.absent > 0 && <Chip label={`${stats.absent} Absent`} size="small" color="error" variant="outlined" />}
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            )}

            {/* Detailed records table */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Session Records</Typography>
                        {pct != null && (
                            <Typography variant="caption" color="text.secondary">
                                {present + late} of {total} sessions attended ({pct}%)
                            </Typography>
                        )}
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Course</InputLabel>
                        <Select value={filterCourse} label="Filter by Course"
                            onChange={e => setFilterCourse(e.target.value)}>
                            <MenuItem value="all">All Courses</MenuItem>
                            {enrolledCourses.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {attendanceLoading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : filteredRecords.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">
                            No attendance records yet. Join a live session to start tracking.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Course</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRecords.map(record => {
                                    const course = enrolledCourses.find(c => c.id === record.course_id);
                                    return (
                                        <TableRow key={record.id} hover>
                                            <TableCell>
                                                <Typography variant="body2">{record.date}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {course?.name || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={record.status}
                                                    size="small"
                                                    color={statusColor(record.status)} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default StudentAttendance;
