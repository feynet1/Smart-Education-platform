import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Chip, CircularProgress, Tabs, Tab,
    List, ListItem, ListItemText, Checkbox, Tooltip, FormControl,
    InputLabel, Select, MenuItem, LinearProgress, Avatar,
    IconButton, Snackbar, Alert,
} from '@mui/material';
import {
    Assignment as AssignmentIcon, CheckCircle, AccessTime,
    Cancel, School, Refresh,
} from '@mui/icons-material';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { supabase } from '../../../supabaseClient';
import { useStudent } from '../../../contexts/StudentContext';
import useAuth from '../../../hooks/useAuth';

const TYPE_COLORS = {
    assignment: 'primary',
    homework:   'secondary',
    quiz:       'warning',
    project:    'success',
};

const getDueDateColor = (dueDate) => {
    const d = new Date(dueDate + 'T00:00:00');
    if (isPast(d) && !isToday(d)) return 'error';
    if (differenceInDays(d, new Date()) <= 3) return 'warning';
    return 'success';
};

const getTimeLeft = (dueDate) => {
    const d = new Date(dueDate + 'T23:59:00');
    const hours = Math.floor((d - new Date()) / 3600000);
    const days  = differenceInDays(d, new Date());
    if (hours < 0)  return 'Overdue';
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
};

const StudentAssignments = () => {
    const { enrollments, enrolledCourses } = useStudent();
    const { user } = useAuth();

    const [tab, setTab] = useState(0); // 0=Pending, 1=Done, 2=All
    const [filterCourse, setFilterCourse] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [completions, setCompletions] = useState({});
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const load = useCallback(async () => {
        if (!enrollments.length || !user?.id) return;
        setLoading(true);
        try {
            const [{ data: aData }, { data: cData }] = await Promise.all([
                supabase
                    .from('assignments')
                    .select('*, courses(name, subject)')
                    .in('course_id', enrollments)
                    .order('due_date', { ascending: true }),
                supabase
                    .from('student_assignments')
                    .select('assignment_id, status, completed_at')
                    .eq('student_id', user.id),
            ]);
            setAssignments(aData || []);
            const map = {};
            (cData || []).forEach(c => { map[c.assignment_id] = c; });
            setCompletions(map);
        } catch (err) {
            console.error('Failed to load assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [enrollments, user?.id]);

    useEffect(() => { load(); }, [load]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await load();
            setSnackbar({ open: true, message: 'Assignments refreshed', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Refresh failed', severity: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    const toggleDone = async (assignmentId) => {
        const current = completions[assignmentId]?.status || 'pending';
        const next = current === 'done' ? 'pending' : 'done';
        setToggling(assignmentId);
        // Optimistic
        setCompletions(prev => ({
            ...prev,
            [assignmentId]: { ...prev[assignmentId], status: next },
        }));
        try {
            await supabase.from('student_assignments').upsert({
                assignment_id: assignmentId,
                student_id:    user.id,
                status:        next,
                completed_at:  next === 'done' ? new Date().toISOString() : null,
            }, { onConflict: 'assignment_id,student_id' });
        } catch (err) {
            console.error('Failed to toggle:', err);
            setCompletions(prev => ({
                ...prev,
                [assignmentId]: { ...prev[assignmentId], status: current },
            }));
        } finally {
            setToggling(null);
        }
    };

    // Filter by course
    const byCourse = filterCourse === 'all'
        ? assignments
        : assignments.filter(a => a.course_id === filterCourse);

    // Filter by tab
    const pending  = byCourse.filter(a => completions[a.id]?.status !== 'done');
    const done     = byCourse.filter(a => completions[a.id]?.status === 'done');
    const overdue  = pending.filter(a => isPast(new Date(a.due_date + 'T00:00:00')) && !isToday(new Date(a.due_date + 'T00:00:00')));

    const displayed = tab === 0 ? pending : tab === 1 ? done : byCourse;

    // Progress
    const total     = byCourse.length;
    const doneCount = done.length;
    const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const renderItem = (item) => {
        const isDone    = completions[item.id]?.status === 'done';
        const isToggling = toggling === item.id;
        const course    = enrolledCourses.find(c => c.id === item.course_id);

        return (
            <ListItem key={item.id} divider sx={{ px: 0, alignItems: 'flex-start' }}
                secondaryAction={
                    <Tooltip title={isDone ? 'Mark as pending' : 'Mark as done'}>
                        {isToggling
                            ? <CircularProgress size={20} sx={{ mt: 1 }} />
                            : <Checkbox checked={isDone} onChange={() => toggleDone(item.id)} color="success" />
                        }
                    </Tooltip>
                }>
                <Box display="flex" alignItems="flex-start" gap={1.5} flex={1} pr={5}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: isDone ? 'success.light' : 'primary.light',
                        color: isDone ? 'success.main' : 'primary.main', mt: 0.3 }}>
                        {isDone ? <CheckCircle fontSize="small" /> : <AssignmentIcon fontSize="small" />}
                    </Avatar>
                    <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body2" fontWeight="medium"
                                sx={{ textDecoration: isDone ? 'line-through' : 'none',
                                      color: isDone ? 'text.disabled' : 'text.primary' }}>
                                {item.title}
                            </Typography>
                            <Chip label={item.type} size="small"
                                color={TYPE_COLORS[item.type] || 'default'} />
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <School sx={{ fontSize: 13, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {course?.name || item.courses?.name || '—'}
                                </Typography>
                            </Box>
                            {!isDone && (
                                <Chip
                                    icon={<AccessTime sx={{ fontSize: 13 }} />}
                                    label={`Due ${format(new Date(item.due_date + 'T00:00:00'), 'MMM dd')} · ${getTimeLeft(item.due_date)}`}
                                    size="small"
                                    color={getDueDateColor(item.due_date)}
                                    variant="outlined"
                                />
                            )}
                            {isDone && completions[item.id]?.completed_at && (
                                <Typography variant="caption" color="success.main">
                                    ✓ Completed {format(new Date(completions[item.id].completed_at), 'MMM dd')}
                                </Typography>
                            )}
                        </Box>
                        {item.description && (
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                                {item.description}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </ListItem>
        );
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Assignments</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Track your work across all courses
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

            {/* Progress summary */}
            {total > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                            Overall Progress — {doneCount}/{total} completed
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                            {pct}%
                        </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 10, borderRadius: 1 }} color="success" />
                    <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                        <Chip icon={<CheckCircle />} label={`${doneCount} Done`} color="success" size="small" />
                        <Chip icon={<AccessTime />} label={`${pending.length - overdue.length} Upcoming`} color="primary" size="small" variant="outlined" />
                        {overdue.length > 0 && (
                            <Chip icon={<Cancel />} label={`${overdue.length} Overdue`} color="error" size="small" />
                        )}
                    </Box>
                </Paper>
            )}

            {/* Filter + Tabs */}
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                    px={2} pt={1} flexWrap="wrap" gap={1}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label={`Pending (${pending.length})`} />
                        <Tab label={`Done (${done.length})`} />
                        <Tab label={`All (${byCourse.length})`} />
                    </Tabs>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Course</InputLabel>
                        <Select value={filterCourse} label="Course"
                            onChange={e => setFilterCourse(e.target.value)}>
                            <MenuItem value="all">All Courses</MenuItem>
                            {enrolledCourses.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box px={2} pb={2}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={6}>
                            <CircularProgress />
                        </Box>
                    ) : displayed.length === 0 ? (
                        <Box textAlign="center" py={6}>
                            <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">
                                {tab === 0 ? 'No pending assignments 🎉' :
                                 tab === 1 ? 'No completed assignments yet' :
                                 'No assignments found'}
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {displayed.map(renderItem)}
                        </List>
                    )}
                </Box>
            </Paper>

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

export default StudentAssignments;
