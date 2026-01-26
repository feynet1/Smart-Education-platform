import { Box, Typography, Grid, Card, CardContent, CardActionArea, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../../contexts/StudentContext';

const StudentCoursesList = () => {
    const { enrolledCourses } = useStudent();
    const navigate = useNavigate();

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    My Courses
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    View your enrolled courses
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
                    {enrolledCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card elevation={2}>
                                <CardActionArea onClick={() => navigate(`/student/courses/${course.id}`)}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                            <Typography variant="overline" color="text.secondary">
                                                {course.subject}
                                            </Typography>
                                            <Chip label={`Grade ${course.grade}`} size="small" color="primary" variant="outlined" />
                                        </Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {course.description || 'No description available.'}
                                        </Typography>
                                        <Box mt={2}>
                                            <Typography variant="caption">
                                                Join Code: <strong>{course.joinCode}</strong>
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default StudentCoursesList;
