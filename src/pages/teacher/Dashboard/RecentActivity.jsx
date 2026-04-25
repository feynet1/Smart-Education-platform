import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Typography, Box, Divider } from '@mui/material';
import { School, FactCheck, Note, PlayArrow } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = () => {
    const { courses, activeSession } = useTeacher();

    // Build activity list from real data
    const activities = [];

    // Active session
    if (activeSession) {
        activities.push({
            id: 'session',
            text: `Live session is active`,
            time: `Started ${formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true })}`,
            icon: <PlayArrow />,
            color: 'success.main',
        });
    }

    // Recent courses (last 4)
    courses.slice(0, 4).forEach(course => {
        activities.push({
            id: course.id,
            text: `Course "${course.name}" — ${course.subject} (Grade ${course.grade})`,
            time: formatDistanceToNow(new Date(course.createdAt), { addSuffix: true }),
            icon: <School />,
            color: 'primary.main',
        });
    });

    // Fallback if nothing
    if (activities.length === 0) {
        activities.push({
            id: 'empty',
            text: 'No recent activity yet. Create a course to get started.',
            time: '',
            icon: <Note />,
            color: 'text.secondary',
        });
    }

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
            </Typography>
            <List>
                {activities.map((activity, index) => (
                    <Box key={activity.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar sx={{
                                    bgcolor: 'background.paper',
                                    color: activity.color,
                                    border: '1px solid',
                                    borderColor: activity.color,
                                }}>
                                    {activity.icon}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={activity.text}
                                secondary={
                                    <Typography component="span" variant="caption" color="text.secondary">
                                        {activity.time}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                ))}
            </List>
        </Paper>
    );
};

export default RecentActivity;
