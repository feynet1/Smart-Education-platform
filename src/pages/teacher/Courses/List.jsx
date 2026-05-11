import { useState } from 'react';
import {
    Box, Button, Grid, Card, CardContent, CardActions,
    Typography, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions,
    Snackbar, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Refresh } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { useNavigate } from 'react-router-dom';
import CreateCourse from './Create';
import EditCourse from './Edit';

const CourseList = () => {
    const { courses, coursesLoading, deleteCourse, fetchCourses } = useTeacher();
    const navigate = useNavigate();

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnack = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchCourses();
            showSnack('Courses refreshed');
        } catch {
            showSnack('Refresh failed', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setEditOpen(true);
    };

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setDeleting(true);
        const result = await deleteCourse(courseToDelete.id);
        setDeleting(false);
        setDeleteConfirmOpen(false);
        setCourseToDelete(null);
        if (result?.success) showSnack('Course deleted');
        else showSnack(result?.error || 'Failed to delete course', 'error');
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={4}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Typography variant="h4" fontWeight="bold"
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>My Courses</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
                                {refreshing
                                    ? <CircularProgress size={20} color="inherit" />
                                    : <Refresh />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
                        Create Course
                    </Button>
                </Box>
            </Box>

            {coursesLoading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {courses.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="text.secondary" textAlign="center" py={5}>
                                No courses yet. Create your first course!
                            </Typography>
                        </Grid>
                    ) : (
                        courses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course.id}>
                                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                            <Typography variant="overline" color="text.secondary">
                                                {course.subject}
                                            </Typography>
                                            <Chip label={course.grade} size="small" color="primary" variant="outlined" />
                                        </Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {course.description || 'No description provided.'}
                                        </Typography>
                                        <Box mt={2}>
                                            <Typography variant="caption" display="block">
                                                Join Code: <strong>{course.joinCode}</strong>
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                Students: {course.students?.length || 0}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" startIcon={<Visibility />}
                                            onClick={() => navigate(`/teacher/classroom/${course.id}`)}>
                                            Open Class
                                        </Button>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <IconButton size="small" color="primary" onClick={() => handleEdit(course)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(course)}>
                                            <Delete />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            <CreateCourse
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={(msg) => showSnack(msg)}
                onError={(msg) => showSnack(msg, 'error')}
            />
            <EditCourse
                open={editOpen}
                onClose={() => setEditOpen(false)}
                course={selectedCourse}
                onSuccess={(msg) => showSnack(msg)}
                onError={(msg) => showSnack(msg, 'error')}
            />

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{courseToDelete?.name}"? This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} /> : null}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseList;
