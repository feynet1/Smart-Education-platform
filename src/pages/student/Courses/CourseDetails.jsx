import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, List, ListItem, ListItemIcon,
    ListItemText, IconButton, Chip, Button, Tabs, Tab,
    CircularProgress, Checkbox, Tooltip,
} from '@mui/material';
import { Description, Download, CheckCircle, Cancel, AccessTime, Assignment as AssignmentIcon, Chat as ChatIcon } from '@mui/icons-material';
import CourseChat from '../../../components/CourseChat/CourseChat';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { useStudent } from '../../../contexts/StudentContext';
import { supabase } from '../../../supabaseClient';
import useAuth from '../../../hooks/useAuth';

const TYPE_COLORS = { assignment: 'primary', homework: 'secondary', quiz: 'warning', project: 'success' };

const getDueDateColor = (dueDate) => {
    const d = new Date(dueDate + 'T00:00:00');
    if (isPast(d) && !isToday(d)) return 'error';
    if (differenceInDays(d, new Date()) <= 3) return 'warning';
    return 'success';
};

const CourseDetails = () => {
    const { id } = useParams();
    const { enrolledCourses, activeSessions, joinSession } = useStudent();
    const { user, profile } = useAuth();
    const course = enrolledCourses.find(c => c.id === id);

    const [tab, setTab] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [completions, setCompletions] = useState({});
    const [notes, setNotes] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [joinMsg, setJoinMsg] = useState(null);

    const currentUser = { id: user.id, name: profile?.name || user?.email || 'Student', role: 'Student' };

    // Fetch assignments + student completions
    useEffect(() => {
        if (!id || !user?.id) return;
        const load = async () => {
            setLoadingAssignments(true);
            try {
                const { data: aData } = await supabase
                    .from('assignments')
                    .select('*')
                    .eq('course_id', id)
                    .order('due_date', { ascending: true });
                setAssignments(aData || []);

                const { data: cData } = await supabase
                    .from('student_assignments')
                    .select('assignment_id, status')
                    .eq('student_id', user.id);
                const map = {};
                (cData || []).forEach(c => { map[c.assignment_id] = c.status; });
                setCompletions(map);
            } catch (err) {
                console.error('Failed to load assignments:', err);
            } finally {
                setLoadingAssignments(false);
            }
        };
        load();
    }, [id, user?.id]);

    // Fetch notes for this course
    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoadingNotes(true);
            try {
                const { data } = await supabase
                    .from('course_notes')
                    .select('*')
                    .eq('course_id', id)
                    .order('created_at', { ascending: false });
                setNotes(data || []);
            } catch (err) {
                console.error('Failed to load notes:', err);
            } finally {
                setLoadingNotes(false);
            }
        };
        load();
    }, [id]);

    const toggleComplete = async (assignmentId) => {
        const current = completions[assignmentId] || 'pending';
        const next = current === 'done' ? 'pending' : 'done';
        setCompletions(prev => ({ ...prev, [assignmentId]: next }));
        try {
            await supabase.from('student_assignments').upsert({
                assignment_id: assignmentId,
                student_id: user.id,
                status: next,
                completed_at: next === 'done' ? new Date().toISOString() : null,
            }, { onConflict: 'assignment_id,student_id' });
        } catch (err) {
            console.error('Failed to update completion:', err);
            setCompletions(prev => ({ ...prev, [assignmentId]: current }));
        }
    };

    const handleDownload = async (note) => {
        try {
            const { data, error } = await supabase.storage.from('course-notes').download(note.file_path);
            if (error) throw error;
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = note.file_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            const { data } = supabase.storage.from('course-notes').getPublicUrl(note.file_path);
            window.open(data.publicUrl, '_blank');
        }
    };

    if (!course) return (
        <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary">Course not found or not enrolled.</Typography>
        </Box>
    );

    const doneCount = assignments.filter(a => completions[a.id] === 'done').length;

    return (
        <Box>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 2 }}>
                <Typography variant="overline" sx={{ opacity: 0.8 }}>{course.subject}</Typography>
                <Typography variant="h4" fontWeight="bold" gutterBottom>{course.name}</Typography>
                <Typography variant="body1">{course.description || 'No description provided.'}</Typography>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Tabs */}
                    <Paper elevation={2} sx={{ mb: 3 }}>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label={`Assignments (${assignments.length})`} icon={<AssignmentIcon />} iconPosition="start" />
                            <Tab label={`Notes (${notes.length})`} icon={<Description />} iconPosition="start" />
                            <Tab label="Chat" icon={<ChatIcon />} iconPosition="start" />
                        </Tabs>

                        <Box p={2}>
                            {/* Assignments Tab */}
                            {tab === 0 && (
                                loadingAssignments ? (
                                    <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>
                                ) : assignments.length === 0 ? (
                                    <Typography color="text.secondary" textAlign="center" py={3}>
                                        No assignments yet.
                                    </Typography>
                                ) : (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" mb={1} display="block">
                                            {doneCount}/{assignments.length} completed
                                        </Typography>
                                        <List disablePadding>
                                            {assignments.map(item => {
                                                const done = completions[item.id] === 'done';
                                                return (
                                                    <ListItem key={item.id} divider sx={{ px: 0 }}
                                                        secondaryAction={
                                                            <Tooltip title={done ? 'Mark as pending' : 'Mark as done'}>
                                                                <Checkbox
                                                                    checked={done}
                                                                    onChange={() => toggleComplete(item.id)}
                                                                    color="success"
                                                                />
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Typography variant="body2" fontWeight="medium"
                                                                        sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.disabled' : 'inherit' }}>
                                                                        {item.title}
                                                                    </Typography>
                                                                    <Chip label={item.type} size="small" color={TYPE_COLORS[item.type] || 'default'} />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                                    <Chip
                                                                        icon={<AccessTime sx={{ fontSize: 14 }} />}
                                                                        label={`Due: ${format(new Date(item.due_date + 'T00:00:00'), 'MMM dd, yyyy')}`}
                                                                        size="small"
                                                                        color={getDueDateColor(item.due_date)}
                                                                        variant="outlined"
                                                                    />
                                                                    {item.description && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {item.description}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                )
                            )}

                            {/* Notes Tab */}
                            {tab === 1 && (
                                loadingNotes ? (
                                    <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>
                                ) : notes.length === 0 ? (
                                    <Typography color="text.secondary" textAlign="center" py={3}>
                                        No notes uploaded yet.
                                    </Typography>
                                ) : (
                                    <List disablePadding>
                                        {notes.map(note => (
                                            <ListItem key={note.id} divider sx={{ px: 0 }}>
                                                <ListItemIcon><Description color="primary" /></ListItemIcon>
                                                <ListItemText
                                                    primary={note.file_name}
                                                    secondary={`${note.file_size} • ${new Date(note.created_at).toLocaleDateString()}`}
                                                />
                                                <IconButton color="primary" onClick={() => handleDownload(note)}>
                                                    <Download />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                )
                            )}

                            {/* Chat Tab */}
                            {tab === 2 && <CourseChat courseId={id} currentUser={currentUser} />}
                        </Box>
                    </Paper>
                </Grid>

                {/* Right — Assignment progress + live session */}
                <Grid item xs={12} md={4}>
                    {/* Live session join */}
                    {activeSessions[id] && (
                        <Paper elevation={2} sx={{ p: 3, mb: 2, border: '2px solid #2e7d32', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                                🟢 Live Session Active
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Your teacher has started a live session. Join now to mark your attendance.
                            </Typography>
                            <Button
                                fullWidth variant="contained" color="success"
                                onClick={async () => {
                                    const result = await joinSession(id);
                                    setJoinMsg({ text: result.message, severity: result.success ? (result.status === 'Late' ? 'warning' : 'success') : 'error' });
                                }}>
                                Join Live Session
                            </Button>
                            {joinMsg && (
                                <Typography variant="caption" color={`${joinMsg.severity}.main`} display="block" mt={1} textAlign="center">
                                    {joinMsg.text}
                                </Typography>
                            )}
                        </Paper>
                    )}

                    {/* Assignment progress */}
                    {assignments.length > 0 && (
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Assignment Progress</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip icon={<CheckCircle />} label={`Done: ${doneCount}`} color="success" size="small" />
                                <Chip icon={<Cancel />} label={`Pending: ${assignments.length - doneCount}`} color="default" size="small" variant="outlined" />
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default CourseDetails;
