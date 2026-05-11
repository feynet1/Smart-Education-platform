import { useState } from 'react';
import {
    Box, Typography, Paper, Grid, Avatar, TextField, Button,
    Chip, List, ListItem, ListItemAvatar, ListItemText,
    Snackbar, Alert, CircularProgress, Divider,
    IconButton, Tooltip,
} from '@mui/material';
import { Save, School, EmojiEvents, CheckCircle, Edit, Lock, Refresh } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';
import { useStudent } from '../../../contexts/StudentContext';
import ChangePasswordDialog from '../../../components/ChangePasswordDialog';
import { supabase } from '../../../supabaseClient';

const Profile = () => {
    const { user, profile, updateProfile } = useAuth();
    const { enrolledCourses, gpa, attendancePercentage, attendanceRecords } = useStudent();

    const [name,  setName]  = useState(profile?.name || '');
    const [phone, setPhone] = useState(
        profile?.phone && profile.phone !== '—' ? profile.phone : ''
    );
    const [saving,     setSaving]     = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pwDialog,   setPwDialog]   = useState(false);
    const [snackbar,   setSnackbar]   = useState({ open: false, message: '', severity: 'success' });

    const showSnack = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            // Sync editable fields with freshly fetched profile data
            setName(data?.name || '');
            setPhone(data?.phone && data.phone !== '—' ? data.phone : '');
            showSnack('Profile refreshed', 'success');
        } catch {
            showSnack('Refresh failed', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showSnack('Name cannot be empty', 'error');
            return;
        }
        setSaving(true);
        const result = await updateProfile({ name, phone });
        setSaving(false);
        if (result.success) {
            showSnack('Profile updated successfully');
        } else {
            showSnack(result.error || 'Failed to update profile', 'error');
        }
    };

    // Achievements based on real data
    const totalSessions = attendanceRecords.length;
    const presentSessions = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const perfectAttendance = totalSessions >= 5 && presentSessions === totalSessions;

    const achievements = [
        {
            id: 1,
            title: 'Perfect Attendance',
            description: '100% attendance across all sessions',
            icon: <CheckCircle color="success" />,
            earned: perfectAttendance,
        },
        {
            id: 2,
            title: 'Top Performer',
            description: 'GPA of 3.5 or above',
            icon: <EmojiEvents color="warning" />,
            earned: parseFloat(gpa) >= 3.5,
        },
        {
            id: 3,
            title: 'Course Explorer',
            description: 'Enrolled in 3 or more courses',
            icon: <School color="primary" />,
            earned: enrolledCourses.length >= 3,
        },
    ];

    const attendanceDisplay = attendancePercentage != null ? `${attendancePercentage}%` : '—';
    const attendanceColor   = attendancePercentage == null ? 'text.secondary'
                            : attendancePercentage >= 75 ? 'success.main'
                            : attendancePercentage >= 50 ? 'warning.main' : 'error.main';

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={4}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>Profile & Settings</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage your account information
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

            <Grid container spacing={3}>
                {/* ── Left: Personal Info ── */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Personal Information
                        </Typography>

                        {/* Avatar + identity */}
                        <Box display="flex" alignItems="center" mb={3} gap={2}>
                            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}>
                                {(profile?.name || 'S').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {profile?.name || '—'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile?.email}
                                </Typography>
                                <Box display="flex" gap={1} mt={0.5}>
                                    <Chip label="Student" size="small" color="primary" />
                                    {profile?.grade && (
                                        <Chip
                                            label={profile.grade === 'University' ? 'University' : `Grade ${profile.grade}`}
                                            size="small"
                                            variant="outlined"
                                            color="secondary" />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Editable fields */}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth required
                                    label="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    InputProps={{
                                        endAdornment: <Edit fontSize="small" sx={{ color: 'text.disabled' }} />,
                                    }} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={profile?.email || ''}
                                    disabled
                                    helperText="Contact admin to change email" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    placeholder="+251 9XX XXX XXXX"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Grade Level"
                                    value={
                                        profile?.grade
                                            ? profile.grade === 'University' ? 'University' : `Grade ${profile.grade}`
                                            : '—'
                                    }
                                    disabled
                                    helperText="Set at registration — contact admin to change" />
                            </Grid>
                        </Grid>

                        <Box mt={3} display="flex" gap={2} flexWrap="wrap"
                            sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
                            <Button
                                variant="outlined"
                                startIcon={<Lock />}
                                onClick={() => setPwDialog(true)}
                                fullWidth={false}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                Change Password
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                                onClick={handleSave}
                                disabled={saving}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* ── Right: Stats + Achievements ── */}
                <Grid item xs={12} md={6}>
                    {/* Academic Summary */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Academic Summary
                        </Typography>
                        <Grid container spacing={2} textAlign="center">
                            <Grid item xs={4}>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {gpa}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">GPA</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="h4" fontWeight="bold" color={attendanceColor}>
                                    {attendanceDisplay}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Attendance</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {enrolledCourses.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Courses</Typography>
                            </Grid>
                        </Grid>

                        {/* Attendance detail */}
                        {attendanceRecords.length > 0 && (
                            <Box mt={2} display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                                <Chip size="small" color="success" variant="outlined"
                                    label={`${attendanceRecords.filter(r => r.status === 'Present').length} Present`} />
                                <Chip size="small" color="warning" variant="outlined"
                                    label={`${attendanceRecords.filter(r => r.status === 'Late').length} Late`} />
                                <Chip size="small" color="error" variant="outlined"
                                    label={`${attendanceRecords.filter(r => r.status === 'Absent').length} Absent`} />
                            </Box>
                        )}
                    </Paper>

                    {/* Achievements */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Achievements
                        </Typography>
                        <List dense disablePadding>
                            {achievements.map(a => (
                                <ListItem key={a.id}
                                    sx={{ opacity: a.earned ? 1 : 0.4, px: 0 }}
                                    secondaryAction={
                                        a.earned
                                            ? <Chip label="Earned" size="small" color="success" />
                                            : null
                                    }>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: a.earned ? 'primary.light' : 'grey.200' }}>
                                            {a.icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={a.title}
                                        secondary={a.description} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            <ChangePasswordDialog
                open={pwDialog}
                onClose={() => setPwDialog(false)}
                onSuccess={msg => showSnack(msg)}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;
