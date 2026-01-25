import { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Add, Edit, Delete, MoreVert, Visibility } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { useNavigate } from 'react-router-dom';
import CreateCourse from './Create';
import EditCourse from './Edit';

const CourseList = () => {
    const { courses, deleteCourse } = useTeacher();
    const navigate = useNavigate();

    // State
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setEditOpen(true);
    };

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            deleteCourse(courseToDelete.id);
            setDeleteConfirmOpen(false);
            setCourseToDelete(null);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    My Courses
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateOpen(true)}
                >
                    Create Course
                </Button>
            </Box>

            <Grid container spacing={3}>
                {courses.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="h6" color="text.secondary" textAlign="center" py={5}>
                            No courses found. Create your first course!
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
                                    <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                                        {course.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {course.description || "No description provided."}
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
                                    <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/teacher/classroom/${course.id}`)}>
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

            {/* Dialogs */}
            <CreateCourse open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditCourse open={editOpen} onClose={() => setEditOpen(false)} course={selectedCourse} />

            {/* Delete Confirmation */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseList;
