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
    Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    FactCheck as AttendanceIcon,
    Grade as GradeIcon,
    Event as EventIcon,
    Assessment as ReportIcon,
    Settings as SettingsIcon,
    AccountCircle,
    AdminPanelSettings,
    SupervisorAccount as SuperAdminIcon,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

const drawerWidth = 260;

// Sidebar items for Super Admin — full access
const superAdminMenuItems = [
    { text: 'Dashboard',  icon: <DashboardIcon />,  path: '/admin/dashboard'  },
    { text: 'Users',      icon: <PeopleIcon />,      path: '/admin/users'      },
    { text: 'Courses',    icon: <SchoolIcon />,      path: '/admin/courses'    },
    { text: 'Attendance', icon: <AttendanceIcon />,  path: '/admin/attendance' },
    { text: 'Grades',     icon: <GradeIcon />,       path: '/admin/grades'     },
    { text: 'Events',     icon: <EventIcon />,       path: '/admin/events'     },
    { text: 'Reports',    icon: <ReportIcon />,      path: '/admin/reports'    },
    { text: 'Settings',   icon: <SettingsIcon />,    path: '/admin/settings'   },
];

// Sidebar items for Admin — no Reports, no Settings
const adminMenuItems = [
    { text: 'Dashboard',  icon: <DashboardIcon />,  path: '/admin/dashboard'  },
    { text: 'Users',      icon: <PeopleIcon />,      path: '/admin/users'      },
    { text: 'Courses',    icon: <SchoolIcon />,      path: '/admin/courses'    },
    { text: 'Attendance', icon: <AttendanceIcon />,  path: '/admin/attendance' },
    { text: 'Grades',     icon: <GradeIcon />,       path: '/admin/grades'     },
    { text: 'Events',     icon: <EventIcon />,       path: '/admin/events'     },
];

const AdminLayout = () => {
    const { user, profile, logout } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();
    const theme     = useTheme();
    const isMobile  = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl,   setAnchorEl]   = useState(null);

    const isSuperAdmin = profile?.role === 'Super Admin';

    // Visual tokens per role
    const roleLabel     = isSuperAdmin ? 'Super Admin' : 'Admin';
    const roleColor     = isSuperAdmin ? '#7C3AED'     : '#D32F2F'; // violet vs red
    const chipBg        = isSuperAdmin ? '#EDE9FE'     : '#FFEBEE';
    const panelTitle    = isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel';
    const menuItems     = isSuperAdmin ? superAdminMenuItems : adminMenuItems;
    const HeaderIcon    = isSuperAdmin ? SuperAdminIcon : AdminPanelSettings;

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenu  = (e) => setAnchorEl(e.currentTarget);
    const handleClose = ()  => setAnchorEl(null);
    const handleLogout = () => { handleClose(); logout(); };

    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 2 }}>
                <Box textAlign="center">
                    <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                        <HeaderIcon sx={{ color: roleColor }} />
                        <Typography variant="h6" noWrap component="div"
                            sx={{ fontWeight: 'bold', color: roleColor }}>
                            {panelTitle}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        EduPlatform
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                mx: 1,
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: isSuperAdmin ? '#EDE9FE' : 'primary.light',
                                    color: roleColor,
                                    '& .MuiListItemIcon-root': {
                                        color: roleColor,
                                    },
                                },
                                '&:hover': {
                                    bgcolor: isSuperAdmin ? '#F5F3FF' : undefined,
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Role badge at the bottom of sidebar */}
            <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
                <Divider sx={{ mb: 1.5 }} />
                <Chip
                    label={roleLabel}
                    size="small"
                    icon={<HeaderIcon style={{ fontSize: 14, color: roleColor }} />}
                    sx={{
                        bgcolor: chipBg,
                        color: roleColor,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        width: '100%',
                        '& .MuiChip-label': { px: 1 },
                    }}
                />
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml:    { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1,
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
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                    </Typography>

                    {/* Role chip in AppBar */}
                    <Chip
                        label={roleLabel}
                        size="small"
                        sx={{
                            mr: 2,
                            bgcolor: chipBg,
                            color: roleColor,
                            fontWeight: 700,
                            border: `1px solid ${roleColor}`,
                        }}
                    />

                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 36, height: 36, bgcolor: roleColor }}>
                            {user?.name ? user.name.charAt(0) : <AccountCircle />}
                        </Avatar>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" fontWeight="bold">{user?.name}</Typography>
                        </MenuItem>
                        <MenuItem disabled>
                            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                        </MenuItem>
                        <MenuItem disabled>
                            <Typography variant="caption" sx={{ color: roleColor, fontWeight: 600 }}>
                                {roleLabel}
                            </Typography>
                        </MenuItem>
                        <Divider />
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
                    ModalProps={{ keepMounted: true }}
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
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: '100vh',
                    bgcolor: '#F4F6F8',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
