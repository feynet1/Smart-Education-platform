import { Box, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Chip, Button, Divider } from '@mui/material';
import { Event, AccessTime, Announcement, VideoCall, CalendarMonth } from '@mui/icons-material';
import { format, addDays } from 'date-fns';

const Events = () => {
    // Mock events data
    const todaysClasses = [
        { id: 1, name: 'Calculus II', time: '09:00 AM', room: 'Room 101' },
        { id: 2, name: 'Physics Lab', time: '02:00 PM', room: 'Lab 3' },
    ];

    const upcomingExams = [
        { id: 1, subject: 'Mathematics', date: format(addDays(new Date(), 7), 'MMM dd, yyyy'), type: 'Midterm' },
        { id: 2, subject: 'Physics', date: format(addDays(new Date(), 14), 'MMM dd, yyyy'), type: 'Quiz' },
    ];

    const announcements = [
        { id: 1, title: 'Campus Closed - Holiday', date: 'Jan 28, 2026', priority: 'high' },
        { id: 2, title: 'Library Extended Hours', date: 'Jan 25, 2026', priority: 'low' },
        { id: 3, title: 'Registration Opens for Summer', date: 'Jan 20, 2026', priority: 'medium' },
    ];

    const getPriorityColor = (priority) => {
        if (priority === 'high') return 'error';
        if (priority === 'medium') return 'warning';
        return 'default';
    };

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Events & Schedule
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Today's Classes */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CalendarMonth color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Today's Classes
                            </Typography>
                        </Box>
                        <List>
                            {todaysClasses.map((cls) => (
                                <ListItem key={cls.id} divider sx={{ py: 2 }}>
                                    <ListItemIcon>
                                        <AccessTime color="action" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={cls.name}
                                        secondary={`${cls.time} • ${cls.room}`}
                                    />
                                    <Button variant="contained" size="small" startIcon={<VideoCall />}>
                                        Join
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Upcoming Exams */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Event color="error" />
                            <Typography variant="h6" fontWeight="bold">
                                Upcoming Exams
                            </Typography>
                        </Box>
                        <List>
                            {upcomingExams.map((exam) => (
                                <ListItem key={exam.id} divider>
                                    <ListItemText
                                        primary={exam.subject}
                                        secondary={exam.date}
                                    />
                                    <Chip label={exam.type} size="small" variant="outlined" />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Announcements */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Announcement color="warning" />
                            <Typography variant="h6" fontWeight="bold">
                                Announcements
                            </Typography>
                        </Box>
                        <List>
                            {announcements.map((announcement) => (
                                <ListItem key={announcement.id} divider>
                                    <ListItemText
                                        primary={announcement.title}
                                        secondary={announcement.date}
                                    />
                                    <Chip
                                        label={announcement.priority}
                                        size="small"
                                        color={getPriorityColor(announcement.priority)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Events;
