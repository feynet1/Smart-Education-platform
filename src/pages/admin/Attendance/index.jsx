/**
 * Admin Attendance Monitoring
 * 
 * Overview of attendance data across all courses.
 * Displays aggregated attendance statistics and records.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress
} from '@mui/material';
import { useAdmin } from '../../../contexts/AdminContext';

const AttendanceMonitoring = () => {
    const { attendance, courses } = useAdmin();
    const [selectedCourse, setSelectedCourse] = useState('all');

    // Calculate attendance stats for each course
    const courseStats = courses.map(course => {
        const courseAttendance = attendance[course.id] || [];
        let present = 0, absent = 0, late = 0, total = 0;

        courseAttendance.forEach(record => {
            record.records.forEach(r => {
                total++;
                if (r.status === 'Present') present++;
                else if (r.status === 'Absent') absent++;
                else if (r.status === 'Late') late++;
            });
        });

        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
            id: course.id,
            name: course.name,
            subject: course.subject,
            present,
            absent,
            late,
            total,
            rate,
            sessions: courseAttendance.length
        };
    });

    // Filter based on selection
    const displayStats = selectedCourse === 'all'
        ? courseStats
        : courseStats.filter(s => s.id === selectedCourse);

    // Overall statistics
    const overall = {
        totalSessions: courseStats.reduce((sum, s) => sum + s.sessions, 0),
        avgRate: courseStats.length > 0
            ? Math.round(courseStats.reduce((sum, s) => sum + s.rate, 0) / courseStats.length)
            : 0,
        totalPresent: courseStats.reduce((sum, s) => sum + s.present, 0),
        totalAbsent: courseStats.reduce((sum, s) => sum + s.absent, 0),
    };

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Attendance Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Platform-wide attendance overview and analytics
                </Typography>
            </Box>

            {/* Overall Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                            {overall.avgRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Average Attendance Rate</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {overall.totalPresent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Present</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="error.main">
                            {overall.totalAbsent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Absent</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="text.secondary">
                            {overall.totalSessions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>Filter by Course</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Filter by Course"
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <MenuItem value="all">All Courses</MenuItem>
                        {courses.map(course => (
                            <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {/* Attendance Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell align="center"><strong>Sessions</strong></TableCell>
                                <TableCell align="center"><strong>Present</strong></TableCell>
                                <TableCell align="center"><strong>Absent</strong></TableCell>
                                <TableCell align="center"><strong>Late</strong></TableCell>
                                <TableCell><strong>Attendance Rate</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayStats.length > 0 ? displayStats.map((stat) => (
                                <TableRow key={stat.id} hover>
                                    <TableCell>{stat.name}</TableCell>
                                    <TableCell>{stat.subject}</TableCell>
                                    <TableCell align="center">{stat.sessions}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.present} size="small" color="success" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.absent} size="small" color="error" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={stat.late} size="small" color="warning" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stat.rate}
                                                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                                color={stat.rate >= 75 ? 'success' : stat.rate >= 50 ? 'warning' : 'error'}
                                            />
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>
                                                {stat.rate}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No attendance data available</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AttendanceMonitoring;
