import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip,
    Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Assignment as AssignmentIcon, Refresh, Visibility } from '@mui/icons-material';
import SubmissionsPanel from '../../../components/SubmissionsPanel';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { supabase } from '../../../supabaseClient';
import { useTeacher } from '../../../contexts/TeacherContext';
import useAuth from '../../../hooks/useAuth';

const TYPE_COLORS = {
    assignment: 'primary',
    homework:   'secondary',
    quiz:       'warning',
    project:    'success',
};

const EMPTY_FORM = { title: '', description: '', type: 'assignment', due_date: '' };

const getDueDateColor = (dueDate) => {
    const d = new Date(dueDate + 'T00:00:00');
    if (isPast(d) && !isToday(d)) return 'error';
    if (differenceInDays(d, new Date()) <= 3) return 'warning';
    return 'success';
};

const TeacherAssignments = () => {
    const { id: courseId } = useParams();
    const { courses } = useTeacher();
    const { user } = useAuth();
    const course = courses.find(c => c.id === courseId);

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dialog, setDialog] = useState({ open: false, mode: 'create', item: null });
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [panelOpen, setPanelOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const showSnack = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const openSubmissionsPanel = (item) => {
        setSelectedAssignment(item);
        setPanelOpen(true);
    };

    const fetchAssignments = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assignments')
                .select('*')
                .eq('course_id', courseId)
                .order('due_date', { ascending: true });
            if (error) throw error;
            setAssignments(data || []);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAssignments();
            showSnack('Assignments refreshed', 'success');
        } catch {
            showSnack('Refresh failed', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setDialog({ open: true, mode: 'create', item: null });
    };

    const openEdit = (item) => {
        setForm({ title: item.title, description: item.description || '', type: item.type, due_date: item.due_date });
        setDialog({ open: true, mode: 'edit', item });
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.due_date) {
            showSnack('Title and due date are required', 'error');
            return;
        }
        setSaving(true);
        try {
            if (dialog.mode === 'create') {
                const { error } = await supabase.from('assignments').insert({
                    course_id: courseId,
                    teacher_id: user.id,
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    type: form.type,
                    due_date: form.due_date,
                });
                if (error) throw error;
                showSnack('Assignment created');
            } else {
                const { error } = await supabase.from('assignments')
                    .update({ title: form.title.trim(), description: form.description.trim() || null, type: form.type, due_date: form.due_date })
                    .eq('id', dialog.item.id);
                if (error) throw error;
                showSnack('Assignment updated');
            }
            await fetchAssignments();
            setDialog({ open: false, mode: 'create', item: null });
        } catch (err) {
            showSnack(err.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.item) return;
        try {
            const { error } = await supabase.from('assignments').delete().eq('id', deleteConfirm.item.id);
            if (error) throw error;
            setAssignments(prev => prev.filter(a => a.id !== deleteConfirm.item.id));
            showSnack('Assignment deleted', 'info');
        } catch (err) {
            showSnack(err.message || 'Failed to delete', 'error');
        }
        setDeleteConfirm({ open: false, item: null });
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={3}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>Assignments</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{course.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
                                {refreshing
                                    ? <CircularProgress size={20} color="inherit" />
                                    : <Refresh />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
                        New Assignment
                    </Button>
                </Box>
            </Box>

            <Paper elevation={2}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Title</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Due Date</strong></TableCell>
                                <TableCell><strong>Description</strong></TableCell>
                                <TableCell align="center" width={140}><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                                            <Typography color="text.secondary">No assignments yet</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : assignments.map(item => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{item.title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={item.type} size="small" color={TYPE_COLORS[item.type] || 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={format(new Date(item.due_date + 'T00:00:00'), 'MMM dd, yyyy')}
                                            size="small"
                                            color={getDueDateColor(item.due_date)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Submissions">
                                            <IconButton size="small" onClick={() => openSubmissionsPanel(item)}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(item)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => setDeleteConfirm({ open: true, item })}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create / Edit Dialog */}
            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'create', item: null })}
                maxWidth="sm" fullWidth>
                <DialogTitle>{dialog.mode === 'create' ? 'New Assignment' : 'Edit Assignment'}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField fullWidth required label="Title"
                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        <TextField fullWidth label="Description (optional)" multiline rows={2}
                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        <TextField select fullWidth label="Type" value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                            <MenuItem value="assignment">Assignment</MenuItem>
                            <MenuItem value="homework">Homework</MenuItem>
                            <MenuItem value="quiz">Quiz</MenuItem>
                            <MenuItem value="project">Project</MenuItem>
                        </TextField>
                        <TextField fullWidth required label="Due Date" type="date"
                            value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                            InputLabelProps={{ shrink: true }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ open: false, mode: 'create', item: null })} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : dialog.mode === 'create' ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, item: null })}>
                <DialogTitle>Delete Assignment</DialogTitle>
                <DialogContent>
                    <Typography>Delete <strong>{deleteConfirm.item?.title}</strong>? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, item: null })}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

            <SubmissionsPanel
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
                assignment={selectedAssignment}
                courseId={courseId}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherAssignments;
