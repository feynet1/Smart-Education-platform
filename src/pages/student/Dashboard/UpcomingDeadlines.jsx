import { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, CircularProgress } from '@mui/material';
import { Assignment, AccessTime } from '@mui/icons-material';
import { differenceInHours, differenceInDays } from 'date-fns';
import { supabase } from '../../../supabaseClient';
import { useStudent } from '../../../contexts/StudentContext';
import useAuth from '../../../hooks/useAuth';

const getDeadlineColor = (dueDate) => {
    const due = new Date(dueDate + 'T23:59:00');
    const hours = differenceInHours(due, new Date());
    if (hours < 24) return 'error';
    if (hours < 72) return 'warning';
    return 'success';
};

const getTimeLeft = (dueDate) => {
    const due = new Date(dueDate + 'T23:59:00');
    const hours = differenceInHours(due, new Date());
    const days = differenceInDays(due, new Date());
    if (hours < 0) return 'Overdue';
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
};

const UpcomingDeadlines = () => {
    const { enrollments } = useStudent();
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enrollments.length || !user?.id) return;
        const load = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                // Get assignments for enrolled courses, not yet done by this student
                const { data: assignments } = await supabase
                    .from('assignments')
                    .select('id, title, due_date, type, courses(name)')
                    .in('course_id', enrollments)
                    .gte('due_date', today)
                    .order('due_date', { ascending: true })
                    .limit(5);

                if (!assignments?.length) { setDeadlines([]); setLoading(false); return; }

                // Get completed ones to filter out
                const { data: done } = await supabase
                    .from('student_assignments')
                    .select('assignment_id')
                    .eq('student_id', user.id)
                    .eq('status', 'done');

                const doneIds = new Set((done || []).map(d => d.assignment_id));
                setDeadlines((assignments || []).filter(a => !doneIds.has(a.id)));
            } catch (err) {
                console.error('Failed to load deadlines:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [enrollments, user?.id]);

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
                        <ListItem key={item.id} divider sx={{ px: 0 }}>
                            <ListItemIcon>
                                <Assignment color={getDeadlineColor(item.due_date)} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.title}
                                secondary={item.courses?.name}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Chip
                                icon={<AccessTime sx={{ fontSize: 14 }} />}
                                label={getTimeLeft(item.due_date)}
                                size="small"
                                color={getDeadlineColor(item.due_date)}
                                variant="outlined"
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default UpcomingDeadlines;
