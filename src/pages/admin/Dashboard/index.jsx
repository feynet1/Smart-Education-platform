/**
 * Admin Dashboard Overview
 */
import {
    Box, Grid, Paper, Typography, Card, CardContent, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Chip, Button, LinearProgress,
} from '@mui/material';
import {
    People, School, FactCheck, TrendingUp, Event, Person,
    Grade, CheckCircle, Cancel, AccessTime,
} from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { scoreToGrade, gradeColor } from '../../../utils/gradeUtils';

// Statistics Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Paper elevation={0} sx={{
        p: 3, borderRadius: 2,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`, height: '100%',
    }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
                <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            <Avatar sx={{ bgcolor: `${color}20`, color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
    </Paper>
);

const AdminDashboard = () => {
    const { stats, users, systemLogs, events, attendance, grades } = useAdmin();
    const navigate = useNavigate();

    const recentLogs = systemLogs.slice(0, 5);
    const upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    const activeStudents = users.filter(u => u.role === 'Student' && u.status === 'active').length;
    const activeTeachers = users.filter(u => u.role === 'Teacher' && u.status === 'active').length;

    // ── Attendance stats ──────────────────────────────────────
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(r => r.status === 'Present').length;
    const lateCount    = attendance.filter(r => r.status === 'Late').length;
    const absentCount  = attendance.filter(r => r.status === 'Absent').length;
    const attendanceRate = totalAttendance > 0
        ? Math.round(((presentCount + lateCount) / totalAttendance) * 100)
        : null;

    // ── Grade stats ───────────────────────────────────────────
    // grades = weighted totals per student-course (from AdminContext)
    const avgScore = grades.length > 0
        ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)
        : null;

    // Grade letter distribution
    const gradeDist = grades.reduce((acc, g) => {
        const letter = scoreToGrade(g.score);
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
    }, {});

    const topGrades   = ['A+', 'A', 'A-'].reduce((s, l) => s + (gradeDist[l] || 0), 0);
    const midGrades   = ['B+', 'B', 'B-', 'C+', 'C', 'C-'].reduce((s, l) => s + (gradeDist[l] || 0), 0);
    const lowGrades   = ['D+', 'D', 'F'].reduce((s, l) => s + (gradeDist[l] || 0), 0);

    return (
        <Box>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Dashboard Overview</Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back! Here&apos;s what&apos;s happening on your platform.
                </Typography>
            </Box>

            {/* Top Stats */}
            <Grid container spacing={3} mb={4}>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Students" value={stats.totalStudents}
                        icon={<People />} color="#1976d2"
                        subtitle={`${activeStudents} active`} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Teachers" value={stats.totalTeachers}
                        icon={<Person />} color="#2e7d32"
                        subtitle={`${activeTeachers} active`} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Active Courses" value={stats.totalCourses}
                        icon={<School />} color="#ed6c02" />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Attendance Rate"
                        value={attendanceRate != null ? `${attendanceRate}%` : '—'}
                        icon={<FactCheck />}
                        color={attendanceRate == null ? '#9e9e9e' : attendanceRate >= 75 ? '#2e7d32' : attendanceRate >= 50 ? '#ed6c02' : '#d32f2f'}
                        subtitle={`${totalAttendance} total records`} />
                </Grid>
            </Grid>

            {/* Middle row: Attendance + Grades */}
            <Grid container spacing={3} mb={3}>
                {/* Attendance Breakdown */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">Attendance Overview</Typography>
                            <Button size="small" onClick={() => navigate('/admin/attendance')}>View Details</Button>
                        </Box>

                        {totalAttendance === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                No attendance records yet
                            </Typography>
                        ) : (
                            <Box>
                                {/* Overall bar */}
                                <Box mb={3}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" color="text.secondary">Overall Rate</Typography>
                                        <Typography variant="body2" fontWeight="bold"
                                            color={attendanceRate >= 75 ? 'success.main' : attendanceRate >= 50 ? 'warning.main' : 'error.main'}>
                                            {attendanceRate}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={attendanceRate}
                                        sx={{ height: 10, borderRadius: 1 }}
                                        color={attendanceRate >= 75 ? 'success' : attendanceRate >= 50 ? 'warning' : 'error'} />
                                </Box>

                                {/* Status breakdown */}
                                <Grid container spacing={2}>
                                    {[
                                        { label: 'Present', count: presentCount, color: 'success', icon: <CheckCircle fontSize="small" /> },
                                        { label: 'Late',    count: lateCount,    color: 'warning', icon: <AccessTime fontSize="small" /> },
                                        { label: 'Absent',  count: absentCount,  color: 'error',   icon: <Cancel fontSize="small" /> },
                                    ].map(s => (
                                        <Grid item xs={4} key={s.label} textAlign="center">
                                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: `${s.color}.50`, border: `1px solid`, borderColor: `${s.color}.200` }}>
                                                <Box display="flex" justifyContent="center" color={`${s.color}.main`} mb={0.5}>
                                                    {s.icon}
                                                </Box>
                                                <Typography variant="h5" fontWeight="bold" color={`${s.color}.main`}>
                                                    {s.count}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Grades Overview */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">Grades Overview</Typography>
                            <Button size="small" onClick={() => navigate('/admin/grades')}>View Details</Button>
                        </Box>

                        {grades.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                No grades recorded yet
                            </Typography>
                        ) : (
                            <Box>
                                {/* Average score */}
                                <Box display="flex" gap={3} mb={3}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                                            {avgScore}%
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                                    </Box>
                                    <Box textAlign="center">
                                        <Typography variant="h4" fontWeight="bold" color="success.main">
                                            {grades.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Graded</Typography>
                                    </Box>
                                </Box>

                                {/* Grade band breakdown */}
                                {[
                                    { label: 'Excellent (A)',  count: topGrades, color: 'success' },
                                    { label: 'Good (B–C)',     count: midGrades, color: 'primary' },
                                    { label: 'Needs Help (D/F)', count: lowGrades, color: 'error' },
                                ].map(band => {
                                    const pct = grades.length > 0 ? Math.round((band.count / grades.length) * 100) : 0;
                                    return (
                                        <Box key={band.label} mb={1.5}>
                                            <Box display="flex" justifyContent="space-between" mb={0.3}>
                                                <Typography variant="caption" color="text.secondary">{band.label}</Typography>
                                                <Typography variant="caption" fontWeight="bold">{band.count} ({pct}%)</Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={pct}
                                                sx={{ height: 8, borderRadius: 1 }}
                                                color={band.color} />
                                        </Box>
                                    );
                                })}

                                {/* Recent graded students */}
                                <Box mt={2}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        Recent Results
                                    </Typography>
                                    {grades.slice(0, 3).map(g => (
                                        <Box key={g.id} display="flex" justifyContent="space-between"
                                            alignItems="center" mt={1}>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                                                {g.studentName}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {g.score.toFixed(1)}%
                                                </Typography>
                                                <Chip label={scoreToGrade(g.score)} size="small"
                                                    color={gradeColor(scoreToGrade(g.score))} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Bottom row: Recent Activity + Events + Quick Stats */}
            <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                            <Button size="small" onClick={() => navigate('/admin/reports')}>View All</Button>
                        </Box>
                        <List>
                            {recentLogs.length > 0 ? recentLogs.map(log => (
                                <ListItem key={log.id} divider sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                                            {log.user.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={log.action}
                                        secondary={
                                            <Box component="span" display="flex" gap={1} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">{log.user}</Typography>
                                                <Typography variant="caption" color="text.disabled">• {log.timestamp}</Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            )) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                    No recent activity
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Sidebar: Events + Quick Stats */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Grid container spacing={3}>
                        {/* Upcoming Events */}
                        <Grid item size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
                                    <Event color="primary" />
                                </Box>
                                {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                    <Card key={event.id} variant="outlined" sx={{ mb: 1, borderRadius: 1 }}>
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">{event.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(event.date), 'MMM dd, yyyy')}
                                                    </Typography>
                                                </Box>
                                                <Chip label={event.type} size="small"
                                                    color={event.type === 'exam' ? 'error' : event.type === 'meeting' ? 'warning' : 'default'} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        No upcoming events
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        {/* Quick Stats */}
                        <Grid item size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>Quick Stats</Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FactCheck color="success" fontSize="small" />
                                            <Typography variant="body2">Attendance Rate</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold"
                                            color={attendanceRate == null ? 'text.disabled' : attendanceRate >= 75 ? 'success.main' : attendanceRate >= 50 ? 'warning.main' : 'error.main'}>
                                            {attendanceRate != null ? `${attendanceRate}%` : '—'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Grade color="primary" fontSize="small" />
                                            <Typography variant="body2">Average Score</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            {avgScore != null ? `${avgScore}%` : '—'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <TrendingUp color="warning" fontSize="small" />
                                            <Typography variant="body2">Total Students</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                                            {stats.totalStudents}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
