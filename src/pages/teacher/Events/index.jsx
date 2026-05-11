import {
    Box, Typography, Paper, Grid, List, ListItem,
    ListItemText, Chip, CircularProgress, Divider, Alert,
    IconButton, Tooltip, Snackbar,
} from '@mui/material';
import { Event, Announcement, CalendarMonth, School, Groups, BeachAccess, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import useEvents from '../../../hooks/useEvents';
import { useState, useRef, useEffect } from 'react';

const TYPE_CONFIG = {
    academic: { color: 'primary',   icon: <School fontSize="small" />,      label: 'Academic' },
    exam:     { color: 'error',     icon: <Event fontSize="small" />,        label: 'Exam' },
    meeting:  { color: 'warning',   icon: <Groups fontSize="small" />,       label: 'Meeting' },
    holiday:  { color: 'success',   icon: <BeachAccess fontSize="small" />,  label: 'Holiday' },
};

const TeacherEvents = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { events, loading } = useEvents('teachers', refreshKey);

    // Track whether the current loading cycle was triggered by a manual refresh.
    // Using a ref avoids adding setState calls directly inside the effect body.
    const pendingRefresh = useRef(false);

    useEffect(() => {
        if (pendingRefresh.current && !loading) {
            pendingRefresh.current = false;
            // Schedule state updates outside the synchronous effect body
            const timer = setTimeout(() => {
                setRefreshing(false);
                setSnackbar({ open: true, message: 'Events refreshed', severity: 'success' });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleRefresh = () => {
        pendingRefresh.current = true;
        setRefreshing(true);
        setRefreshKey(k => k + 1);
    };

    const today = new Date().toISOString().split('T')[0];

    const todayEvents = events.filter(e => e.date === today);
    const examEvents  = events.filter(e => e.type === 'exam');
    const otherEvents = events.filter(e => e.type !== 'exam');

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Events & Schedule</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {format(new Date(), 'EEEE, MMMM do, yyyy')}
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <span>
                        <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
                            {refreshing
                                ? <CircularProgress size={20} color="inherit" />
                                : <Refresh />}
                        </IconButton>
                    </span>
                </Tooltip>
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherEvents;
