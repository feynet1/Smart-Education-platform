/**
 * Admin Platform Settings
 */
import { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Switch, FormControlLabel,
    Button, Divider, Grid, Snackbar, Alert, Card, CardContent
} from '@mui/material';
import { Save, Restore, School, Security, Notifications } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

// Inner form — receives initialSettings as prop so useState initializes correctly
const SettingsForm = ({ initialSettings, updateSettings }) => {
    const [formData, setFormData] = useState(initialSettings);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const result = await updateSettings(formData);
        if (result?.success === false) {
            setSnackbar({ open: true, message: `Failed to save: ${result.error}`, severity: 'error' });
        } else {
            setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
        }
    };

    const handleReset = () => {
        setFormData(initialSettings);
        setSnackbar({ open: true, message: 'Settings reset to saved values', severity: 'info' });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Platform Settings</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure platform-wide settings and preferences
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<Restore />} onClick={handleReset}>Reset</Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save Changes</Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Academic Settings */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                <School color="primary" />
                                <Typography variant="h6" fontWeight="bold">Academic Settings</Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField fullWidth label="Academic Year"
                                    value={formData.academicYear}
                                    onChange={(e) => handleChange('academicYear', e.target.value)}
                                    placeholder="e.g., 2025-2026"
                                    helperText="Current academic year for the platform" />
                                <TextField fullWidth label="Semester Name"
                                    value={formData.semesterName}
                                    onChange={(e) => handleChange('semesterName', e.target.value)}
                                    placeholder="e.g., Spring 2026"
                                    helperText="Current semester/term name" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Access Control */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                <Security color="primary" />
                                <Typography variant="h6" fontWeight="bold">Access Control</Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={formData.registrationEnabled} color="primary"
                                            onChange={(e) => handleChange('registrationEnabled', e.target.checked)} />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Enable Registration</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Allow new users to register on the platform
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <Divider />
                                <FormControlLabel
                                    control={
                                        <Switch checked={formData.maintenanceMode} color="error"
                                            onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" color={formData.maintenanceMode ? 'error' : 'inherit'}>
                                                Maintenance Mode
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Temporarily disable access for non-admin users
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item size={{ xs: 12 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                <Notifications color="primary" />
                                <Typography variant="h6" fontWeight="bold">Notification Settings</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Email Notifications', defaultChecked: true },
                                    { label: 'Attendance Alerts',   defaultChecked: true },
                                    { label: 'Grade Updates',       defaultChecked: true },
                                    { label: 'System Alerts',       defaultChecked: false },
                                    { label: 'Event Reminders',     defaultChecked: true },
                                    { label: 'Marketing Emails',    defaultChecked: false },
                                ].map(({ label, defaultChecked }) => (
                                    <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={label}>
                                        <FormControlLabel
                                            control={<Switch defaultChecked={defaultChecked} color="primary" />}
                                            label={label}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Danger Zone */}
                <Grid item size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #f44336', bgcolor: '#fff5f5' }}>
                        <Typography variant="h6" fontWeight="bold" color="error" mb={2}>Danger Zone</Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Button variant="outlined" color="error">Clear All Logs</Button>
                            <Button variant="outlined" color="error">Reset All Data</Button>
                            <Button variant="outlined" color="error">Export Database</Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                            These actions are irreversible. Please proceed with caution.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

// Outer wrapper — waits for settings to load from Supabase before mounting the form
const PlatformSettings = () => {
    const { settings, updateSettings } = useAdmin();

    // Don't mount the form until settings are loaded from Supabase
    // (academicYear will be a non-empty string once loaded)
    if (!settings.academicYear) return null;

    return <SettingsForm key={settings.academicYear} initialSettings={settings} updateSettings={updateSettings} />;
};

export default PlatformSettings;
