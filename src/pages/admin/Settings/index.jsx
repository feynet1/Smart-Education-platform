/**
 * Admin Platform Settings
 * 
 * Configure platform-wide settings including
 * academic year, registration, and notifications.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    Grid,
    Snackbar,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import { Save, Restore, School, Security, Notifications } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const PlatformSettings = () => {
    const { settings, updateSettings } = useAdmin();

    const [formData, setFormData] = useState(settings);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Handle input change
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    // Handle save
    const handleSave = () => {
        updateSettings(formData);
        setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    };

    // Handle reset
    const handleReset = () => {
        setFormData(settings);
        setSnackbar({ open: true, message: 'Settings reset to saved values', severity: 'info' });
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Platform Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure platform-wide settings and preferences
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<Restore />} onClick={handleReset}>
                        Reset
                    </Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                        Save Changes
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Academic Settings */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                <School color="primary" />
                                <Typography variant="h6" fontWeight="bold">
                                    Academic Settings
                                </Typography>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField
                                    fullWidth
                                    label="Academic Year"
                                    value={formData.academicYear}
                                    onChange={(e) => handleChange('academicYear', e.target.value)}
                                    placeholder="e.g., 2025-2026"
                                    helperText="Current academic year for the platform"
                                />
                                <TextField
                                    fullWidth
                                    label="Semester Name"
                                    value={formData.semesterName}
                                    onChange={(e) => handleChange('semesterName', e.target.value)}
                                    placeholder="e.g., Spring 2026"
                                    helperText="Current semester/term name"
                                />
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
                                <Typography variant="h6" fontWeight="bold">
                                    Access Control
                                </Typography>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.registrationEnabled}
                                            onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
                                            color="primary"
                                        />
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
                                        <Switch
                                            checked={formData.maintenanceMode}
                                            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                            color="error"
                                        />
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
                                <Typography variant="h6" fontWeight="bold">
                                    Notification Settings
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked color="primary" />}
                                        label="Email Notifications"
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked color="primary" />}
                                        label="Attendance Alerts"
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked color="primary" />}
                                        label="Grade Updates"
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch color="primary" />}
                                        label="System Alerts"
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked color="primary" />}
                                        label="Event Reminders"
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControlLabel
                                        control={<Switch color="primary" />}
                                        label="Marketing Emails"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Danger Zone */}
                <Grid item size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #f44336', bgcolor: '#fff5f5' }}>
                        <Typography variant="h6" fontWeight="bold" color="error" mb={2}>
                            Danger Zone
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Button variant="outlined" color="error">
                                Clear All Logs
                            </Button>
                            <Button variant="outlined" color="error">
                                Reset All Data
                            </Button>
                            <Button variant="outlined" color="error">
                                Export Database
                            </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                            These actions are irreversible. Please proceed with caution.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PlatformSettings;
