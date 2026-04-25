import {
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Paper, Typography, Box, Divider, IconButton, Tooltip,
} from '@mui/material';
import {
    School, FactCheck, Note, PlayArrow, Stop,
    Delete as DeleteIcon, CloudUpload, DeleteForever,
} from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { formatDistanceToNow } from 'date-fns';

const ACTION_CONFIG = {
    'Created course':   { icon: <School />,       color: 'primary.main' },
    'Deleted course':   { icon: <DeleteForever />, color: 'error.main' },
    'Uploaded file':    { icon: <CloudUpload />,   color: 'success.main' },
    'Deleted file':     { icon: <DeleteForever />, color: 'error.main' },
    'Saved attendance': { icon: <FactCheck />,     color: 'info.main' },
    'Started session':  { icon: <PlayArrow />,     color: 'success.main' },
    'Ended session':    { icon: <Stop />,          color: 'warning.main' },
};

const getConfig = (action) =>
    ACTION_CONFIG[action] || { icon: <Note />, color: 'text.secondary' };

const RecentActivity = () => {
    const { teacherLogs, deleteTeacherLog } = useTeacher();

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                {teacherLogs.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        Last {teacherLogs.length} actions
                    </Typography>
                )}
            </Box>

            {teacherLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No activity yet. Start by creating a course.
                </Typography>
            ) : (
                <List dense disablePadding>
                    {teacherLogs.map((log, index) => {
                        const { icon, color } = getConfig(log.action);
                        return (
                            <Box key={log.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{ px: 0 }}
                                    secondaryAction={
                                        <Tooltip title="Remove">
                                            <IconButton
                                                size="small"
                                                onClick={() => deleteTeacherLog(log.id)}
                                                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{
                                            width: 34, height: 34,
                                            bgcolor: 'background.paper',
                                            color, border: '1px solid',
                                            borderColor: color,
                                        }}>
                                            {icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2">
                                                <strong>{log.action}</strong>
                                                {log.detail ? ` — ${log.detail}` : ''}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < teacherLogs.length - 1 && <Divider variant="inset" component="li" />}
                            </Box>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
};

export default RecentActivity;
