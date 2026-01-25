import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import { useNavigate } from 'react-router-dom';

const TeacherDashboardHome = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back, manage your courses and students.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/teacher/courses')}
                    size="large"
                >
                    Create New Course
                </Button>
            </Box>

            <StatsCards />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Calendar Placeholder or Schedule */}
                    <Paper elevation={2} sx={{ p: 3, height: '100%', minHeight: 400 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Upcoming Schedule
                        </Typography>
                        <Box display="flex" justifyContent="center" alignItems="center" height="80%" color="text.secondary">
                            (Calendar Integration Placeholder)
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <RecentActivity />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherDashboardHome;
