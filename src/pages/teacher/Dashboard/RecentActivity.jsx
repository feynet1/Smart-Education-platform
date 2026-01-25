import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Typography, Box, Divider } from '@mui/material';
import { Notifications, Comment, AssignmentTurnedIn } from '@mui/icons-material';

const RecentActivity = () => {
    const activities = [
        { id: 1, text: 'You created a new course "Physics 101"', time: '2 hours ago', icon: <Notifications />, color: 'primary.main' },
        { id: 2, text: 'Assignment "Lab Report" submitted by 5 students', time: '4 hours ago', icon: <AssignmentTurnedIn />, color: 'success.main' },
        { id: 3, text: 'New comment on "Calculus II"', time: '1 day ago', icon: <Comment />, color: 'info.main' },
        { id: 4, text: 'Attendance updated for "History"', time: 'Yesterday', icon: <Notifications />, color: 'warning.main' },
    ];

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
                                <Avatar sx={{ bgcolor: 'background.paper', color: activity.color, border: `1px solid`, borderColor: activity.color }}>
                                    {activity.icon}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={activity.text}
                                secondary={
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                    >
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
