import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, LinearProgress, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Chip, Button } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Description, Download, CheckCircle, Cancel, AccessTime, VideoCall } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';

const CourseDetails = () => {
    const { id } = useParams();
    const { enrolledCourses, notes, attendance } = useStudent();
    const course = enrolledCourses.find(c => c.id === id);

    if (!course) {
        return (
            <Box textAlign="center" py={8}>
                <Typography variant="h5" color="text.secondary">
                    Course not found or not enrolled.
                </Typography>
            </Box>
        );
    }

    // Get notes for this course
    const courseNotes = notes[id] || [];

    // Get attendance for this course
    const courseAttendance = attendance[id] || [];
    const attendanceRecords = courseAttendance.flatMap(a => a.records);
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const totalCount = attendanceRecords.length;
    const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    return (
        <Box>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 2 }}>
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    {course.subject}
                </Typography>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {course.name}
                </Typography>
                <Typography variant="body1">
                    {course.description || 'No description provided.'}
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<VideoCall />} sx={{ mt: 2 }}>
                    Join Live Class
                </Button>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                    {/* Progress */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Course Progress
                        </Typography>
                        <Box mt={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Completion
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    45%
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={45} sx={{ height: 10, borderRadius: 5 }} />
                        </Box>
                    </Paper>

                    {/* Notes */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Course Notes & Resources
                        </Typography>
                        {courseNotes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No notes uploaded yet.
                            </Typography>
                        ) : (
                            <List>
                                {courseNotes.map((note) => (
                                    <ListItem key={note.id} divider>
                                        <ListItemIcon>
                                            <Description color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={note.name}
                                            secondary={note.size}
                                        />
                                        <IconButton color="primary">
                                            <Download />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>

                    {/* Attendance Summary */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Attendance Summary
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={2}>
                            <Chip icon={<CheckCircle />} label={`Present: ${presentCount}`} color="success" />
                            <Chip icon={<Cancel />} label={`Absent: ${totalCount - presentCount}`} color="error" variant="outlined" />
                            <Chip icon={<AccessTime />} label={`${attendancePercentage}%`} color="primary" />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column - QR Code */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Join Code
                        </Typography>
                        <Typography variant="h3" color="primary" sx={{ letterSpacing: 4, fontWeight: 'bold' }} gutterBottom>
                            {course.joinCode}
                        </Typography>
                        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                            <QRCodeSVG value={course.joinCode} size={150} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Share this code with classmates
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CourseDetails;
