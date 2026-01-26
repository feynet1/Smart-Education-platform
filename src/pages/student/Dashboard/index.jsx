import { Box, Typography, Grid, Paper, Card, CardContent, CardActionArea, LinearProgress, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { School, Notifications, Grade } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useStudent } from '../../../contexts/StudentContext';
import useAuth from '../../../hooks/useAuth';

const StudentDashboardHome = () => {
    const { user } = useAuth();
    const { enrolledCourses, grades } = useStudent();
    const navigate = useNavigate();

    // Mock notifications
    const notifications = [
        { id: 1, text: 'New grade posted for Calculus', time: '2 hours ago', icon: <Grade color="primary" /> },
        { id: 2, text: 'Physics notes uploaded', time: '1 day ago', icon: <School color="success" /> },
    ];

    return (
        <Box>
            {/* Welcome Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.name}! 👋
                </Typography>
                <Typography variant="body1">
                    Spring Semester 2026 • Your academic journey continues!
                </Typography>
            </Paper>

            {/* Stats */}
            <StatsCards />

            <Grid container spacing={3}>
                {/* Enrolled Courses */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            My Courses
                        </Typography>
                        {enrolledCourses.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="body1" color="text.secondary">
                                    No courses yet. Click "Join Class" to enroll!
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {enrolledCourses.map((course) => (
                                    <Grid item xs={12} sm={6} key={course.id}>
                                        <Card elevation={1}>
                                            <CardActionArea onClick={() => navigate(`/student/courses/${course.id}`)}>
                                                <CardContent>
                                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                                        <Typography variant="overline" color="text.secondary">
                                                            {course.subject}
                                                        </Typography>
                                                        <Chip label={`Grade ${course.grade}`} size="small" color="primary" variant="outlined" />
                                                    </Box>
                                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                        {course.name}
                                                    </Typography>
                                                    <Box mt={2}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Progress
                                                        </Typography>
                                                        <LinearProgress variant="determinate" value={(parseInt(course.id, 36) % 60) + 30} sx={{ mt: 0.5, borderRadius: 1 }} />
                                                    </Box>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Sidebar Widgets */}
                <Grid item xs={12} md={4}>
                    <UpcomingDeadlines />

                    {/* Notifications */}
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Notifications
                        </Typography>
                        <List dense>
                            {notifications.map((notification) => (
                                <ListItem key={notification.id}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'background.paper' }}>
                                            {notification.icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={notification.text}
                                        secondary={notification.time}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    {/* Recent Grades */}
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Recent Grades
                        </Typography>
                        <List dense>
                            {grades.slice(0, 3).map((grade) => (
                                <ListItem key={grade.id}>
                                    <ListItemText
                                        primary={grade.assessment}
                                        secondary={grade.subject}
                                    />
                                    <Chip label={grade.grade} size="small" color="primary" />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentDashboardHome;
