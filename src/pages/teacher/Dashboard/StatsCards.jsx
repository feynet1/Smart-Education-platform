import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { School, People, Class, Assignment } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';

const StatCard = ({ title, value, icon, color, loading }) => (
    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
        </Box>
        <Box>
            {loading ? (
                <CircularProgress size={28} color={color} />
            ) : (
                <Typography variant="h4" fontWeight="bold">{value}</Typography>
            )}
            <Typography variant="body2" color="text.secondary">{title}</Typography>
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
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
