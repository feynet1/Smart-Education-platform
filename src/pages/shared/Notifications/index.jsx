import {
    Box, Typography, List, ListItem, ListItemAvatar, ListItemText,
    Avatar, Chip, Divider, Button, Paper, IconButton, Tooltip,
} from '@mui/material';
import {
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Event as EventIcon,
    DoneAll as DoneAllIcon,
    NotificationsNone as EmptyIcon,
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const getIcon = (type) => {
    switch (type) {
        case 'success': return <SuccessIcon color="success" />;
        case 'warning': return <WarningIcon color="warning" />;
        case 'event':   return <EventIcon color="primary" />;
        case 'info':
        default:        return <InfoIcon color="info" />;
    }
};

const NotificationsPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        All your alerts and messages in one place
                    </Typography>
                </Box>
                {unreadCount > 0 && (
                    <Tooltip title="Mark all as read">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DoneAllIcon />}
                            onClick={markAllAsRead}
                        >
                            Mark all as read ({unreadCount})
                        </Button>
                    </Tooltip>
                )}
            </Box>

            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                {notifications.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
                        <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                            No notifications yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            You will see alerts, events, and messages here.
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((notif, idx) => (
                            <Box key={notif.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    onClick={() => markAsRead(notif.id)}
                                    sx={{
                                        cursor: notif.is_read ? 'default' : 'pointer',
                                        bgcolor: notif.is_read ? 'transparent' : 'action.hover',
                                        py: 2,
                                        '&:hover': { bgcolor: 'action.selected' },
                                    }}
                                    secondaryAction={
                                        !notif.is_read && (
                                            <Chip
                                                label="New"
                                                size="small"
                                                color="primary"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
                                            {getIcon(notif.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={notif.is_read ? 400 : 700}
                                            >
                                                {notif.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box mt={0.5}>
                                                <Typography variant="body2" color="text.secondary" display="block">
                                                    {notif.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {idx < notifications.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default NotificationsPage;
