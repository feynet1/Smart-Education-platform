import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Switch, FormControlLabel, Divider, Grid, Avatar } from '@mui/material';
import { Save } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';

const Settings = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true
    });

    const handleSave = () => {
        // Mock save
        alert('Settings saved successfully!');
    };

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Settings
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage your profile and preferences
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Profile Information
                        </Typography>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                                {user?.name?.charAt(0) || 'T'}
                            </Avatar>
                            <Button variant="outlined" size="small">
                                Change Avatar
                            </Button>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    defaultValue={user?.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    defaultValue={user?.email}
                                    disabled
                                    helperText="Contact admin to change email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Notifications
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} />}
                            label="Email Notifications"
                        />
                        <Box />
                        <FormControlLabel
                            control={<Switch checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} />}
                            label="Push Notifications"
                        />
                        <Box />
                        <FormControlLabel
                            control={<Switch checked={notifications.updates} onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })} />}
                            label="Platform Updates"
                        />
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

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave}>
                            Save Changes
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Settings;
