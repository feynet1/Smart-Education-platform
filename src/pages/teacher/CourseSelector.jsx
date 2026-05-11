import { Grid, Card, CardActionArea, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../../contexts/TeacherContext';

const CourseSelector = ({ basePath, title }) => {
    const { courses } = useTeacher();
    const navigate = useNavigate();

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold"
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Select a course to proceed
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {courses.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="h6" color="text.secondary" textAlign="center" py={5}>
                            No courses found. Please create a course in "My Courses" first.
                        </Typography>
                    </Grid>
                ) : (
                    courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card elevation={2} sx={{ height: '100%' }}>
                                <CardActionArea
                                    onClick={() => navigate(`${basePath}/${course.id}`)}
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                >
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                            <Typography variant="overline" color="text.secondary">
                                                {course.subject}
                                            </Typography>
                                            <Chip label={course.grade} size="small" color="primary" variant="outlined" />
                                        </Box>
                                        <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {course.description || "No description provided."}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default CourseSelector;
