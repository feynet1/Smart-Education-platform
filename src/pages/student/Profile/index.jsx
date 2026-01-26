import { useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, TextField, Button, Chip, List, ListItem, ListItemAvatar, ListItemText, Switch, FormControlLabel } from '@mui/material';
import { Save, School, EmojiEvents, CheckCircle } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';
import { useStudent } from '../../../contexts/StudentContext';

const Profile = () => {
    const { user } = useAuth();
    const { enrolledCourses, gpa, attendancePercentage } = useStudent();

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
    });

    // Mock achievements
    const achievements = [
        { id: 1, title: 'Perfect Attendance', description: '100% attendance for a month', icon: <CheckCircle color="success" />, earned: attendancePercentage === 100 },
        { id: 2, title: 'Top Performer', description: 'GPA above 3.5', icon: <EmojiEvents color="warning" />, earned: parseFloat(gpa) >= 3.5 },
        { id: 3, title: 'Course Explorer', description: 'Enrolled in 5+ courses', icon: <School color="primary" />, earned: enrolledCourses.length >= 5 },
    ];

    const handleSave = () => {
        alert('Profile saved successfully!');
    };

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Profile & Settings
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage your account
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Profile Info */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Personal Information
                        </Typography>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', fontSize: 32 }}>
                                {user?.name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{user?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                                <Chip label="Student" size="small" color="primary" sx={{ mt: 1 }} />
                            </Box>
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Student ID"
                                    defaultValue="STU-2026-001"
                                    disabled
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Stats & Settings */}
                <Grid item xs={12} md={6}>
                    {/* Academic Summary */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Academic Summary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4} textAlign="center">
                                <Typography variant="h4" color="primary" fontWeight="bold">{gpa}</Typography>
                                <Typography variant="caption" color="text.secondary">GPA</Typography>
                            </Grid>
                            <Grid item xs={4} textAlign="center">
                                <Typography variant="h4" color="success.main" fontWeight="bold">{attendancePercentage}%</Typography>
                                <Typography variant="caption" color="text.secondary">Attendance</Typography>
                            </Grid>
                            <Grid item xs={4} textAlign="center">
                                <Typography variant="h4" color="info.main" fontWeight="bold">{enrolledCourses.length}</Typography>
                                <Typography variant="caption" color="text.secondary">Courses</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Notifications */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
                    </Paper>

                    {/* Achievements */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Achievements
                        </Typography>
                        <List dense>
                            {achievements.map((achievement) => (
                                <ListItem key={achievement.id} sx={{ opacity: achievement.earned ? 1 : 0.4 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: achievement.earned ? 'primary.light' : 'grey.200' }}>
                                            {achievement.icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={achievement.title}
                                        secondary={achievement.description}
                                    />
                                    {achievement.earned && <Chip label="Earned" size="small" color="success" />}
                                </ListItem>
                            ))}
                        </List>
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

export default Profile;
