import {
    Box, Typography, Paper, Grid, List, ListItem,
    ListItemText, Chip, CircularProgress, Divider, Alert,
} from '@mui/material';
import { Event, Announcement, CalendarMonth, School, Groups, BeachAccess, Assignment as AssignmentIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import useEvents from '../../../hooks/useEvents';
import { useStudent } from '../../../contexts/StudentContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import useAuth from '../../../hooks/useAuth';

const TYPE_CONFIG = {
    academic: { color: 'primary',   icon: <School fontSize="small" />,      label: 'Academic' },
    exam:     { color: 'error',     icon: <Event fontSize="small" />,        label: 'Exam' },
    meeting:  { color: 'warning',   icon: <Groups fontSize="small" />,       label: 'Meeting' },
    holiday:  { color: 'success',   icon: <BeachAccess fontSize="small" />,  label: 'Holiday' },
};

const StudentEvents = () => {
    const { events, loading } = useEvents('students');
    const { enrollments } = useStudent();
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    // Fetch upcoming assignments for enrolled courses
    useEffect(() => {
        if (!enrollments.length || !user?.id) return;
        const load = async () => {
            setLoadingAssignments(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data } = await supabase
                    .from('assignments')
                    .select('*, courses(name)')
                    .in('course_id', enrollments)
                    .gte('due_date', today)
                    .order('due_date', { ascending: true });
                setAssignments(data || []);
            } catch (err) {
                console.error('Failed to load assignments:', err);
            } finally {
                setLoadingAssignments(false);
            }
        };
        load();
    }, [enrollments, user?.id]);

    const today = new Date().toISOString().split('T')[0];

    const todayEvents   = events.filter(e => e.date === today);
    const examEvents    = events.filter(e => e.type === 'exam');
    const otherEvents   = events.filter(e => e.type !== 'exam');

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Events & Schedule</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : events.length === 0 ? (
                <Alert severity="info">No upcoming events at the moment.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {/* Today's Events */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <CalendarMonth color="primary" />
                                <Typography variant="h6" fontWeight="bold">Today's Events</Typography>
                            </Box>
                            {todayEvents.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" py={1}>
                                    No events scheduled for today.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {todayEvents.map((event, i) => {
                                        const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.academic;
                                        return (
                                            <ListItem key={event.id} divider={i < todayEvents.length - 1} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={event.title}
                                                    secondary={event.description || cfg.label}
                                                />
                                                <Chip label={event.type} size="small" color={cfg.color} />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Upcoming Exams */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Event color="error" />
                                <Typography variant="h6" fontWeight="bold">Upcoming Exams</Typography>
                            </Box>
                            {examEvents.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" py={1}>
                                    No upcoming exams.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {examEvents.map((event, i) => (
                                        <ListItem key={event.id} divider={i < examEvents.length - 1} sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={event.title}
                                                secondary={format(new Date(event.date + 'T00:00:00'), 'EEEE, MMM dd, yyyy')}
                                            />
                                            <Chip label="Exam" size="small" color="error" variant="outlined" />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Upcoming Assignments from Teachers */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <AssignmentIcon color="primary" />
                                <Typography variant="h6" fontWeight="bold">
                                    Upcoming Assignments ({assignments.length})
                                </Typography>
                            </Box>
                            {loadingAssignments ? (
                                <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                            ) : assignments.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No upcoming assignments.</Typography>
                            ) : (
                                <List disablePadding>
                                    {assignments.map((item, i) => (
                                        <Box key={item.id}>
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="body2" fontWeight="medium">{item.title}</Typography>
                                                            <Chip label={item.type} size="small" color="primary" variant="outlined" />
                                                        </Box>
                                                    }
                                                    secondary={`${item.courses?.name} • Due: ${format(new Date(item.due_date + 'T00:00:00'), 'MMM dd, yyyy')}`}
                                                />
                                            </ListItem>
                                            {i < assignments.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* All Upcoming Events */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Announcement color="warning" />
                                <Typography variant="h6" fontWeight="bold">
                                    All Upcoming Events ({otherEvents.length})
                                </Typography>
                            </Box>
                            {otherEvents.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No other events scheduled.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {otherEvents.map((event, i) => {
                                        const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.academic;
                                        return (
                                            <Box key={event.id}>
                                                <ListItem sx={{ px: 0 }}>
                                                    <ListItemText
                                                        primary={event.title}
                                                        secondary={
                                                            <Box component="span" display="flex" gap={1} alignItems="center">
                                                                <span>{format(new Date(event.date + 'T00:00:00'), 'MMM dd, yyyy')}</span>
                                                                {event.description && <span>— {event.description}</span>}
                                                            </Box>
                                                        }
                                                    />
                                                    <Chip
                                                        icon={cfg.icon}
                                                        label={cfg.label}
                                                        size="small"
                                                        color={cfg.color}
                                                        variant="outlined"
                                                    />
                                                </ListItem>
                                                {i < otherEvents.length - 1 && <Divider />}
                                            </Box>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default StudentEvents;
