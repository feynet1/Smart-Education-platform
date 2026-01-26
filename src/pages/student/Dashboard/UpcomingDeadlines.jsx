import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Assignment, AccessTime } from '@mui/icons-material';
import { differenceInHours, differenceInDays, parseISO } from 'date-fns';

const UpcomingDeadlines = () => {
    // Mock deadlines data
    const deadlines = [
        { id: 1, title: 'Math Assignment 3', course: 'Calculus', dueDate: '2026-01-28T23:59:00' },
        { id: 2, title: 'Physics Lab Report', course: 'Physics 101', dueDate: '2026-01-30T17:00:00' },
        { id: 3, title: 'History Essay', course: 'World History', dueDate: '2026-02-05T12:00:00' },
    ];

    const getDeadlineColor = (dueDate) => {
        const now = new Date();
        const due = parseISO(dueDate);
        const hoursLeft = differenceInHours(due, now);
        const daysLeft = differenceInDays(due, now);

        if (hoursLeft < 24) return 'error';
        if (daysLeft < 3) return 'warning';
        return 'success';
    };

    const getTimeLeft = (dueDate) => {
        const now = new Date();
        const due = parseISO(dueDate);
        const hoursLeft = differenceInHours(due, now);
        const daysLeft = differenceInDays(due, now);

        if (hoursLeft < 24) return `${hoursLeft}h left`;
        return `${daysLeft} days left`;
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Upcoming Deadlines
            </Typography>
            <List>
                {deadlines.map((deadline) => (
                    <ListItem key={deadline.id} divider>
                        <ListItemIcon>
                            <Assignment color={getDeadlineColor(deadline.dueDate)} />
                        </ListItemIcon>
                        <ListItemText
                            primary={deadline.title}
                            secondary={deadline.course}
                        />
                        <Chip
                            icon={<AccessTime />}
                            label={getTimeLeft(deadline.dueDate)}
                            size="small"
                            color={getDeadlineColor(deadline.dueDate)}
                            variant="outlined"
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default UpcomingDeadlines;
