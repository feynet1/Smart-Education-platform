import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    CssBaseline,
    useTheme,
    useMediaQuery,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Grade as GradeIcon,
    Event as EventIcon,
    Person as PersonIcon,
    FactCheck as AttendanceIcon,
    Assignment as AssignmentIcon,
    Notifications as NotificationsIcon,
    AccountCircle,
    Add as AddIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import { useStudent } from '../contexts/StudentContext';
import NotificationBell from '../components/NotificationBell';
import { Scanner } from '@yudiel/react-qr-scanner';

const drawerWidth = 240;

const StudentLayout = () => {
    const { user, profile, logout } = useAuth();
    const { enrollInCourse } = useStudent();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [scanMode, setScanMode] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleJoinClass = async () => {
        const result = await enrollInCourse(joinCode.toUpperCase());
        setSnackbar({ open: true, message: result.message || 'Error joining class', severity: result.success ? 'success' : 'error' });
        if (result.success) {
            setJoinDialogOpen(false);
            setJoinCode('');
        }
    };

    const menuItems = [
        { text: 'Dashboard',   icon: <DashboardIcon />,   path: '/student/dashboard' },
        { text: 'My Courses',  icon: <SchoolIcon />,      path: '/student/courses' },
        { text: 'Assignments', icon: <AssignmentIcon />,  path: '/student/assignments' },
        { text: 'Grades',      icon: <GradeIcon />,       path: '/student/grades' },
        { text: 'Attendance',  icon: <AttendanceIcon />,  path: '/student/attendance' },
        { text: 'Events',      icon: <EventIcon />,       path: '/student/events' },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/student/notifications' },
        { text: 'Profile',     icon: <PersonIcon />,      path: '/student/profile' },
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 1 }}>
                <img src="/logo.png" alt="Logo" style={{ height: 40, width: 'auto' }} />
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname.startsWith(item.path)}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Student Dashboard
                    </Typography>

                    <Button
                        color="inherit"
                        startIcon={<AddIcon />}
                        onClick={() => setJoinDialogOpen(true)}
                        sx={{ mr: 2 }}
                        size="small"
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Join Class</Box>
                    </Button>

                    <NotificationBell />

                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar
                            src={profile?.avatar_url || undefined}
                            sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                        >
                            {!profile?.avatar_url && (user?.name ? user.name.charAt(0) : <AccountCircle />)}
                        </Avatar>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>{user?.name}</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8, minHeight: '100vh', bgcolor: '#F4F6F8' }}
            >
                <Outlet />
            </Box>

            {/* Join Class Dialog */}
            <Dialog open={joinDialogOpen} onClose={() => {
                setJoinDialogOpen(false);
                setScanMode(false);
            }}>
                <DialogTitle>Join a Class</DialogTitle>
                <DialogContent>
                    <Box display="flex" gap={2} mb={2} mt={1}>
                        <Button 
                            variant={!scanMode ? "contained" : "outlined"} 
                            onClick={() => setScanMode(false)}
                            fullWidth
                            size="small"
                        >
                            Enter Code
                        </Button>
                        <Button 
                            variant={scanMode ? "contained" : "outlined"} 
                            onClick={() => setScanMode(true)}
                            fullWidth
                            size="small"
                        >
                            Scan QR
                        </Button>
                    </Box>

                    {!scanMode ? (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Enter the class code provided by your teacher.
                            </Typography>
                            <TextField
                                autoFocus
                                fullWidth
                                label="Class Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
                            />
                        </>
                    ) : (
                        <Box sx={{ width: '100%', maxWidth: 400, margin: '0 auto', overflow: 'hidden', borderRadius: 2 }}>
                            <Scanner
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        const code = result[0].rawValue;
                                        if (code) {
                                            setJoinCode(code.trim().toUpperCase());
                                            setScanMode(false); // switch back to let user confirm or we can auto submit
                                        }
                                    }
                                }}
                                onError={(error) => {
                                    console.error(error);
                                }}
                                components={{
                                    audio: false,
                                    finder: true,
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                Point your camera at the teacher's QR code.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setJoinDialogOpen(false);
                        setScanMode(false);
                    }}>Cancel</Button>
                    <Button onClick={handleJoinClass} variant="contained" disabled={!joinCode}>Join</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentLayout;
