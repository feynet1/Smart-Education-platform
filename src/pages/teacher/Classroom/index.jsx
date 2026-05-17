import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Grid, Paper, Button, Avatar, Chip,
    List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
    IconButton, Tooltip, Divider, CircularProgress, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    RadioGroup, Radio, FormControlLabel, TextField, FormControl,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import {
    PlayArrow, Stop, Person, Refresh, Videocam, Launch,
} from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import useAuth from '../../../hooks/useAuth';
import CourseChat from '../../../components/CourseChat/CourseChat';
import JitsiRoom from '../../../components/JitsiRoom/JitsiRoom';

const STATUS_COLORS = { Present: 'success', Absent: 'error', Late: 'warning' };
const STATUS_CYCLE = { Present: 'Late', Late: 'Absent', Absent: 'Present' };

const formatExternalLink = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

const ClassroomHelper = () => {
    const { id: courseId } = useParams();
    const {
        courses,
        activeSession, sessionAttendance,
        fetchActiveSession, startSession, endSession, updateAttendanceStatus,
    } = useTeacher();
    const { user, profile } = useAuth();

    const course = courses.find(c => c.id === courseId);
    const currentUser = { id: user.id, name: profile?.name || user?.email || 'Teacher', role: 'Teacher' };
    const [starting, setStarting] = useState(false);
    const [ending, setEnding] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showVideo, setShowVideo] = useState(false);

    // Google Meet Dialog state
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [meetingType, setMeetingType] = useState('jitsi');
    const [googleMeetLink, setGoogleMeetLink] = useState('');
    const [linkError, setLinkError] = useState('');

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchActiveSession(courseId);
            setSnackbar({ open: true, message: 'Classroom data refreshed', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Refresh failed', severity: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    // Load active session on mount
    useEffect(() => {
        if (courseId) fetchActiveSession(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleStartClick = () => {
        setMeetingType('jitsi');
        setGoogleMeetLink('');
        setLinkError('');
        setStartDialogOpen(true);
    };

    const handleConfirmStart = async () => {
        if (meetingType === 'google_meet') {
            if (!googleMeetLink.trim()) {
                setLinkError('Google Meet link is required');
                return;
            }
            if (!googleMeetLink.includes('meet.google.com') && !googleMeetLink.startsWith('http')) {
                setLinkError('Please enter a valid URL (e.g. https://meet.google.com/abc-defg-hij)');
                return;
            }
        }

        setStarting(true);
        setStartDialogOpen(false);
        const res = await startSession(
            courseId, 
            meetingType, 
            meetingType === 'google_meet' ? googleMeetLink.trim() : null
        );
        setStarting(false);
        
        if (res.success) {
            setSnackbar({ open: true, message: 'Live class session started!', severity: 'success' });
        } else {
            setSnackbar({ open: true, message: `Failed to start session: ${res.error}`, severity: 'error' });
        }
    };

    const handleEndSession = async () => {
        setEnding(true);
        await endSession(courseId);
        setEnding(false);
    };

    // Cycle through Present → Late → Absent on click
    const handleStatusClick = async (record) => {
        const next = STATUS_CYCLE[record.status] || 'Present';
        await updateAttendanceStatus(record.id, next);
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    const presentCount = sessionAttendance.filter(a => a.status === 'Present').length;
    const lateCount = sessionAttendance.filter(a => a.status === 'Late').length;
    const absentCount = sessionAttendance.filter(a => a.status === 'Absent').length;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}
                flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                        {course.name}
                        <Typography component="span" variant="h5" color="text.secondary" ml={1}
                            sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                            ({course.subject})
                        </Typography>
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Classroom — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                </Box>

                {activeSession ? (
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Chip label="Session Active" color="success" variant="filled" />
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton onClick={handleRefresh} disabled={refreshing}>
                                    {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                                </IconButton>
                            </span>
                        </Tooltip>
                        
                        {/* Jitsi Video Controls */}
                        {activeSession?.meeting_type === 'jitsi' && activeSession?.jitsi_room && (
                            <Button
                                variant={showVideo ? 'outlined' : 'contained'}
                                color="warning"
                                startIcon={<Videocam />}
                                onClick={() => setShowVideo(v => !v)}
                            >
                                {showVideo ? 'Hide Video' : 'Start Video'}
                            </Button>
                        )}

                        {/* Google Meet Controls */}
                        {activeSession?.meeting_type === 'google_meet' && activeSession?.google_meet_link && (
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<Launch />}
                                href={formatExternalLink(activeSession.google_meet_link)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Google Meet
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={ending ? <CircularProgress size={16} color="inherit" /> : <Stop />}
                            onClick={handleEndSession}
                            disabled={ending}
                        >
                            {ending ? 'Ending…' : 'End Session'}
                        </Button>
                    </Box>
                ) : (
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton onClick={handleRefresh} disabled={refreshing}>
                                    {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={starting ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
                            onClick={handleStartClick}
                            disabled={starting}
                            size="large"
                        >
                            {starting ? 'Starting…' : 'Start Session'}
                        </Button>
                    </Box>
                )}
            </Box>

            {!activeSession && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Start a session to allow students to join and mark their attendance automatically.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left — Join Code + Attendance */}
                <Grid item xs={12} md={4}>
                    {/* Join Code Card */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Join Code</Typography>
                        <Typography variant="h3" color="primary" sx={{ letterSpacing: 4, fontWeight: 'bold' }} gutterBottom>
                            {course.joinCode}
                        </Typography>
                        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                            <QRCodeSVG value={course.joinCode} size={140} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Students scan or enter this code to join
                        </Typography>
                    </Paper>

                    {/* Attendance Summary */}
                    {activeSession && (
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Live Attendance ({sessionAttendance.length} joined)
                            </Typography>
                            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                                <Chip label={`Present: ${presentCount}`} color="success" size="small" />
                                <Chip label={`Late: ${lateCount}`} color="warning" size="small" />
                                <Chip label={`Absent: ${absentCount}`} color="error" size="small" />
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            {sessionAttendance.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Waiting for students to join…
                                </Typography>
                            ) : (
                                <List dense>
                                    {sessionAttendance.map((record) => (
                                        <ListItem key={record.id} sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                                                    <Person fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={record.student_name}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Click to cycle status">
                                                    <Chip
                                                        label={record.status}
                                                        size="small"
                                                        color={STATUS_COLORS[record.status] || 'default'}
                                                        onClick={() => handleStatusClick(record)}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    )}
                </Grid>

                {/* Right — Live Video/Info + Chat */}
                <Grid item xs={12} md={8}>
                    {/* Jitsi video panel — only when session is active and teacher enables it */}
                    {activeSession?.meeting_type === 'jitsi' && activeSession?.jitsi_room && showVideo && (
                        <Box mb={3}>
                            <JitsiRoom
                                roomName={activeSession.jitsi_room}
                                displayName={profile?.name || user?.email || 'Teacher'}
                                role="Teacher"
                                onLeave={() => setShowVideo(false)}
                            />
                        </Box>
                    )}

                    {/* Google Meet Info Panel — shown to the teacher when Google Meet is active */}
                    {activeSession?.meeting_type === 'google_meet' && (
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                mb: 3, 
                                borderLeft: '6px solid #1976d2', 
                                borderRadius: 3,
                                background: 'linear-gradient(to right, #f8fafd, #ffffff)'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <Videocam color="primary" sx={{ fontSize: 32 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Google Meet Active (Long Class Session)
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                This live session is running on Google Meet to support full-length classes without time limits. 
                                Students see a prominent join button on their dashboard, and their attendance is tracked automatically when they click it.
                            </Typography>
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={formatExternalLink(activeSession.google_meet_link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<Launch />}
                                >
                                    Join Google Meet Room
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    <CourseChat courseId={courseId} currentUser={currentUser} />
                </Grid>
            </Grid>

            {/* Start Live Session Configuration Dialog */}
            <Dialog 
                open={startDialogOpen} 
                onClose={() => setStartDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    Configure Live Class Session
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Choose the platform format for this live session.
                    </DialogContentText>

                    <RadioGroup
                        value={meetingType}
                        onChange={(e) => {
                            setMeetingType(e.target.value);
                            setLinkError('');
                        }}
                        sx={{ gap: 2 }}
                    >
                        {/* Option 1: Jitsi (Quick call) */}
                        <Paper
                            elevation={meetingType === 'jitsi' ? 3 : 1}
                            sx={{
                                p: 2,
                                border: meetingType === 'jitsi' ? '2px solid #2e7d32' : '2px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => {
                                setMeetingType('jitsi');
                                setLinkError('');
                            }}
                        >
                            <FormControlLabel
                                value="jitsi"
                                control={<Radio color="success" />}
                                label={
                                    <Box sx={{ ml: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Quick Class (Embedded Jitsi)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Runs directly inside this browser window. Best for brief Q&As or announcements. (Note: Call will auto-disconnect after 5 minutes on the free server).
                                        </Typography>
                                    </Box>
                                }
                                sx={{ margin: 0, width: '100%', alignItems: 'flex-start' }}
                            />
                        </Paper>

                        {/* Option 2: Google Meet (Long call) */}
                        <Paper
                            elevation={meetingType === 'google_meet' ? 3 : 1}
                            sx={{
                                p: 2,
                                border: meetingType === 'google_meet' ? '2px solid #1976d2' : '2px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => setMeetingType('google_meet')}
                        >
                            <FormControlLabel
                                value="google_meet"
                                control={<Radio color="primary" />}
                                label={
                                    <Box sx={{ ml: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Long Class (Google Meet)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Opens in a new tab. Ideal for standard, full-length lectures. Paste your Google Meet invite link below.
                                        </Typography>
                                    </Box>
                                }
                                sx={{ margin: 0, width: '100%', alignItems: 'flex-start' }}
                            />

                            {meetingType === 'google_meet' && (
                                <Box sx={{ mt: 2, pl: 4 }}>
                                    <TextField
                                        label="Google Meet Link"
                                        fullWidth
                                        size="small"
                                        placeholder="https://meet.google.com/abc-defg-hij"
                                        value={googleMeetLink}
                                        onChange={(e) => {
                                            setGoogleMeetLink(e.target.value);
                                            setLinkError('');
                                        }}
                                        error={!!linkError}
                                        helperText={linkError}
                                        onClick={(e) => e.stopPropagation()} // Prevent clicking input from switching radio
                                    />
                                </Box>
                            )}
                        </Paper>
                    </RadioGroup>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStartDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmStart} 
                        variant="contained" 
                        color={meetingType === 'google_meet' ? 'primary' : 'success'}
                    >
                        Start Session
                    </Button>
                </DialogActions>
            </Dialog>

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

export default ClassroomHelper;
