import { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Switch,
    FormControlLabel, Grid, Avatar, Snackbar, Alert, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton,
} from '@mui/material';
import { Save, Visibility, VisibilityOff, Lock, Refresh } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../supabaseClient';
import ProfilePhotoUpload from '../../../components/ProfilePhotoUpload';

const Settings = () => {
    const { user, profile } = useAuth();

    const [name, setName] = useState(profile?.name || user?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleRefresh = async () => {
        if (!user?.id) return;
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            if (data) {
                setName(data.name || '');
                setPhone(data.phone || '');
            }
            setSnackbar({ open: true, message: 'Profile refreshed', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Refresh failed', severity: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true,
    });

    // ── Change Password ───────────────────────────────────────
    const [pwDialog, setPwDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');

    const handleOpenPwDialog = () => {
        setNewPassword('');
        setConfirmPassword('');
        setPwError('');
        setPwDialog(true);
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            setPwError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('Passwords do not match');
            return;
        }
        setPwSaving(true);
        setPwError('');
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPwDialog(false);
            setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
        } catch (err) {
            setPwError(err.message || 'Failed to change password');
        } finally {
            setPwSaving(false);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name: name.trim(), phone: phone.trim() || null })
                .eq('id', user.id);
            if (error) throw error;
            setSnackbar({ open: true, message: 'Profile saved successfully', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to save', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={4}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>Settings</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage your profile and preferences
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
                {/* Profile Information */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Profile Information
                        </Typography>
                        <Box display="flex" alignItems="center" mb={3}>
                            <ProfilePhotoUpload
                                userId={user?.id}
                                name={name}
                                avatarUrl={profile?.avatar_url}
                                size={64}
                                onSuccess={() => setSnackbar({ open: true, message: 'Profile photo updated!', severity: 'success' })}
                                onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                            />
                            <Box ml={2}>
                                <Typography variant="body2" fontWeight="bold">{name || 'Teacher'}</Typography>
                                <Typography variant="caption" color="text.secondary">{profile?.role || 'Teacher'}</Typography>
                            </Box>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    helperText="This name is visible to students"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={user?.email || ''}
                                    disabled
                                    helperText="Contact admin to change email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    helperText="Optional — not visible to students"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Notifications + Security */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Notifications
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <FormControlLabel
                                control={<Switch checked={notifications.email}
                                    onChange={(e) => setNotifications(n => ({ ...n, email: e.target.checked }))} />}
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={<Switch checked={notifications.push}
                                    onChange={(e) => setNotifications(n => ({ ...n, push: e.target.checked }))} />}
                                label="Push Notifications"
                            />
                            <FormControlLabel
                                control={<Switch checked={notifications.updates}
                                    onChange={(e) => setNotifications(n => ({ ...n, updates: e.target.checked }))} />}
                                label="Platform Updates"
                            />
                        </Box>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Security
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            sx={{ mb: 2 }}
                            startIcon={<Lock />}
                            onClick={handleOpenPwDialog}
                        >
                            Change Password
                        </Button>
                        <Button variant="outlined" color="error" fullWidth>
                            Enable Two-Factor Authentication
                        </Button>
                    </Paper>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

            {/* Change Password Dialog */}
            <Dialog open={pwDialog} onClose={() => setPwDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {pwError && <Alert severity="error">{pwError}</Alert>}
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            helperText="Minimum 6 characters"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNew(v => !v)} edge="end">
                                            {showNew ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPwDialog(false)} disabled={pwSaving}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={pwSaving || !newPassword || !confirmPassword}
                        startIcon={pwSaving ? <CircularProgress size={16} color="inherit" /> : <Lock />}
                    >
                        {pwSaving ? 'Saving…' : 'Change Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
