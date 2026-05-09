/**
 * Admin Dashboard Overview
 * 
 * Main dashboard showing platform statistics, recent activity,
 * and quick actions for administrators.
 */
import { Box, Grid, Paper, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Button } from '@mui/material';
import { People, School, FactCheck, TrendingUp, Event, Person, Class, Grade } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { format } from 'date-fns';

// Statistics Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
            height: '100%'
        }}
    >
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={color}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
                {icon}
            </Avatar>
        </Box>
    </Paper>
);

const AdminDashboard = () => {
    const { stats, users, systemLogs, events, attendance, grades } = useAdmin();

    // Get recent logs (last 5)
    const recentLogs = systemLogs.slice(0, 5);

    // Get upcoming events
    const upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Active students and teachers separately
    const activeStudents = users.filter(u => u.role === 'Student' && u.status === 'active').length;
    const activeTeachers = users.filter(u => u.role === 'Teacher' && u.status === 'active').length;

    // ── Real quick stats ──────────────────────────────────────
    // Attendance rate: (Present + Late) / total records
    const attendanceRate = attendance.length > 0
        ? Math.round(
            (attendance.filter(r => r.status === 'Present' || r.status === 'Late').length
            / attendance.length) * 100
          )
        : null;

    // Average GPA from weighted grade totals
    const avgGPA = grades.length > 0
        ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length / 25).toFixed(2)
        : null;
    // grades.score is out of 100; GPA scale is 0–4, so divide by 25

    // Total enrollments count
    const totalEnrollments = users.filter(u => u.role === 'Student').length;

    return (
        <Box>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back! Here&apos;s what&apos;s happening on your platform.
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        icon={<People />}
                        color="#1976d2"
                        subtitle={`${activeStudents} active students`}
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Teachers"
                        value={stats.totalTeachers}
                        icon={<Person />}
                        color="#2e7d32"
                        subtitle={`${activeTeachers} active teachers`}
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Active Courses"
                        value={stats.totalCourses}
                        icon={<School />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Classes Today"
                        value={stats.activeClasses}
                        icon={<Class />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                Recent Activity
                            </Typography>
                            <Button size="small" href="/admin/reports">View All</Button>
                        </Box>
                        <List>
                            {recentLogs.length > 0 ? recentLogs.map((log) => (
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
                                                <Typography variant="caption" color="text.secondary">
                                                    {log.user}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    • {log.timestamp}
                                                </Typography>
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

                {/* Sidebar */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Grid container spacing={3}>
                        {/* Upcoming Events */}
                        <Grid item size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Upcoming Events
                                    </Typography>
                                    <Event color="primary" />
                                </Box>
                                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                                    <Card key={event.id} variant="outlined" sx={{ mb: 1, borderRadius: 1 }}>
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {event.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(event.date), 'MMM dd, yyyy')}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={event.type}
                                                    size="small"
                                                    color={event.type === 'exam' ? 'error' : event.type === 'meeting' ? 'warning' : 'default'}
                                                />
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
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Quick Stats
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FactCheck color="success" fontSize="small" />
                                            <Typography variant="body2">Attendance Rate</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold"
                                            color={
                                                attendanceRate == null ? 'text.disabled'
                                                : attendanceRate >= 75 ? 'success.main'
                                                : attendanceRate >= 50 ? 'warning.main' : 'error.main'
                                            }>
                                            {attendanceRate != null ? `${attendanceRate}%` : '—'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Grade color="primary" fontSize="small" />
                                            <Typography variant="body2">Average Score</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            {avgGPA != null
                                                ? `${(grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)}%`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <TrendingUp color="warning" fontSize="small" />
                                            <Typography variant="body2">Total Students</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                                            {totalEnrollments}
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
