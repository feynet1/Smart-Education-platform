import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, Button, Grid } from '@mui/material';
import { CloudUpload, InsertDriveFile, Delete, Download, PictureAsPdf, Image as ImageIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTeacher } from '../../../contexts/TeacherContext';

const NotesHelper = () => {
    const { id } = useParams();
    const { courses, notes, addNote, deleteNote } = useTeacher();
    const course = courses.find(c => c.id === id);
    const courseNotes = notes[id] || [];

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach(file => {
            // Mock file object for state, in real app upload to server
            const newFile = {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type,
                preview: URL.createObjectURL(file)
            };
            addNote(id, newFile);
        });
    }, [id, addNote]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': [],
            'image/*': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
        },
        maxSize: 10485760 // 10MB
    });

    const getIcon = (type) => {
        if (type.includes('pdf')) return <PictureAsPdf color="error" />;
        if (type.includes('image')) return <ImageIcon color="primary" />;
        return <InsertDriveFile color="action" />;
    };

    if (!course) return <Typography>Course not found</Typography>;

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Course Notes
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {course.name}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Upload Area */}
                    <Paper
                        {...getRootProps()}
                        variant="outlined"
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            mb: 4
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? "Drop files here..." : "Drag & drop notes here, or click to select"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Supported: PDF, DOCX, Images (Max 10MB)
                        </Typography>
                    </Paper>

                    {/* File List */}
                    <Paper elevation={2}>
                        <Box p={2} borderBottom={1} borderColor="divider">
                            <Typography variant="h6" fontWeight="bold">
                                Uploaded Files
                            </Typography>
                        </Box>
                        <List>
                            {courseNotes.length === 0 ? (
                                <ListItem>
                                    <ListItemText primary="No notes uploaded yet." secondary="Upload mock files to see them here." />
                                </ListItem>
                            ) : (
                                courseNotes.map((note) => (
                                    <ListItem key={note.id} divider>
                                        <ListItemIcon>
                                            {getIcon(note.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={note.name}
                                            secondary={note.size}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="download" sx={{ mr: 1 }}>
                                                <Download />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => deleteNote(id, note.id)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NotesHelper;
