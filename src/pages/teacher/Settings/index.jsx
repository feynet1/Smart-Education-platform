import { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Switch,
    FormControlLabel, Grid, Avatar, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../supabaseClient';

const Settings = () => {
    const { user, profile } = useAuth();

    const [name, setName] = useState(profile?.name || user?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true,
    });

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
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Settings</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage your profile and preferences
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Profile Information */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Profile Information
                        </Typography>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main', fontSize: 28 }}>
                                {name?.charAt(0)?.toUpperCase() || 'T'}
                            </Avatar>
                            <Box>
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
                        <Button variant="outlined" color="primary" fullWidth sx={{ mb: 2 }}>
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
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;
