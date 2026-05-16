import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Checkbox, Container,
    FormControlLabel, Link, TextField, Typography, Alert,
    CircularProgress, Divider,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginSchema } from '../../utils/validationSchemas';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const { login, loginWithGoogle, profile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [serverError, setServerError] = useState(location.state?.error || '');
    const [successMessage] = useState(location.state?.message || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Ethiopian flag colors
    const ETH_GREEN = '#078930';
    const ETH_BLUE = '#0F47AF';
    const ETH_YELLOW = '#FCDD09';

    useEffect(() => {
        if (isAuthenticated && profile) {
            let target = '/student/dashboard';
            if (profile.role === 'Teacher')     target = '/teacher/dashboard';
            else if (profile.role === 'Admin')       target = '/admin/dashboard';
            else if (profile.role === 'Super Admin') target = '/admin/dashboard';
            navigate(target, { replace: true });
        }
    }, [isAuthenticated, profile, navigate]);

    const { register, handleSubmit, formState: { errors, isValid } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerError('');
        try {
            await login(data.email, data.password);
        } catch (error) {
            setServerError(error || 'Failed to login');
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setServerError('');
        try {
            await loginWithGoogle();
        } catch (error) {
            setServerError(error || 'Failed to login with Google');
            setGoogleLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${ETH_GREEN} 0%, ${ETH_BLUE} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            py: 4
        }}>
            {/* Decorative background elements */}
            <Box sx={{
                position: 'absolute', top: -100, right: -100,
                width: 400, height: 400, borderRadius: '50%',
                background: 'rgba(252, 221, 9, 0.1)',
                filter: 'blur(80px)',
            }} />
            <Box sx={{
                position: 'absolute', bottom: -150, left: -150,
                width: 500, height: 500, borderRadius: '50%',
                background: 'rgba(218, 18, 26, 0.1)',
                filter: 'blur(100px)',
            }} />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                            <Box sx={{
                                width: 80, height: 80, borderRadius: '50%',
                                p: 1, mb: 2, bgcolor: '#fff',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="900" textAlign="center" sx={{ color: '#1a1a1a', mb: 0.5 }}>
                                Welcome To
                            </Typography>
                            <Typography variant="h5" fontWeight="900" textAlign="center" sx={{ color: ETH_GREEN, letterSpacing: -0.5 }}>
                                GG SCHOOL NETWORK
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Sign in to your account to continue
                            </Typography>
                        </Box>

                        {serverError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>}
                        {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMessage}</Alert>}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                autoComplete="email"
                                autoFocus
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                {...register('email')}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                {...register('password')}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label={<Typography variant="body2">Remember me</Typography>}
                                />
                                <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ fontWeight: 600, color: ETH_BLUE }}>
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting || !isValid}
                                sx={{
                                    mt: 3, mb: 2, height: 52,
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    bgcolor: ETH_GREEN,
                                    '&:hover': { bgcolor: '#056b25' },
                                    boxShadow: `0 8px 16px rgba(7, 137, 48, 0.25)`
                                }}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In Now'}
                            </Button>

                            <Divider sx={{ my: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    OR CONTINUE WITH
                                </Typography>
                            </Divider>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={googleLoading ? <CircularProgress size={18} /> : <GoogleIcon />}
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                sx={{
                                    height: 52, borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: '#e0e0e0',
                                    color: '#444',
                                    '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' }
                                }}
                            >
                                Google Account
                            </Button>

                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: ETH_BLUE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                        Join our Network
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
