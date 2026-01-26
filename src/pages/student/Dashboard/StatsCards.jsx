import { Grid, Paper, Typography, Box } from '@mui/material';
import { School, TrendingUp, EventAvailable, CheckCircle } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';

const StatCard = ({ title, value, icon, color, suffix = '' }) => (
    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="bold">
                {value}{suffix}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </Box>
    </Paper>
);

const StatsCards = () => {
    const { enrolledCourses, gpa, attendancePercentage } = useStudent();

    const stats = [
        { title: 'Overall GPA', value: gpa, icon: <TrendingUp />, color: 'primary' },
        { title: 'Attendance', value: attendancePercentage, icon: <CheckCircle />, color: 'success', suffix: '%' },
        { title: 'Enrolled Courses', value: enrolledCourses.length, icon: <School />, color: 'info' },
        { title: 'Classes Today', value: 2, icon: <EventAvailable />, color: 'warning' }, // Mock
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
