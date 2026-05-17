import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, CardActionArea,
    LinearProgress, Chip, Avatar, List, ListItem, ListItemAvatar,
    ListItemText, CircularProgress, Button,
} from '@mui/material';
import { School, PlayArrow, Assignment, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useStudent } from '../../../contexts/StudentContext';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../supabaseClient';
import { formatDistanceToNow } from 'date-fns';
const StudentDashboardHome = () => {
    const { profile } = useAuth();
    const { user } = useAuth();
    const { enrolledCourses, enrollments, activeSessions, courseAttendanceStats,
            fetchActiveSessions, fetchAttendanceHistory } = useStudent();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        if (!enrollments.length) return;
        setLoadingNotifs(true);
        const notifs = [];
        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data: notes } = await supabase
                .from('course_notes')
                .select('id, file_name, created_at, courses(name)')
                .in('course_id', enrollments)
                .gte('created_at', threeDaysAgo)
                .order('created_at', { ascending: false })
                .limit(3);

            (notes || []).forEach(n => notifs.push({
                id: `note-${n.id}`,
                text: `New file "${n.file_name}" in ${n.courses?.name}`,
                time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
                icon: <School color="success" />,
            }));

            const { data: assignments } = await supabase
                .from('assignments')
                .select('id, title, created_at, courses(name)')
                .in('course_id', enrollments)
                .gte('created_at', threeDaysAgo)
                .order('created_at', { ascending: false })
                .limit(3);

            (assignments || []).forEach(a => notifs.push({
                id: `assign-${a.id}`,
                text: `New assignment "${a.title}" in ${a.courses?.name}`,
                time: formatDistanceToNow(new Date(a.created_at), { addSuffix: true }),
                icon: <Assignment color="primary" />,
            }));

            Object.entries(activeSessions).forEach(([courseId, session]) => {
                const course = enrolledCourses.find(c => c.id === courseId);
                notifs.push({
                    id: `session-${session.id}`,
                    text: `Live session active in ${course?.name || 'a course'}`,
                    time: formatDistanceToNow(new Date(session.started_at), { addSuffix: true }),
                    icon: <PlayArrow color="error" />,
                });
            });

            notifs.sort((a, b) => a.time > b.time ? 1 : -1);
            setNotifications(notifs.slice(0, 5));
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoadingNotifs(false);
        }
    }, [enrollments, activeSessions, enrolledCourses]);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchActiveSessions(),
            fetchAttendanceHistory(),
            loadNotifications(),
        ]);
        setRefreshing(false);
    };

    return (
        <Box>
            {/* Welcome */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start"
                    sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom
                            sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                            Welcome back, {profile?.name || user?.email?.split('@')[0]}! 👋
                        </Typography>
                        <Typography variant="body1">
                            {Object.keys(activeSessions).length > 0
                                ? `🟢 ${Object.keys(activeSessions).length} live session(s) active right now!`
                                : 'Your academic journey continues!'}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.15)' } }}>
                        Refresh
                    </Button>
                </Box>
            </Paper>

            <StatsCards />

            <Grid container spacing={3}>
                {/* Enrolled Courses */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">My Courses</Typography>
                        {enrolledCourses.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="body1" color="text.secondary">
                                    No courses yet. Click "Join Class" to enroll!
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {enrolledCourses.map((course) => {
                                    const hasSession = !!activeSessions[course.id];
                                    return (
                                        <Grid item xs={12} sm={6} key={course.id}>
                                            <Card elevation={1} sx={{
                                                border: hasSession ? '2px solid #2e7d32' : '1px solid transparent',
                                            }}>
                                                <CardActionArea onClick={() => navigate(`/student/courses/${course.id}`)}>
                                                    <CardContent>
                                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                                            <Typography variant="overline" color="text.secondary">
                                                                {course.subject}
                                                            </Typography>
                                                            <Box display="flex" gap={0.5}>
                                                                {hasSession && <Chip label="Live" color="success" size="small" />}
                                                                <Chip label={`Grade ${course.grade}`} size="small" color="primary" variant="outlined" />
                                                            </Box>
                                                        </Box>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            {course.name}
                                                        </Typography>
                                                        <Box mt={1}>
                                                            {(() => {
                                                                const stats = courseAttendanceStats[course.id];
                                                                if (!stats || stats.total === 0) {
                                                                    return (
                                                                        <Typography variant="caption" color="text.disabled">
                                                                            No sessions yet
                                                                        </Typography>
                                                                    );
                                                                }
                                                                const pct = stats.percentage;
                                                                const color = pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error';
                                                                return (
                                                                    <>
                                                                        <Box display="flex" justifyContent="space-between">
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Attendance
                                                                            </Typography>
                                                                            <Typography variant="caption" fontWeight="bold" color={`${color}.main`}>
                                                                                {pct}%
                                                                            </Typography>
                                                                        </Box>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={pct}
                                                                            color={color}
                                                                            sx={{ mt: 0.5, borderRadius: 1 }} />
                                                                    </>
                                                                );
                                                            })()}
                                                        </Box>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <UpcomingDeadlines />

                    {/* Notifications */}
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Notifications</Typography>
                        {loadingNotifs ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                No new notifications
                            </Typography>
                        ) : (
                            <List dense disablePadding>
                                {notifications.map((n) => (
                                    <ListItem key={n.id} sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'background.paper', width: 32, height: 32 }}>
                                                {n.icon}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={n.text}
                                            secondary={n.time}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentDashboardHome;
