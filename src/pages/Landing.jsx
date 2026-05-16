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

// Flag colors
const FLAG_RED = '#DA121A';
const FLAG_WHITE = '#FFFFFF';
const FLAG_BLACK = '#000000';
const ETH_GREEN = '#078930';
const ETH_YELLOW = '#FCDD09';
const ETH_RED = '#DA121A';
const ETH_BLUE = '#0F47AF'; // Star center

// ─── High-quality images from Unsplash CDN ───────────────────────────────────
// Hero: MacBook displaying online class / group of people (Chris Montgomery)
const HERO_IMG =
    'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=1400&q=90&fit=crop';

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
    'Multi-language support including Afaan Oromoo',
    'Accessible from any device, anywhere in Oromia',
    'Compliant with Oromia Education Bureau standards',
    'Dedicated support for Oromia academic calendar',
];

const Landing = () => {
    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', fontFamily: '"Roboto", sans-serif' }}>

            {/* Oromia flag stripe */}
            <Box sx={{ display: 'flex', height: 6 }}>
                <Box sx={{ flex: 1, bgcolor: FLAG_RED }} />
                <Box sx={{ flex: 1, bgcolor: FLAG_WHITE }} />
                <Box sx={{ flex: 1, bgcolor: FLAG_BLACK }} />
            </Box>

            {/* Navbar */}
            <Box sx={{
                px: { xs: 2, md: 6 }, py: 1.5,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
                    <img src="/logo.png" alt="GG SCHOOL NETWORK Logo" style={{ height: 40, width: 'auto', borderRadius: '4px' }} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" lineHeight={1.1}>
                            GG SCHOOL NETWORK
                        </Typography>
                        <Typography variant="caption" color="text.secondary" lineHeight={1}>
                            Gerba Guracha, Kuyu
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                        Gerba Guracha&apos;s Smart GG SCHOOL NETWORK
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

            {/* ═══════════════════════════════════════════════════════════
                 HERO — Full-screen, image background, rich content
            ═══════════════════════════════════════════════════════════ */}
            <Box sx={{
                position: 'relative',
                minHeight: { xs: '92vh', md: '95vh' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {/* Full-bleed background image */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${HERO_IMG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 30%',
                    zIndex: 0,
                }} />

                {/* Multi-layer gradient overlay — deep green→blue with opacity */}
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: `
                        linear-gradient(
                            135deg,
                            rgba(7,137,48,0.92) 0%,
                            rgba(15,71,175,0.85) 55%,
                            rgba(7,137,48,0.75) 100%
                        )
                    `,
                }} />

                {/* Decorative blobs */}
                <Box sx={{
                    position: 'absolute', top: -120, right: -120, zIndex: 1,
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(252,221,9,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -100, left: -100, zIndex: 1,
                    width: 420, height: 420, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(218,18,26,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <Box sx={{
                    position: 'absolute', top: '40%', left: '50%', zIndex: 1,
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(252,221,9,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Content */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 10, md: 6 } }}>
                    <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

                        {/* ── Left: Text ── */}
                        <Grid item xs={12} md={6}>
                            {/* Badge */}
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: 10, px: 2, py: 0.8, mb: 3
                            }}>
                                <Typography variant="body2" color="#fff" fontWeight={600} letterSpacing={0.5}>
                                    #1 GG SCHOOL NETWORK in Gerba Guracha
                                </Typography>
                            </Box>

                            {/* Main headline */}
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4rem', lg: '4.6rem' },
                                    fontWeight: 900,
                                    color: '#fff',
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.5px',
                                    mb: 1.5,
                                    textShadow: '0 4px 24px rgba(0,0,0,0.3)',
                                }}
                            >
                                Manage Education.
                                <Box component="span" sx={{
                                    display: 'block',
                                    color: ETH_YELLOW,
                                    textShadow: `0 0 40px rgba(252,221,9,0.5)`,
                                }}>
                                    Empower Gerba Guracha.
                                </Box>
                            </Typography>

                            {/* Amharic subtitle */}
                            <Typography sx={{
                                fontSize: { xs: '1.1rem', md: '1.35rem' },
                                color: 'rgba(255,255,255,0.88)',
                                fontWeight: 400,
                                mb: 2,
                                fontStyle: 'italic',
                                letterSpacing: 0.3,
                            }}>
                                ትምህርትን ያስተዳድሩ። ገረባ ጉራቻን ያብቁ።
                            </Typography>

                            {/* Description */}
                            <Typography sx={{
                                fontSize: { xs: '1rem', md: '1.15rem' },
                                color: 'rgba(255,255,255,0.82)',
                                lineHeight: 1.75,
                                mb: 4,
                                maxWidth: 520,
                            }}>
                                A unified online platform connecting <strong style={{ color: '#fff' }}>Admins</strong>,{' '}
                                <strong style={{ color: '#fff' }}>Teachers</strong>, and{' '}
                                <strong style={{ color: '#fff' }}>Students</strong> across Gerba Guracha and Kuyu —
                                track attendance, manage courses, view grades, and collaborate in real time.
                            </Typography>

                            {/* CTA Buttons */}
                            <Box display="flex" gap={2} flexWrap="wrap" mb={5}>
                                <Button
                                    component={RouterLink} to="/register"
                                    size="large"
                                    sx={{
                                        bgcolor: ETH_YELLOW, color: '#111', fontWeight: 800,
                                        fontSize: '1rem', px: 4, py: 1.6, borderRadius: 3,
                                        boxShadow: `0 8px 32px rgba(252,221,9,0.45)`,
                                        '&:hover': {
                                            bgcolor: '#ffe033',
                                            boxShadow: `0 12px 40px rgba(252,221,9,0.6)`,
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    🚀 Get Started Free
                                </Button>
                                <Button
                                    component={RouterLink} to="/login"
                                    size="large"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(8px)',
                                        border: '2px solid rgba(255,255,255,0.5)',
                                        color: '#fff', fontWeight: 700,
                                        fontSize: '1rem', px: 4, py: 1.6, borderRadius: 3,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.22)',
                                            border: '2px solid #fff',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Sign In →
                                </Button>
                            </Box>

                            {/* Trust indicators */}
                            <Box display="flex" gap={3} flexWrap="wrap">
                                {[
                                    { icon: '✅', text: 'Free to start' },
                                    { icon: '🔒', text: 'Secure & private' },
                                    { icon: '📱', text: 'Works on any device' },
                                ].map(t => (
                                    <Box key={t.text} display="flex" alignItems="center" gap={0.8}>
                                        <Typography sx={{ fontSize: 16 }}>{t.icon}</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                                            {t.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* ── Right: Clean image card + floating badges ── */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative', mt: { xs: 4, md: 0 } }}>

                                {/* Main image — no browser chrome, clean card */}
                                <Box sx={{
                                    borderRadius: 5,
                                    overflow: 'hidden',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.55)',
                                    border: `4px solid rgba(252,221,9,0.7)`,
                                    transform: { md: 'perspective(1200px) rotateY(-4deg) rotateX(2deg)' },
                                    transition: 'transform 0.4s ease',
                                    '&:hover': {
                                        transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg)',
                                    },
                                    height: { xs: 260, sm: 340, md: 420 },
                                }}>
                                    <img
                                        src={HERO_IMG}
                                        alt="Students learning online with GG SCHOOL NETWORK"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center top',
                                            display: 'block',
                                        }}
                                    />
                                    {/* Subtle inner gradient at bottom for depth */}
                                    <Box sx={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        height: 80,
                                        background: 'linear-gradient(to top, rgba(7,137,48,0.35), transparent)',
                                        pointerEvents: 'none',
                                    }} />
                                </Box>

                                {/* Floating stat card — top left */}
                                <Box sx={{
                                    position: 'absolute', top: { xs: -18, md: -22 }, left: { xs: 12, md: -32 },
                                    bgcolor: '#fff', borderRadius: 3, px: 2.5, py: 1.5,
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    border: `2px solid ${ETH_GREEN}`,
                                    zIndex: 3,
                                }}>
                                    <Box sx={{
                                        width: 42, height: 42, borderRadius: 2,
                                        bgcolor: ETH_GREEN,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <PeopleIcon sx={{ color: '#fff', fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800} color={ETH_GREEN} lineHeight={1}>
                                            500+
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Active Students
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floating stat card — bottom right */}
                                <Box sx={{
                                    position: 'absolute', bottom: { xs: -18, md: -22 }, right: { xs: 12, md: -28 },
                                    bgcolor: '#fff', borderRadius: 3, px: 2.5, py: 1.5,
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    border: `2px solid ${ETH_BLUE}`,
                                    zIndex: 3,
                                }}>
                                    <Box sx={{
                                        width: 42, height: 42, borderRadius: 2,
                                        bgcolor: ETH_BLUE,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <BarChartIcon sx={{ color: '#fff', fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800} color={ETH_BLUE} lineHeight={1}>
                                            Real-Time
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Grades & Attendance
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floating badge — top right */}
                                <Box sx={{
                                    position: 'absolute', top: { xs: 50, md: 32 }, right: { xs: 12, md: -36 },
                                    bgcolor: ETH_YELLOW, borderRadius: 3, px: 2, py: 1.2,
                                    boxShadow: '0 8px 28px rgba(252,221,9,0.55)',
                                    zIndex: 3,
                                    textAlign: 'center',
                                }}>
                                    <Typography variant="caption" fontWeight={800} color="#111" display="block">
                                        Made for
                                    </Typography>
                                    <Typography variant="caption" fontWeight={800} color="#111" display="block">
                                        Gerba Guracha
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>

                {/* Bottom wave divider */}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, lineHeight: 0 }}>
                    <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
                        style={{ display: 'block', width: '100%', height: 80 }}>
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
                    </svg>
                </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 6, md: 8 }, borderBottom: `4px solid ${ETH_YELLOW}` }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={5}>
                        <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                            Platform Stats
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" mt={1}>
                            Trusted by Oromia Institutions
                        </Typography>
                        {/* Mobile swipe indicator */}
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
                            👉 Swipe to see all stats
                        </Typography>
                    </Box>

                    {/* Mobile: Horizontal scroll carousel */}
                    <Box sx={{
                        display: { xs: 'block', md: 'none' },
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        mx: -2, px: 2,
                    }}>
                        <Box sx={{ display: 'flex', gap: 3, pb: 2 }}>
                            {stats.map((s) => (
                                <Card key={s.label} elevation={0} sx={{
                                    flex: '0 0 75%',
                                    scrollSnapAlign: 'center',
                                    bgcolor: '#fff',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: `2px solid ${ETH_GREEN}`,
                                    textAlign: 'center',
                                }}>
                                    <CardContent sx={{ py: 3, px: 2 }}>
                                        <Avatar sx={{ bgcolor: ETH_GREEN, mx: 'auto', mb: 1.5, width: 56, height: 56 }}>
                                            {s.icon}
                                        </Avatar>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: ETH_GREEN, mb: 0.5 }}>
                                            {s.value}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                            {s.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* Desktop: 2x2 Grid layout */}
                    <Grid container spacing={3} justifyContent="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                        {stats.map((s, idx) => (
                            <Grid item xs={6} md={3} key={s.label}>
                                <Card elevation={0} sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: `2px solid ${[ETH_GREEN, ETH_BLUE, ETH_RED, ETH_YELLOW][idx]}`,
                                    textAlign: 'center',
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent sx={{ py: 3.5, px: 2 }}>
                                        <Avatar sx={{
                                            bgcolor: [ETH_GREEN, ETH_BLUE, ETH_RED, ETH_YELLOW][idx],
                                            mx: 'auto',
                                            mb: 2,
                                            width: 60,
                                            height: 60
                                        }}>
                                            {s.icon}
                                        </Avatar>
                                        <Typography variant="h3" fontWeight="bold" sx={{
                                            color: [ETH_GREEN, ETH_BLUE, ETH_RED, ETH_YELLOW][idx],
                                            mb: 0.5
                                        }}>
                                            {s.value}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                            {s.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* About */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={6} alignItems="center">
                    {/* Images section */}
                    <Grid item xs={12} md={6}>
                        {/* Mobile: Horizontal scroll carousel */}
                        <Box sx={{
                            display: { xs: 'block', md: 'none' },
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            mx: -2, px: 2,
                            mb: 4,
                        }}>
                            <Box sx={{ display: 'flex', gap: 2, pb: 2 }}>
                                {[ABOUT_IMG_1, ABOUT_IMG_2, ABOUT_IMG_3, ABOUT_IMG_4].map((img, i) => (
                                    <Box key={i} sx={{
                                        flex: '0 0 75%',
                                        scrollSnapAlign: 'center',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: 3,
                                        height: 220,
                                        border: i === 0 ? `3px solid ${ETH_GREEN}` :
                                            i === 1 ? `3px solid ${ETH_YELLOW}` :
                                                i === 2 ? `3px solid ${ETH_RED}` : `3px solid ${ETH_BLUE}`,
                                        position: 'relative',
                                    }}>
                                        <img src={img} alt={`education ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        {/* Image number badge */}
                                        <Box sx={{
                                            position: 'absolute', bottom: 12, right: 12,
                                            bgcolor: 'rgba(0,0,0,0.65)',
                                            backdropFilter: 'blur(8px)',
                                            color: '#fff',
                                            borderRadius: 2,
                                            px: 1.5, py: 0.5,
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}>
                                            {i + 1} / 4
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Desktop: 2x2 Grid (unchanged) */}
                        <Grid container spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
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

                    {/* Text content */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="overline" fontWeight="bold" sx={{ color: ETH_GREEN }}>
                            About the Platform
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" gutterBottom mt={1}>
                            Built for Gerba Guracha Schools
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            GG SCHOOL NETWORK is a comprehensive school management system designed specifically for
                            educational institutions in Gerba Guracha and the Kuyu town area.
                            Everything is connected in real time — aligned with local standards.
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
                            Powerful tools for every role in your Gerba Guracha institution
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
                    {/* Mobile swipe indicator */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
                        👉 Swipe to see all roles
                    </Typography>
                </Box>

                {/* Mobile: Horizontal scroll carousel */}
                <Box sx={{
                    display: { xs: 'block', md: 'none' },
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    mx: -2, px: 2,
                }}>
                    <Box sx={{ display: 'flex', gap: 3, pb: 2 }}>
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
                        ].map((r, idx) => (
                            <Card key={r.role} elevation={0} sx={{
                                flex: '0 0 88%',
                                scrollSnapAlign: 'center',
                                border: `2px solid ${r.color}`,
                                borderRadius: 3,
                                boxShadow: 3,
                                position: 'relative',
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    {/* Role number badge */}
                                    <Box sx={{
                                        position: 'absolute', top: 12, right: 12,
                                        bgcolor: r.color,
                                        color: '#fff',
                                        borderRadius: 2,
                                        width: 28, height: 28,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 13,
                                        fontWeight: 800,
                                    }}>
                                        {idx + 1}
                                    </Box>
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
                        ))}
                    </Box>
                </Box>

                {/* Desktop: Grid layout (unchanged) */}
                <Grid container spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
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
                        {/* Mobile swipe indicator */}
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
                            👉 Swipe to explore
                        </Typography>
                    </Box>

                    {/* Mobile: Horizontal scroll carousel */}
                    <Box sx={{
                        display: { xs: 'block', md: 'none' },
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none', // Firefox
                        '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
                        mx: -2, px: 2, // Bleed to edges
                    }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            pb: 2, // Space for shadow
                        }}>
                            {GALLERY.map((img, i) => (
                                <Box key={i} sx={{
                                    flex: '0 0 85%', // Each card takes 85% width
                                    scrollSnapAlign: 'center',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    boxShadow: 4,
                                    height: 240,
                                    border: `3px solid ${[ETH_GREEN, ETH_YELLOW, ETH_RED, ETH_BLUE, ETH_GREEN, ETH_YELLOW][i]}`,
                                    position: 'relative',
                                }}>
                                    <img src={img} alt={`gallery ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    {/* Image number badge */}
                                    <Box sx={{
                                        position: 'absolute', top: 12, right: 12,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        backdropFilter: 'blur(8px)',
                                        color: '#fff',
                                        borderRadius: 2,
                                        px: 1.5, py: 0.5,
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}>
                                        {i + 1} / {GALLERY.length}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Desktop: Grid layout (unchanged) */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                    </Box>
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
                        Join Gerba Guracha institutions on GG SCHOOL NETWORK and experience seamless, modern education management.
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
                                <Typography variant="subtitle1" fontWeight="bold" color="#fff">GG SCHOOL NETWORK</Typography>
                            </Box>
                            <Typography variant="body2" color="#888">
                                Gerba Guracha&apos;s modern school management system — connecting every stakeholder in the academic journey.
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
                            <Typography variant="body2" color="#888">Gerba Guracha, Kuyu, Oromia</Typography>
                            <Typography variant="body2" color="#888">info@ggschool.net</Typography>
                            <Typography variant="body2" color="#888">+251 900 000 000</Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: '#2a2a3e', mb: 2 }} />
                    {/* Oromia flag stripe in footer */}
                    <Box sx={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                        <Box sx={{ flex: 1, bgcolor: FLAG_RED }} />
                        <Box sx={{ flex: 1, bgcolor: FLAG_WHITE }} />
                        <Box sx={{ flex: 1, bgcolor: FLAG_BLACK }} />
                    </Box>
                    <Typography variant="body2" textAlign="center" color="#666">
                        © {new Date().getFullYear()} GG SCHOOL NETWORK - Gerba Guracha, Kuyu. All rights reserved. | ሁሉም መብቶች የተጠበቁ ናቸው።
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Landing;
