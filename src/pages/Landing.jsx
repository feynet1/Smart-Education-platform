import { Box, Button, Container, Typography, Grid, Card, CardContent, Avatar, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';

import img1 from '../images/images.jpg';
import img2 from '../images/images (1).jpg';
import img3 from '../images/images (2).jpg';
import img4 from '../images/images (3).jpg';

const features = [
    {
        icon: <SchoolIcon fontSize="large" color="primary" />,
        title: 'Course Management',
        desc: 'Teachers create and manage courses, upload materials, and track student progress all in one place.',
    },
    {
        icon: <PeopleIcon fontSize="large" color="primary" />,
        title: 'Role-Based Access',
        desc: 'Separate dashboards for Admins, Teachers, and Students — everyone sees exactly what they need.',
    },
    {
        icon: <AssignmentIcon fontSize="large" color="primary" />,
        title: 'Attendance Tracking',
        desc: 'Mark and monitor attendance per class session with real-time records accessible to all stakeholders.',
    },
    {
        icon: <BarChartIcon fontSize="large" color="primary" />,
        title: 'Grades & Reports',
        desc: 'Students view their grades instantly. Admins generate platform-wide academic reports with ease.',
    },
    {
        icon: <EventIcon fontSize="large" color="primary" />,
        title: 'Events & Announcements',
        desc: 'Admins publish academic events, exams, and meetings visible to the right audience automatically.',
    },
    {
        icon: <SecurityIcon fontSize="large" color="primary" />,
        title: 'Secure Invite System',
        desc: 'Admin-controlled user creation via email invitations — no unauthorized registrations.',
    },
];

const stats = [
    { value: '3', label: 'User Roles' },
    { value: '100%', label: 'Cloud-Based' },
    { value: 'Real-Time', label: 'Data Sync' },
    { value: 'Secure', label: 'Auth System' },
];

const gallery = [img1, img2, img3, img4];

const Landing = () => {
    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>

            {/* Navbar */}
            <Box sx={{ px: { xs: 2, md: 6 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 100 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <img src="/logo.jpg" alt="logo" style={{ height: 36, borderRadius: 6 }} />
                    <Typography variant="h6" fontWeight="bold" color="primary">EduPlatform</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button component={RouterLink} to="/login" variant="outlined" size="small">Sign In</Button>
                    <Button component={RouterLink} to="/register" variant="contained" size="small">Get Started</Button>
                </Box>
            </Box>

            {/* Hero */}
            <Box sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: '#fff', py: { xs: 8, md: 12 }, px: 2 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip label="Smart Education Platform" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 2 }} />
                            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>
                                Manage Education.<br />Empower Learning.
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
                                A unified platform for admins, teachers, and students to collaborate, track progress, and achieve academic excellence.
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Button component={RouterLink} to="/register" variant="contained"
                                    size="large" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}>
                                    Get Started Free
                                </Button>
                                <Button component={RouterLink} to="/login" variant="outlined" size="large"
                                    sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                    Sign In
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                                <img src={img1} alt="Education platform" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats */}
            <Box sx={{ bgcolor: '#f8f9fa', py: 5 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} justifyContent="center">
                        {stats.map(s => (
                            <Grid item xs={6} md={3} key={s.label} sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold" color="primary">{s.value}</Typography>
                                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* About */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            {[img2, img3].map((img, i) => (
                                <Grid item xs={6} key={i}>
                                    <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                                        <img src={img} alt={`education ${i}`} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="overline" color="primary" fontWeight="bold">About the Platform</Typography>
                        <Typography variant="h4" fontWeight="bold" gutterBottom mt={1}>
                            Built for Modern Education Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            EduPlatform is a comprehensive school management system designed to streamline every aspect of academic administration. From course creation to grade reporting, everything is connected in real time.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Admins control the platform, teachers manage their classrooms, and students stay on top of their academic journey — all from a single, intuitive interface.
                        </Typography>
                        <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ mt: 1 }}>
                            Access Dashboard
                        </Button>
                    </Grid>
                </Grid>
            </Container>

            {/* Features */}
            <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="overline" color="primary" fontWeight="bold">Features</Typography>
                        <Typography variant="h4" fontWeight="bold" mt={1}>Everything You Need</Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Powerful tools for every role in your institution
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {features.map(f => (
                            <Grid item xs={12} sm={6} md={4} key={f.title}>
                                <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light', mb: 2, width: 52, height: 52 }}>
                                            {f.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>{f.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Gallery */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Box textAlign="center" mb={6}>
                    <Typography variant="overline" color="primary" fontWeight="bold">Gallery</Typography>
                    <Typography variant="h4" fontWeight="bold" mt={1}>A Glimpse of the Experience</Typography>
                </Box>
                <Grid container spacing={2}>
                    {gallery.map((img, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
                                <img src={img} alt={`gallery ${i}`} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA */}
            <Box sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', py: { xs: 8, md: 10 }, textAlign: 'center', color: '#fff' }}>
                <Container maxWidth="sm">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Ready to Get Started?</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                        Join your institution on EduPlatform and experience seamless education management.
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                        <Button component={RouterLink} to="/register" variant="contained" size="large"
                            sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}>
                            Create Account
                        </Button>
                        <Button component={RouterLink} to="/login" variant="outlined" size="large"
                            sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            Sign In
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#1a1a2e', color: '#aaa', py: 4, textAlign: 'center' }}>
                <Typography variant="body2">© {new Date().getFullYear()} EduPlatform. All rights reserved.</Typography>
            </Box>
        </Box>
    );
};

export default Landing;
