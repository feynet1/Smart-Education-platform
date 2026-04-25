import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, List, ListItem, ListItemIcon,
    ListItemText, ListItemSecondaryAction, IconButton, Grid,
    CircularProgress, Chip, Tooltip, LinearProgress,
} from '@mui/material';
import {
    CloudUpload, InsertDriveFile, Delete, Download,
    PictureAsPdf, Image as ImageIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTeacher } from '../../../contexts/TeacherContext';
import { supabase } from '../../../supabaseClient';

const getIcon = (type = '') => {
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    if (type.includes('image')) return <ImageIcon color="primary" />;
    return <InsertDriveFile color="action" />;
};

const NotesHelper = () => {
    const { id: courseId } = useParams();
    const { courses, notes, notesLoading, uploadProgress, fetchNotes, addNote, deleteNote, getNoteUrl } = useTeacher();
    const course = courses.find(c => c.id === courseId);
    const courseNotes = notes[courseId] || [];
    const uploading = Object.keys(uploadProgress || {});

    // Fetch notes when course loads
    useEffect(() => {
        if (courseId) fetchNotes(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const onDrop = useCallback(async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            await addNote(courseId, file);
        }
    }, [courseId, addNote]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': [],
            'image/*': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
            'application/msword': [],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
    });

    const handleDownload = async (note) => {
        try {
            // Download the file as a blob from Supabase Storage
            const { data, error } = await supabase.storage
                .from('course-notes')
                .download(note.file_path);
            if (error) throw error;

            // Create a blob URL and trigger download
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = note.file_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: open public URL in new tab
            const url = getNoteUrl(note.file_path);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Course Notes</Typography>
                <Typography variant="subtitle1" color="text.secondary">{course.name}</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Drop Zone */}
                    <Paper
                        {...getRootProps()}
                        variant="outlined"
                        sx={{
                            p: 5, textAlign: 'center', cursor: 'pointer', mb: 3,
                            borderStyle: 'dashed', borderWidth: 2,
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            bgcolor: isDragActive ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 56, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop files here…' : 'Drag & drop files, or click to select'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            PDF, DOCX, Images — max 10MB each
                        </Typography>
                    </Paper>

                    {/* Upload progress */}
                    {uploading.length > 0 && (
                        <Box mb={2}>
                            {uploading.map(name => (
                                <Box key={name} mb={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Uploading {name}…
                                    </Typography>
                                    <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* File List */}
                    <Paper elevation={2}>
                        <Box p={2} borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">
                                Uploaded Files
                            </Typography>
                            <Chip label={`${courseNotes.length} file${courseNotes.length !== 1 ? 's' : ''}`} size="small" />
                        </Box>

                        {notesLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : (
                            <List>
                                {courseNotes.length === 0 ? (
                                    <ListItem>
                                        <ListItemText
                                            primary="No notes uploaded yet"
                                            secondary="Upload files above to share with students"
                                        />
                                    </ListItem>
                                ) : courseNotes.map((note) => (
                                    <ListItem key={note.id} divider>
                                        <ListItemIcon>
                                            {getIcon(note.file_type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={note.file_name}
                                            secondary={
                                                <Box component="span" display="flex" gap={1} alignItems="center">
                                                    <span>{note.file_size}</span>
                                                    <span>•</span>
                                                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Download">
                                                <IconButton
                                                    edge="end"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleDownload(note)}
                                                >
                                                    <Download />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    edge="end"
                                                    color="error"
                                                    onClick={() => deleteNote(courseId, note.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Info sidebar */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Storage Info</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Files are stored securely in Supabase Storage and accessible to enrolled students.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Supported formats:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                            {['PDF', 'DOCX', 'DOC', 'JPG', 'PNG'].map(f => (
                                <Chip key={f} label={f} size="small" variant="outlined" />
                            ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                            Max file size: 10MB
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NotesHelper;
