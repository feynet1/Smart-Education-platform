import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { School, People, Class, Assignment } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';

const StatCard = ({ title, value, icon, color, loading }) => (
    <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 3 }, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, mr: { xs: 1, sm: 2 }, display: { xs: 'none', sm: 'flex' } }}>
            {icon}
        </Box>
        <Box>
            {loading ? (
                <CircularProgress size={28} color={color} />
            ) : (
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>{value}</Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{title}</Typography>
        </Box>
    </Paper>
);

const StatsCards = () => {
    const { courses, coursesLoading, students, activeSession, sessionAttendance } = useTeacher();

    const totalCourses  = courses.length;
    const activeClasses = activeSession ? 1 : 0;
    const studentsToday = activeSession ? sessionAttendance.length : 0;
    // students = deduplicated enrolled students across all this teacher's courses
    const totalEnrolled = students.length;

    const stats = [
        { title: 'Total Courses',    value: totalCourses,   icon: <School />,     color: 'primary',   loading: coursesLoading },
        { title: 'Active Classes',   value: activeClasses,  icon: <Class />,      color: 'secondary', loading: false },
        { title: 'Students Today',   value: studentsToday,  icon: <People />,     color: 'success',   loading: false },
        { title: 'Enrolled Students', value: totalEnrolled, icon: <Assignment />, color: 'warning',   loading: false },
    ];

    return (
        <Grid container spacing={3} mb={4}>
            {stats.map((stat, index) => (
                <Grid item xs={6} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
