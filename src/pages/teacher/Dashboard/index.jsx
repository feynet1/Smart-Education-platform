import { useState } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, Card, CardContent, CircularProgress, Tooltip, IconButton } from '@mui/material';
import { Add, Event, Refresh } from '@mui/icons-material';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useTeacher } from '../../../contexts/TeacherContext';
import useEvents from '../../../hooks/useEvents';
import { format } from 'date-fns';

const TYPE_COLORS = { academic: 'default', exam: 'error', meeting: 'warning', holiday: 'success' };

const TeacherDashboardHome = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { courses, activeSession, fetchCourses, fetchTeacherLogs } = useTeacher();
    const { events: upcomingEvents, loading: eventsLoading } = useEvents('teachers');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchCourses(), fetchTeacherLogs()]);
        setRefreshing(false);
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" mb={4}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom
                        sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                        Welcome back, {profile?.name || 'Teacher'} 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You have {courses.length} course{courses.length !== 1 ? 's' : ''}.
                        {activeSession ? ' 🟢 A session is currently active.' : ''}
                    </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title="Refresh dashboard">
                        <IconButton onClick={handleRefresh} disabled={refreshing}>
                            {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                        </IconButton>
                    </Tooltip>
                    <Button variant="contained" startIcon={<Add />}
                        onClick={() => navigate('/teacher/courses')} size="small">
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Create New Course</Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>New Course</Box>
                    </Button>
                </Box>
            </Box>

            <StatsCards />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <RecentActivity />
                </Grid>

                {/* Upcoming Events from Supabase */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
                            <Event color="primary" />
                        </Box>
                        {eventsLoading ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : upcomingEvents.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                No upcoming events
                            </Typography>
                        ) : upcomingEvents.slice(0, 4).map(event => (
                            <Card key={event.id} variant="outlined" sx={{ mb: 1, borderRadius: 1 }}>
                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {event.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(event.date + 'T00:00:00'), 'MMM dd, yyyy')}
                                            </Typography>
                                        </Box>
                                        <Chip label={event.type} size="small"
                                            color={TYPE_COLORS[event.type] || 'default'} />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherDashboardHome;
