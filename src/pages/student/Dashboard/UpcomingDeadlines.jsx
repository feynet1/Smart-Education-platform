import { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, List, ListItem, ListItemIcon,
    ListItemText, Chip, CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import { Assignment, AccessTime, CheckCircleOutline } from '@mui/icons-material';
import { differenceInHours, differenceInDays } from 'date-fns';
import { supabase } from '../../../supabaseClient';
import { useStudent } from '../../../contexts/StudentContext';
import useAuth from '../../../hooks/useAuth';

const getDeadlineColor = (dueDate) => {
    const due = new Date(dueDate + 'T23:59:00');
    const hours = differenceInHours(due, new Date());
    if (hours < 0)  return 'error';
    if (hours < 24) return 'error';
    if (hours < 72) return 'warning';
    return 'success';
};

const getTimeLeft = (dueDate) => {
    const due = new Date(dueDate + 'T23:59:00');
    const hours = differenceInHours(due, new Date());
    const days  = differenceInDays(due, new Date());
    if (hours < 0)  return 'Overdue';
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
};

const UpcomingDeadlines = () => {
    const { enrollments } = useStudent();
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState(null); // assignment id being marked

    const load = useCallback(async () => {
        if (!enrollments.length || !user?.id) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch upcoming assignments for enrolled courses
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id, title, due_date, type, courses(name)')
                .in('course_id', enrollments)
                .gte('due_date', today)
                .order('due_date', { ascending: true })
                .limit(8);

            if (!assignments?.length) { setDeadlines([]); return; }

            // Filter out already-completed ones
            const { data: done } = await supabase
                .from('student_assignments')
                .select('assignment_id')
                .eq('student_id', user.id)
                .eq('status', 'done');

            const doneIds = new Set((done || []).map(d => d.assignment_id));
            setDeadlines(assignments.filter(a => !doneIds.has(a.id)));
        } catch (err) {
            console.error('Failed to load deadlines:', err);
        } finally {
            setLoading(false);
        }
    }, [enrollments, user?.id]);

    useEffect(() => { load(); }, [load]);

    const handleMarkDone = async (assignmentId) => {
        if (!user?.id) return;
        setMarking(assignmentId);
        try {
            await supabase
                .from('student_assignments')
                .upsert(
                    { assignment_id: assignmentId, student_id: user.id, status: 'done', completed_at: new Date().toISOString() },
                    { onConflict: 'assignment_id,student_id' }
                );
            // Remove from list immediately
            setDeadlines(prev => prev.filter(d => d.id !== assignmentId));
        } catch (err) {
            console.error('Failed to mark done:', err);
        } finally {
            setMarking(null);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Upcoming Deadlines
            </Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                </Box>
            ) : deadlines.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No upcoming deadlines 🎉
                </Typography>
            ) : (
                <List dense disablePadding>
                    {deadlines.map((item) => (
                        <ListItem
                            key={item.id}
                            divider
                            sx={{ px: 0 }}
                            secondaryAction={
                                <Tooltip title="Mark as done">
                                    <IconButton
                                        size="small"
                                        edge="end"
                                        onClick={() => handleMarkDone(item.id)}
                                        disabled={marking === item.id}
                                        color="success">
                                        {marking === item.id
                                            ? <CircularProgress size={16} />
                                            : <CheckCircleOutline fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            }>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Assignment color={getDeadlineColor(item.due_date)} fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.title}
                                secondary={item.courses?.name}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Chip
                                icon={<AccessTime sx={{ fontSize: 13 }} />}
                                label={getTimeLeft(item.due_date)}
                                size="small"
                                color={getDeadlineColor(item.due_date)}
                                variant="outlined"
                                sx={{ mr: 4 }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default UpcomingDeadlines;
