/**
 * Admin Course Management
 * 
 * View and manage all courses created by teachers.
 * Provides oversight and deletion capabilities.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    Avatar
} from '@mui/material';
import { Search, School, People, Delete, Visibility, ContentCopy } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const CoursesManagement = () => {
    const { courses } = useAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Filter courses
    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Copy join code
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbar({ open: true, message: 'Join code copied!', severity: 'info' });
    };

    // Delete course (mock)
    const handleDeleteCourse = () => {
        setSnackbar({ open: true, message: 'Course deleted successfully', severity: 'success' });
        setDeleteDialog({ open: false, course: null });
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Course Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage all courses on the platform ({courses.length} total)
                    </Typography>
                </Box>
            </Box>

            {/* Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search courses by name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredCourses.map((course) => (
                        <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            <School />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {course.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {course.subject}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box display="flex" gap={1} mb={2}>
                                        <Chip
                                            size="small"
                                            icon={<People />}
                                            label={`${course.students || 0} students`}
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            label={course.gradeLevel || 'General'}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} bgcolor="#f5f5f5" p={1} borderRadius={1}>
                                        <Typography variant="caption" color="text.secondary">
                                            Join Code:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                            {course.joinCode}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => handleCopyCode(course.joinCode)}
                                            sx={{ ml: 'auto', minWidth: 0 }}
                                        >
                                            <ContentCopy fontSize="small" />
                                        </Button>
                                    </Box>

                                    {course.description && (
                                        <Typography variant="body2" color="text.secondary" mt={2} sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {course.description}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button size="small" startIcon={<Visibility />}>View</Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteDialog({ open: true, course })}
                                    >
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm ? 'No courses match your search' : 'No courses created yet'}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Teachers can create courses from their dashboard
                    </Typography>
                </Paper>
            )}

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, course: null })}>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete &quot;{deleteDialog.course?.name}&quot;?
                        This action cannot be undone and will remove all associated data.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, course: null })}>Cancel</Button>
                    <Button onClick={handleDeleteCourse} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

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

export default CoursesManagement;
