/**
 * Admin Events Management
 * 
 * Create, edit, and manage platform-wide events.
 * Supports academic events, exams, meetings, and holidays.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { Add, Edit, Delete, Event, CalendarMonth } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { format } from 'date-fns';

const EventsManagement = () => {
    const { events, addEvent, deleteEvent } = useAdmin();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'academic', target: 'all' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Event type colors
    const typeColors = {
        academic: 'primary',
        exam: 'error',
        meeting: 'warning',
        holiday: 'success',
    };

    // Handle create event
    const handleCreate = () => {
        if (!newEvent.title || !newEvent.date) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        addEvent(newEvent);
        setSnackbar({ open: true, message: 'Event created successfully', severity: 'success' });
        setDialogOpen(false);
        setNewEvent({ title: '', date: '', type: 'academic', target: 'all' });
    };

    // Handle delete event
    const handleDelete = (eventId) => {
        deleteEvent(eventId);
        setSnackbar({ open: true, message: 'Event deleted', severity: 'info' });
    };

    // Separate upcoming and past events
    const today = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
    const pastEvents = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Events Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage academic calendar and platform events
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    Create Event
                </Button>
            </Box>

            {/* Upcoming Events */}
            <Typography variant="h6" fontWeight="bold" mb={2}>
                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upcoming Events ({upcomingEvents.length})
            </Typography>

            {upcomingEvents.length > 0 ? (
                <Grid container spacing={3} mb={4}>
                    {upcomingEvents.map((event) => (
                        <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Chip
                                            label={event.type}
                                            size="small"
                                            color={typeColors[event.type] || 'default'}
                                        />
                                        <IconButton size="small" onClick={() => handleDelete(event.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {event.title}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                        <Event fontSize="small" />
                                        <Typography variant="body2">
                                            {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`For: ${event.target}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', mb: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography color="text.secondary">No upcoming events</Typography>
                </Paper>
            )}

            {/* Past Events */}
            <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
                Past Events ({pastEvents.length})
            </Typography>

            {pastEvents.length > 0 ? (
                <Grid container spacing={2}>
                    {pastEvents.slice(0, 6).map((event) => (
                        <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid #e0e0e0',
                                    opacity: 0.7,
                                    bgcolor: '#fafafa'
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {event.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(event.date), 'MMM dd, yyyy')}
                                        </Typography>
                                    </Box>
                                    <Chip label={event.type} size="small" variant="outlined" />
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography color="text.disabled">No past events</Typography>
            )}

            {/* Create Event Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField
                            fullWidth
                            label="Event Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Event Type</InputLabel>
                            <Select
                                value={newEvent.type}
                                label="Event Type"
                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                            >
                                <MenuItem value="academic">Academic</MenuItem>
                                <MenuItem value="exam">Exam</MenuItem>
                                <MenuItem value="meeting">Meeting</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Target Audience</InputLabel>
                            <Select
                                value={newEvent.target}
                                label="Target Audience"
                                onChange={(e) => setNewEvent({ ...newEvent, target: e.target.value })}
                            >
                                <MenuItem value="all">All Users</MenuItem>
                                <MenuItem value="students">Students Only</MenuItem>
                                <MenuItem value="teachers">Teachers Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default EventsManagement;
