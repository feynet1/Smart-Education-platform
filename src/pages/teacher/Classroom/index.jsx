import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Button, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, TextField } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { VideoCall, Send, Person } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';

const ClassroomHelper = () => {
    const { id } = useParams();
    const { courses } = useTeacher();
    const course = courses.find(c => c.id === id);

    // Mock Chat Messages
    const messages = [
        { id: 1, sender: 'Alice', text: 'Good morning everyone!' },
        { id: 2, sender: 'Bob', text: 'Is the assignment due today?' },
    ];

    if (!course) {
        return <Typography>Course not found</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        {course.name} <Typography component="span" variant="h5" color="text.secondary">({course.subject})</Typography>
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Classroom Interface
                    </Typography>
                </Box>
                <Button variant="contained" color="error" startIcon={<VideoCall />} size="large">
                    Start Live Class
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Info & QR */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Join Code
                        </Typography>
                        <Typography variant="h3" color="primary" sx={{ letterSpacing: 4, fontWeight: 'bold' }} gutterBottom>
                            {course.joinCode}
                        </Typography>
                        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                            <QRCodeSVG value={course.joinCode} size={150} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Scan to join the class
                        </Typography>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Attendees (Mock)
                        </Typography>
                        <List dense>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <ListItem key={i}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 30, height: 30 }}>
                                            <Person />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`Student ${i}`} secondary="Online" />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Column: Chat/Content */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Class Chat
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
                            {messages.map((msg) => (
                                <Box key={msg.id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        {msg.sender}
                                    </Typography>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', maxWidth: '80%' }}>
                                        <Typography variant="body2">
                                            {msg.text}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message..."
                                sx={{ mr: 1 }}
                            />
                            <Button variant="contained" endIcon={<Send />}>
                                Send
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClassroomHelper;
