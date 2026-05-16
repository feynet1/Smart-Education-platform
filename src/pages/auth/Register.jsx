import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Container, Link,
    TextField, Typography, Alert, CircularProgress, MenuItem
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { registerSchema, GRADES } from '../../utils/validationSchemas';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';

// Ethiopian flag colors
const ETH_GREEN = '#078930';
const ETH_BLUE = '#0F47AF';
const ETH_YELLOW = '#FCDD09';

// Invite-only message shown when registration is disabled
const InviteOnlyMessage = () => (
    <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${ETH_GREEN} 0%, ${ETH_BLUE} 100%)`,
        py: 4
    }}>
        <Container maxWidth="xs">
            <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ py: 4 }}>
                    <Box sx={{
                        width: 80, height: 80, borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.05)', mx: 'auto', mb: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="900" gutterBottom>
                        Invite Only
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                        Registration is currently closed. Accounts are created by administrators via invitation.
                        Contact your admin if you need access.
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        fullWidth
                        sx={{
                            borderRadius: 2, height: 48, fontWeight: 700,
                            bgcolor: ETH_GREEN, '&:hover': { bgcolor: '#056b25' }
                        }}
                    >
                        Back to Sign In
                    </Button>
                </CardContent>
            </Card>
        </Container>
    </Box>
);

// Full registration form shown when admin enables open registration
const RegisterForm = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const googleError = searchParams.get('error') === 'no_account'
        ? 'No existing account found for your Google address. Please register below to create one.'
        : '';

    const [serverError, setServerError]     = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting]   = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerError('');
        setSuccessMessage('');
        try {
            await registerUser(data);
            setSuccessMessage('Registration successful! Please check your email to verify your account.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setServerError(error || 'Failed to register');
        } finally {
            setIsSubmitting(false);
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
            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                            <Box sx={{
                                width: 70, height: 70, borderRadius: '50%',
                                p: 1, mb: 2, bgcolor: '#fff',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="900" textAlign="center" sx={{ color: '#1a1a1a', mb: 0.5 }}>
                                Join our
                            </Typography>
                            <Typography variant="h5" fontWeight="900" textAlign="center" sx={{ color: ETH_GREEN, letterSpacing: -0.5 }}>
                                GG SCHOOL NETWORK
                            </Typography>
                        </Box>

                        {googleError   && <Alert severity="info"    sx={{ mb: 2, borderRadius: 2 }}>{googleError}</Alert>}
                        {serverError   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{serverError}</Alert>}
                        {successMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMessage}</Alert>}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField margin="dense" required fullWidth label="Full Name"
                                error={!!errors.name} helperText={errors.name?.message} {...register('name')}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            
                            <TextField margin="dense" required fullWidth label="Email Address" autoComplete="email"
                                error={!!errors.email} helperText={errors.email?.message} {...register('email')}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField margin="dense" required fullWidth label="Password" type="password"
                                    error={!!errors.password} helperText={errors.password?.message} {...register('password')}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                
                                <TextField margin="dense" required fullWidth label="Confirm" type="password"
                                    error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} {...register('confirmPassword')}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            </Box>

                            <TextField margin="dense" required fullWidth select label="Select Role" defaultValue=""
                                inputProps={register('role')} error={!!errors.role} helperText={errors.role?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mt: 1 }}>
                                <MenuItem value="Student">Student</MenuItem>
                                <MenuItem value="Teacher">Teacher</MenuItem>
                            </TextField>

                            {selectedRole === 'Student' && (
                                <TextField margin="dense" required fullWidth select label="Your Grade" defaultValue=""
                                    inputProps={register('grade')} error={!!errors.grade}
                                    helperText={errors.grade?.message || 'Access courses for your grade'}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mt: 1 }}>
                                    {GRADES.map(g => (
                                        <MenuItem key={g} value={g}>
                                            {g === 'University' ? 'University' : `Grade ${g}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <Button type="submit" fullWidth variant="contained"
                                sx={{
                                    mt: 4, mb: 2, height: 52, borderRadius: 2,
                                    fontSize: '1rem', fontWeight: 700, textTransform: 'none',
                                    bgcolor: ETH_GREEN, '&:hover': { bgcolor: '#056b25' },
                                    boxShadow: `0 8px 16px rgba(7, 137, 48, 0.25)`
                                }} disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
                            </Button>

                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: ETH_BLUE, textDecoration: 'none' }}>
                                        Sign In
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

const Register = () => {
    const [registrationEnabled, setRegistrationEnabled] = useState(null);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const { data, error } = await supabase
                    .from('platform_settings')
                    .select('value')
                    .eq('key', 'registrationEnabled')
                    .single();
                if (error) throw error;
                const val = data?.value;
                setRegistrationEnabled(val === true || val === 'true');
            } catch {
                setRegistrationEnabled(false);
            }
        };
        fetchSetting();
    }, []);

    if (registrationEnabled === null) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: `linear-gradient(135deg, ${ETH_GREEN} 0%, ${ETH_BLUE} 100%)` }}>
                <CircularProgress sx={{ color: '#fff' }} />
            </Box>
        );
    }

    return registrationEnabled ? <RegisterForm /> : <InviteOnlyMessage />;
};

export default Register;
