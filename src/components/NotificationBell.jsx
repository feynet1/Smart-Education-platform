import { useState } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Tooltip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
        handleClose();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <SuccessIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            case 'event': return <EventIcon color="primary" />;
            case 'info':
            default: return <InfoIcon color="info" />;
        }
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1, mr: 1 }}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 500 },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={() => markAllAsRead()} sx={{ textTransform: 'none' }}>
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No notifications yet.
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notif) => (
                            <ListItem
                                key={notif.id}
                                alignItems="flex-start"
                                onClick={() => handleNotificationClick(notif)}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: notif.is_read ? 'transparent' : 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'transparent' }}>
                                        {getIcon(notif.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" sx={{ fontWeight: notif.is_read ? 400 : 600 }}>
                                            {notif.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                {notif.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>
                {notifications.length > 0 && (
                    <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button size="small" fullWidth onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                            Close
                        </Button>
                    </Box>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
