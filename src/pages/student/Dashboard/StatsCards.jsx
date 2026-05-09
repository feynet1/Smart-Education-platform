import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { School, TrendingUp, CheckCircle, EventAvailable } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';

const StatCard = ({ title, value, icon, color, suffix = '', loading = false }) => (
    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, mr: 2, flexShrink: 0 }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="bold">
                {loading ? <CircularProgress size={24} /> : `${value}${suffix}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </Box>
    </Paper>
);

const StatsCards = () => {
    const {
        enrolledCourses,
        gpa,
        attendancePercentage,
        attendanceLoading,
        attendanceRecords,
        activeSessions,
    } = useStudent();

    // Count today's active sessions
    const activeSessionCount = Object.keys(activeSessions).length;

    // Total sessions attended (present + late)
    const totalAttended = attendanceRecords.filter(
        r => r.status === 'Present' || r.status === 'Late'
    ).length;

    const stats = [
        {
            title: 'Overall GPA',
            value: gpa,
            icon: <TrendingUp />,
            color: 'primary',
        },
        {
            title: 'Attendance Rate',
            value: attendancePercentage != null ? attendancePercentage : '—',
            suffix: attendancePercentage != null ? '%' : '',
            icon: <CheckCircle />,
            color: attendancePercentage == null ? 'info'
                 : attendancePercentage >= 75 ? 'success'
                 : attendancePercentage >= 50 ? 'warning' : 'error',
            loading: attendanceLoading,
        },
        {
            title: 'Enrolled Courses',
            value: enrolledCourses.length,
            icon: <School />,
            color: 'info',
        },
        {
            title: activeSessionCount > 0 ? 'Live Sessions Now' : 'Sessions Attended',
            value: activeSessionCount > 0 ? activeSessionCount : totalAttended,
            icon: <EventAvailable />,
            color: activeSessionCount > 0 ? 'error' : 'warning',
        },
    ];

    return (
        <Grid container spacing={3} mb={4}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
