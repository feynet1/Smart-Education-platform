/**
 * Admin Events Management — fully connected to Supabase
 */
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, Grid, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Chip, IconButton, Snackbar, Alert, Tooltip, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Event, CalendarMonth } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { format } from 'date-fns';

const EMPTY_FORM = { title: '', date: '', type: 'academic', target: 'all', description: '' };

const TYPE_COLORS = {
    academic: 'primary',
    exam: 'error',
    meeting: 'warning',
    holiday: 'success',
};

const EventsManagement = () => {
    const { events, eventsLoading, addEvent, updateEvent, deleteEvent, currentUserRole } = useAdmin();

    const [dialog, setDialog] = useState({ open: false, mode: 'create', event: null });
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, event: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnack = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setDialog({ open: true, mode: 'create', event: null });
    };

    const openEdit = (event) => {
        setForm({
            title: event.title,
            date: event.date,
            type: event.type,
            target: event.target,
            description: event.description || '',
        });
        setDialog({ open: true, mode: 'edit', event });
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.date) {
            showSnack('Title and date are required', 'error');
            return;
        }
        setSaving(true);
        let result;
        if (dialog.mode === 'create') {
            result = await addEvent(form);
            if (result.success) showSnack('Event created successfully');
            else showSnack(result.error || 'Failed to create event', 'error');
        } else {
            result = await updateEvent(dialog.event.id, form);
            if (result.success) showSnack('Event updated successfully');
            else showSnack(result.error || 'Failed to update event', 'error');
        }
        setSaving(false);
        if (result.success) setDialog({ open: false, mode: 'create', event: null });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.event) return;
        const result = await deleteEvent(deleteConfirm.event.id);
        if (result.success) showSnack('Event deleted', 'info');
        else showSnack(result.error || 'Failed to delete event', 'error');
        setDeleteConfirm({ open: false, event: null });
    };

    const today = new Date();
    const upcoming = [...events]
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = [...events]
        .filter(e => new Date(e.date) < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>Events Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage academic calendar and platform events
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
                    Create Event
                </Button>
            </Box>

            {/* Upcoming Events */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarMonth color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    Upcoming Events ({upcoming.length})
                </Typography>
            </Box>

            {eventsLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : upcoming.length > 0 ? (
                <Grid container spacing={3} mb={4}>
                    {upcoming.map((event) => {
                        const canManage = currentUserRole === 'Super Admin' || event.branch_id !== null;
                        return (
                        <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Chip label={event.type} size="small" color={TYPE_COLORS[event.type] || 'default'} />
                                        {canManage && (
                                        <Box>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => openEdit(event)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error"
                                                    onClick={() => setDeleteConfirm({ open: true, event })}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        )}
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {event.title}
                                    </Typography>
                                    {event.description && (
                                        <Typography variant="body2" color="text.secondary" mb={1}>
                                            {event.description}
                                        </Typography>
                                    )}
                                    <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                        <Event fontSize="small" />
                                        <Typography variant="body2">
                                            {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                                        </Typography>
                                    </Box>
                                     <Chip label={`For: ${event.target}`} size="small" variant="outlined" sx={{ mt: 1 }} />
                                     {event.branch_id === null && (
                                         <Chip label="Global Event" size="small" color="secondary" variant="filled" sx={{ mt: 1, ml: 1 }} />
                                     )}
                                </CardContent>
                            </Card>
                        </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', mb: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography color="text.secondary">No upcoming events</Typography>
                </Paper>
            )}

            {/* Past Events */}
            <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
                Past Events ({past.length})
            </Typography>

            {past.length > 0 ? (
                <Grid container spacing={2}>
                    {past.slice(0, 6).map((event) => {
                        const canManage = currentUserRole === 'Super Admin' || event.branch_id !== null;
                        return (
                        <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', opacity: 0.7, bgcolor: '#fafafa' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{event.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(event.date), 'MMM dd, yyyy')}
                                        </Typography>
                                        {event.branch_id === null && (
                                            <Chip label="Global" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                                        )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Chip label={event.type} size="small" variant="outlined" />
                                        {canManage && (
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => setDeleteConfirm({ open: true, event })}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Typography color="text.disabled">No past events</Typography>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'create', event: null })}
                maxWidth="sm" fullWidth>
                <DialogTitle>{dialog.mode === 'create' ? 'Create New Event' : 'Edit Event'}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField fullWidth required label="Event Title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <TextField fullWidth required label="Date" type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            InputLabelProps={{ shrink: true }} />
                        <TextField fullWidth label="Description (optional)" multiline rows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Event Type</InputLabel>
                            <Select value={form.type} label="Event Type"
                                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <MenuItem value="academic">Academic</MenuItem>
                                <MenuItem value="exam">Exam</MenuItem>
                                <MenuItem value="meeting">Meeting</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Target Audience</InputLabel>
                            <Select value={form.target} label="Target Audience"
                                onChange={(e) => setForm({ ...form, target: e.target.value })}>
                                <MenuItem value="all">All Users</MenuItem>
                                <MenuItem value="students">Students Only</MenuItem>
                                <MenuItem value="teachers">Teachers Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ open: false, mode: 'create', event: null })}
                        disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : dialog.mode === 'create' ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, event: null })}>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{deleteConfirm.event?.title}</strong>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, event: null })}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default EventsManagement;
