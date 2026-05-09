import { useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActionArea,
    CardActions, Chip, Button, Snackbar, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Login as JoinIcon } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';

const StudentCoursesList = () => {
    const { enrolledCourses, activeSessions, joinSession, studentGrade } = useStudent();
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleJoinSession = async (e, courseId) => {
        e.stopPropagation(); // prevent card navigation
        const result = await joinSession(courseId);
        setSnackbar({
            open: true,
            message: result.message,
            severity: result.success ? (result.status === 'Late' ? 'warning' : 'success') : 'error',
        });
    };

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">My Courses</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {studentGrade
                        ? `Showing ${studentGrade === 'University' ? 'University' : `Grade ${studentGrade}`} courses`
                        : 'View your enrolled courses'}
                </Typography>
            </Box>

            {enrolledCourses.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        You are not enrolled in any courses yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Use the "Join Class" button in the top bar to enroll.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {enrolledCourses.map((course) => {
                        const hasActiveSession = !!activeSessions[course.id];
                        return (
                            <Grid item xs={12} sm={6} md={4} key={course.id}>
                                <Card elevation={2} sx={{
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                    border: hasActiveSession ? '2px solid #2e7d32' : '1px solid transparent',
                                }}>
                                    <CardActionArea onClick={() => navigate(`/student/courses/${course.id}`)} sx={{ flexGrow: 1 }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                                <Typography variant="overline" color="text.secondary">
                                                    {course.subject}
                                                </Typography>
                                                <Box display="flex" gap={0.5}>
                                                    {hasActiveSession && (
                                                        <Chip label="Live" color="success" size="small" sx={{ animation: 'pulse 1.5s infinite' }} />
                                                    )}
                                                    <Chip label={`Grade ${course.grade}`} size="small" color="primary" variant="outlined" />
                                                </Box>
                                            </Box>
                                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                                {course.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {course.description || 'No description available.'}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    {hasActiveSession && (
                                        <CardActions sx={{ px: 2, pb: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={<JoinIcon />}
                                                onClick={(e) => handleJoinSession(e, course.id)}
                                            >
                                                Join Live Session
                                            </Button>
                                        </CardActions>
                                    )}
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentCoursesList;
