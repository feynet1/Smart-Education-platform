import {
    Box, Button, Container, Typography, Grid, Card, CardContent,
    Avatar, Chip, Divider, Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Ethiopian flag colors
const ETH_GREEN = '#078930';
const ETH_YELLOW = '#FCDD09';
const ETH_RED = '#DA121A';
const ETH_BLUE = '#0F47AF'; // Star center

// ─── High-quality images from Unsplash CDN ───────────────────────────────────
// Hero: student using laptop for online learning (Chris Montgomery)
const HERO_IMG =
    'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=1200&q=90&fit=crop';

// About grid: online-platform / edtech themed
const ABOUT_IMG_1 =
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=85&fit=crop'; // students collaborating on laptop
const ABOUT_IMG_2 =
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=85&fit=crop'; // teacher at whiteboard
const ABOUT_IMG_3 =
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=85&fit=crop'; // student studying on laptop
const ABOUT_IMG_4 =
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=85&fit=crop'; // person writing notes

// Gallery: online education / edtech platform scenes
const GALLERY = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=85&fit=crop', // video call / online class
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=85&fit=crop', // coding on laptop
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85&fit=crop', // team working on screens
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85&fit=crop', // analytics dashboard
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85&fit=crop', // students with laptops
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=85&fit=crop', // student smiling with laptop
];

const features = [
    {
        icon: <SchoolIcon fontSize="large" />,
        title: 'Course Management',
        desc: 'Teachers create and manage courses, upload materials, and track student progress all in one place.',
        color: ETH_GREEN,
    },
    {
        icon: <PeopleIcon fontSize="large" />,
        title: 'Role-Based Access',
        desc: 'Separate dashboards for Admins, Teachers, and Students — everyone sees exactly what they need.',
        color: ETH_BLUE,
    },
    {
        icon: <AssignmentIcon fontSize="large" />,
        title: 'Attendance Tracking',
        desc: 'Mark and monitor attendance per class session with real-time records accessible to all stakeholders.',
        color: ETH_RED,
    },
    {
        icon: <BarChartIcon fontSize="large" />,
        title: 'Grades & Reports',
        desc: 'Students view their grades instantly. Admins generate platform-wide academic reports with ease.',
        color: ETH_GREEN,
    },
    {
        icon: <EventIcon fontSize="large" />,
        title: 'Events & Announcements',
        desc: 'Admins publish academic events, exams, and meetings visible to the right audience automatically.',
        color: ETH_BLUE,
    },
    {
        icon: <SecurityIcon fontSize="large" />,
        title: 'Secure Invite System',
        desc: 'Admin-controlled user creation via email invitations — no unauthorized registrations.',
        color: ETH_RED,
    },
];

const stats = [
    { value: '3', label: 'User Roles', icon: <PeopleIcon /> },
    { value: '100%', label: 'Cloud-Based', icon: <SchoolIcon /> },
    { value: 'Real-Time', label: 'Data Sync', icon: <BarChartIcon /> },
    { value: 'Secure', label: 'Auth System', icon: <SecurityIcon /> },
];

const benefits = [
    'Centralized academic records for all students',
    'Instant notifications for events and deadlines',
    'Multi-language support including Amharic',
    'Accessible from any device, anywhere in Ethiopia',
    'Compliant with Ethiopian Ministry of Education standards',
    'Dedicated support for Ethiopian academic calendar',
];

const Landing = () => {
    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', fontFamily: '"Roboto", sans-serif' }}>

            {/* Ethiopian flag stripe */}
            <Box sx={{ display: 'flex', height: 5 }}>
                <Box sx={{ flex: 1, bgcolor: ETH_GREEN }} />
                <Box sx={{ flex: 1, bgcolor: ETH_YELLOW }} />
                <Box sx={{ flex: 1, bgcolor: ETH_RED }} />
            </Box>

            {/* Navbar */}
            <Box sx={{
                px: { xs: 2, md: 6 }, py: 1.5,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${ETH_GREEN}, ${ETH_BLUE})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" lineHeight={1.1}>
                            EduPlatform
                        </Typography>
                        <Typography variant="caption" color="text.secondary" lineHeight={1}>
                            የትምህርት አስተዳደር
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                        Ethiopia&apos;s Smart Education Platform
                    </Typography>
                    <Button component={RouterLink} to="/login" variant="outlined" size="small"
                        sx={{ borderColor: ETH_GREEN, color: ETH_GREEN, '&:hover': { borderColor: ETH_GREEN, bgcolor: '#f0faf0' } }}>
                        Sign In
                    </Button>
                    <Button component={RouterLink} to="/register" variant="contained" size="small"
                        sx={{ bgcolor: ETH_GREEN, '&:hover': { bgcolor: '#056b25' } }}>
                        Get Started
                    </Button>
                </Box>
            </Box>

            {/* Hero */}
            <Box sx={{
                background: `linear-gradient(135deg, ${ETH_GREEN} 0%, ${ETH_BLUE} 100%)`,
                color: '#fff', py: { xs: 8, md: 12 }, px: 2,
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <Box sx={{
                    position: 'absolute', top: -80, right: -80,
                    width: 320, height: 320, borderRadius: '50%',
                    bgcolor: 'rgba(252,221,9,0.12)', pointerEvents: 'none'
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -60, left: -60,
                    width: 240, height: 240, borderRadius: '50%',
                    bgcolor: 'rgba(218,18,26,0.10)', pointerEvents: 'none'
                }} />

                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip
                                label="🇪🇹  Smart Education Platform — Ethiopia"
                                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', mb: 2, fontWeight: 600 }}
                            />
                            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>
                                Manage Education.<br />Empower Ethiopia.
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.92, mb: 1, fontWeight: 400 }}>
                                ትምህርትን ያስተዳድሩ። ኢትዮጵያን ያብቁ።
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
                                A unified platform for Ethiopian schools — connecting admins, teachers, and students
                                to collaborate, track progress, and achieve academic excellence.
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Button
                                    component={RouterLink} to="/register"
                                    variant="contained" size="large"
                                    sx={{ bgcolor: ETH_YELLOW, color: '#1a1a1a', fontWeight: 700, '&:hover': { bgcolor: '#e0c200' } }}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    component={RouterLink} to="/login"
                                    variant="outlined" size="large"
                                    sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}
                                >
                                    Sign In
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {/* Browser-frame mockup */}
                            <Box sx={{
                                borderRadius: 4, overflow: 'hidden',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
                                border: `3px solid ${ETH_YELLOW}`,
                                bgcolor: '#1a1a2e',
                            }}>
                                {/* Fake browser bar */}
                                <Box sx={{
                                    bgcolor: '#1e2a3a', px: 2, py: 1,
                                    display: 'flex', alignItems: 'center', gap: 1
                                }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ETH_RED }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ETH_YELLOW }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ETH_GREEN }} />
                                    <Box sx={{
                                        flex: 1, mx: 1, bgcolor: '#2d3e50', borderRadius: 1,
                                        px: 1.5, py: 0.4
                                    }}>
                                        <Typography variant="caption" color="#8899aa" sx={{ fontSize: 10 }}>
                                            app.eduplatform.et/dashboard
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ height: { xs: 220, md: 360 } }}>
                                    <img
                                        src={HERO_IMG}
                                        alt="EduPlatform online dashboard"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats */}
            <Box sx={{ bgcolor: '#f8f9fa', py: 5, borderBottom: `4px solid ${ETH_YELLOW}` }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} justifyContent="center">
                        {stats.map(s => (
                            <Grid item xs={6} md={3} key={s.label} sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    bgcolor: '#fff', borderRadius: 3, py: 3, px: 2,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                                    border: '1px solid #f0f0f0',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
                                }}>
                                    <Avatar sx={{ bgcolor: ETH_GREEN, mx: 'auto', mb: 1.5, width: 52, height: 52 }}>
                                        {s.icon}
                                    </Avatar>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: ETH_GREEN }}>{s.value}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                                </Box>
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
                            {[ABOUT_IMG_1, ABOUT_IMG_2, ABOUT_IMG_3, ABOUT_IMG_4].map((img, i) => (
                                <Grid item xs={6} key={i}>
                                    <Box sx={{
                                        borderRadius: 3, overflow: 'hidden',
                                        boxShadow: 3, height: 190,
                                        border: i === 0 ? `3px solid ${ETH_GREEN}` :
                                            i === 1 ? `3px solid ${ETH_YELLOW}` :
                                                i === 2 ? `3px solid ${ETH_RED}` : `3px solid ${ETH_BLUE}`
                                    }}>
                                        <img src={img} alt={`education ${i}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                            About the Platform
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" gutterBottom mt={1}>
                            Built for Ethiopian Schools & Universities
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            EduPlatform is a comprehensive school management system designed specifically for
                            Ethiopian educational institutions. From course creation to grade reporting,
                            everything is connected in real time — aligned with the Ethiopian academic calendar
                            and Ministry of Education standards.
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: ETH_YELLOW, borderWidth: 2 }} />
                        <Stack spacing={1} mb={3}>
                            {benefits.map(b => (
                                <Box key={b} display="flex" alignItems="center" gap={1}>
                                    <CheckCircleOutlineIcon sx={{ color: ETH_GREEN, fontSize: 20 }} />
                                    <Typography variant="body2" color="text.secondary">{b}</Typography>
                                </Box>
                            ))}
                        </Stack>
                        <Button
                            component={RouterLink} to="/login"
                            variant="contained" size="large"
                            sx={{ bgcolor: ETH_GREEN, '&:hover': { bgcolor: '#056b25' } }}
                        >
                            Access Dashboard
                        </Button>
                    </Grid>
                </Grid>
            </Container>

            {/* Features */}
            <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 6, md: 10 }, borderTop: `4px solid ${ETH_GREEN}` }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                            Platform Features
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" mt={1}>
                            Everything Your School Needs
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Powerful tools for every role in your Ethiopian institution
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {features.map(f => (
                            <Grid item xs={12} sm={6} md={4} key={f.title}>
                                <Card elevation={0} sx={{
                                    border: '1px solid #e0e0e0', borderRadius: 3, height: '100%',
                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                    '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Avatar sx={{ bgcolor: f.color, mb: 2, width: 52, height: 52 }}>
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

            {/* Who It's For */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Box textAlign="center" mb={6}>
                    <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                        Who It&apos;s For
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" mt={1}>
                        Designed for Every Role
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    {[
                        {
                            icon: <SecurityIcon fontSize="large" />,
                            role: 'Administrators',
                            amharic: 'አስተዳዳሪዎች',
                            color: ETH_RED,
                            points: ['Manage all users and roles', 'Generate institution-wide reports', 'Control platform settings', 'Publish events & announcements'],
                        },
                        {
                            icon: <MenuBookIcon fontSize="large" />,
                            role: 'Teachers',
                            amharic: 'አስተማሪዎች',
                            color: ETH_GREEN,
                            points: ['Create and manage courses', 'Track attendance per session', 'Grade assignments & exams', 'Communicate with students'],
                        },
                        {
                            icon: <EmojiEventsIcon fontSize="large" />,
                            role: 'Students',
                            amharic: 'ተማሪዎች',
                            color: ETH_BLUE,
                            points: ['View enrolled courses', 'Check grades in real time', 'Track attendance records', 'Stay updated on events'],
                        },
                    ].map(r => (
                        <Grid item xs={12} md={4} key={r.role}>
                            <Card elevation={0} sx={{
                                border: `2px solid ${r.color}`, borderRadius: 3, height: '100%',
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: 6 }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Avatar sx={{ bgcolor: r.color, mb: 1.5, width: 56, height: 56 }}>
                                        {r.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">{r.role}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                        {r.amharic}
                                    </Typography>
                                    <Stack spacing={1}>
                                        {r.points.map(p => (
                                            <Box key={p} display="flex" alignItems="center" gap={1}>
                                                <CheckCircleOutlineIcon sx={{ color: r.color, fontSize: 18 }} />
                                                <Typography variant="body2" color="text.secondary">{p}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Gallery */}
            <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 6, md: 10 }, borderTop: `4px solid ${ETH_RED}` }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                            Gallery
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" mt={1}>
                            A Glimpse of the Experience
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                            Empowering students and teachers across Ethiopia
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {/* Large feature image */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{
                                borderRadius: 3, overflow: 'hidden',
                                boxShadow: 4, height: { xs: 220, md: 340 },
                                transition: 'transform 0.25s, box-shadow 0.25s',
                                '&:hover': { transform: 'scale(1.02)', boxShadow: 8 },
                                border: `3px solid ${ETH_GREEN}`
                            }}>
                                <img src={GALLERY[0]} alt="online class session"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack spacing={2} height="100%">
                                {[GALLERY[1], GALLERY[2]].map((img, i) => (
                                    <Box key={i} sx={{
                                        borderRadius: 3, overflow: 'hidden',
                                        boxShadow: 2, flex: 1, minHeight: 160,
                                        transition: 'transform 0.25s, box-shadow 0.25s',
                                        '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                                        border: `2px solid ${i === 0 ? ETH_YELLOW : ETH_RED}`
                                    }}>
                                        <img src={img} alt={`gallery ${i + 2}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                        {/* Bottom row */}
                        {[GALLERY[3], GALLERY[4], GALLERY[5]].map((img, i) => (
                            <Grid item xs={12} sm={4} key={i + 3}>
                                <Box sx={{
                                    borderRadius: 3, overflow: 'hidden',
                                    boxShadow: 2, height: 200,
                                    transition: 'transform 0.25s, box-shadow 0.25s',
                                    '&:hover': { transform: 'scale(1.04)', boxShadow: 8 },
                                    border: `2px solid ${[ETH_BLUE, ETH_GREEN, ETH_YELLOW][i]}`
                                }}>
                                    <img src={img} alt={`gallery ${i + 4}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{
                background: `linear-gradient(135deg, ${ETH_GREEN} 0%, ${ETH_BLUE} 100%)`,
                py: { xs: 8, md: 10 }, textAlign: 'center', color: '#fff',
                position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute', top: -60, right: -60,
                    width: 260, height: 260, borderRadius: '50%',
                    bgcolor: 'rgba(252,221,9,0.15)', pointerEvents: 'none'
                }} />
                <Container maxWidth="sm" sx={{ position: 'relative' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Ready to Transform Your School?
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                        ትምህርት ቤትዎን ለመቀየር ዝግጁ ነዎት?
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
                        Join Ethiopian institutions on EduPlatform and experience seamless, modern education management.
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                        <Button
                            component={RouterLink} to="/register"
                            variant="contained" size="large"
                            sx={{ bgcolor: ETH_YELLOW, color: '#1a1a1a', fontWeight: 700, '&:hover': { bgcolor: '#e0c200' } }}
                        >
                            Create Account
                        </Button>
                        <Button
                            component={RouterLink} to="/login"
                            variant="outlined" size="large"
                            sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#0d1b2a', color: '#aaa', py: 5 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} mb={3}>
                        <Grid item xs={12} md={4}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <Box sx={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${ETH_GREEN}, ${ETH_BLUE})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <SchoolIcon sx={{ color: '#fff', fontSize: 18 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold" color="#fff">EduPlatform</Typography>
                            </Box>
                            <Typography variant="body2" color="#888">
                                Ethiopia&apos;s modern school management system — connecting every stakeholder in the academic journey.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" color="#fff" fontWeight="bold" mb={1}>Platform</Typography>
                            {['Features', 'About', 'Gallery'].map(l => (
                                <Typography key={l} variant="body2" color="#888" sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: ETH_YELLOW } }}>
                                    {l}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" color="#fff" fontWeight="bold" mb={1}>Access</Typography>
                            {['Sign In', 'Register', 'Admin Portal'].map(l => (
                                <Typography key={l} variant="body2" color="#888" sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: ETH_YELLOW } }}>
                                    {l}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="#fff" fontWeight="bold" mb={1}>Contact</Typography>
                            <Typography variant="body2" color="#888">Addis Ababa, Ethiopia</Typography>
                            <Typography variant="body2" color="#888">info@eduplatform.et</Typography>
                            <Typography variant="body2" color="#888">+251 911 000 000</Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: '#2a2a3e', mb: 2 }} />
                    {/* Ethiopian flag stripe in footer */}
                    <Box sx={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                        <Box sx={{ flex: 1, bgcolor: ETH_GREEN }} />
                        <Box sx={{ flex: 1, bgcolor: ETH_YELLOW }} />
                        <Box sx={{ flex: 1, bgcolor: ETH_RED }} />
                    </Box>
                    <Typography variant="body2" textAlign="center" color="#666">
                        © {new Date().getFullYear()} EduPlatform Ethiopia. All rights reserved. | ሁሉም መብቶች የተጠበቁ ናቸው።
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Landing;
