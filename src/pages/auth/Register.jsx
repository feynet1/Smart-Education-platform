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

// Invite-only message shown when registration is disabled
const InviteOnlyMessage = () => (
    <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        <Card sx={{ p: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
                <LockIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography component="h1" variant="h5" gutterBottom>
                    Invite Only
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Registration is currently closed. Accounts are created by administrators via invitation.
                    Contact your admin if you need access.
                </Typography>
                <Link component={RouterLink} to="/login" variant="body2">
                    Back to Sign In
                </Link>
            </CardContent>
        </Card>
    </Container>
);

// Full registration form shown when admin enables open registration
const RegisterForm = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Show info message when redirected from Google sign-in with no account
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
        <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Create Account
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                        Join our Education Platform
                    </Typography>

                    {googleError   && <Alert severity="info"    sx={{ mb: 2 }}>{googleError}</Alert>}
                    {serverError   && <Alert severity="error"   sx={{ mb: 2 }}>{serverError}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField margin="normal" required fullWidth label="Full Name" autoFocus
                            error={!!errors.name} helperText={errors.name?.message} {...register('name')} />
                        <TextField margin="normal" required fullWidth label="Email Address" autoComplete="email"
                            error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
                        <TextField margin="normal" required fullWidth label="Password" type="password"
                            error={!!errors.password} helperText={errors.password?.message} {...register('password')} />
                        <TextField margin="normal" required fullWidth label="Confirm Password" type="password"
                            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} {...register('confirmPassword')} />
                        <TextField margin="normal" required fullWidth select label="Select Role" defaultValue=""
                            inputProps={register('role')} error={!!errors.role} helperText={errors.role?.message}>
                            <MenuItem value="Student">Student</MenuItem>
                            <MenuItem value="Teacher">Teacher</MenuItem>
                        </TextField>

                        {/* Grade selector — only shown for Students */}
                        {selectedRole === 'Student' && (
                            <TextField margin="normal" required fullWidth select label="Select Your Grade" defaultValue=""
                                inputProps={register('grade')} error={!!errors.grade} helperText={errors.grade?.message || 'You will only see courses for your grade'}>
                                {GRADES.map(g => (
                                    <MenuItem key={g} value={g}>
                                        {g === 'University' ? 'University' : `Grade ${g}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <Button type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, mb: 2, height: 48 }} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                        </Button>
                        <Box display="flex" justifyContent="center">
                            <Link component={RouterLink} to="/login" variant="body2">
                                Already have an account? Sign In
                            </Link>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

const Register = () => {
    const [registrationEnabled, setRegistrationEnabled] = useState(null); // null = loading

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const { data, error } = await supabase
                    .from('platform_settings')
                    .select('value')
                    .eq('key', 'registrationEnabled')
                    .single();
                if (error) throw error;
                // jsonb column returns the value as a JS value directly
                const val = data?.value;
                setRegistrationEnabled(val === true || val === 'true');
            } catch {
                // If table doesn't exist or fetch fails, default to invite-only
                setRegistrationEnabled(false);
            }
        };
        fetchSetting();
    }, []);

    // Loading state
    if (registrationEnabled === null) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return registrationEnabled ? <RegisterForm /> : <InviteOnlyMessage />;
};

export default Register;
