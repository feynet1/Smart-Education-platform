import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Container,
    FormControlLabel,
    Link,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginSchema } from '../../utils/validationSchemas';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const { login, loginWithGoogle, profile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Read ?error=no_account from URL (set by AuthContext after killing an uninvited Google session)
    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error') === 'no_account'
        ? 'No account found for this Google address. Contact your administrator to get invited.'
        : '';

    const [serverError, setServerError] = useState(urlError);
    const [successMessage] = useState(location.state?.message || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect to correct dashboard once authenticated with a valid profile
    useEffect(() => {
        if (isAuthenticated && profile) {
            let target = '/student/dashboard';
            if (profile.role === 'Teacher') target = '/teacher/dashboard';
            else if (profile.role === 'Admin') target = '/admin/dashboard';
            navigate(target, { replace: true });
        }
    }, [isAuthenticated, profile, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerError('');
        try {
            await login(data.email, data.password);
            // Redirection is handled by the useEffect above once the profile is loaded.
        } catch (error) {
            setServerError(error || 'Failed to login');
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setServerError('');
        try {
            await loginWithGoogle();
        } catch (error) {
            setServerError(error || 'Failed to login with Google');
        }
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                        Sign in to access your dashboard
                    </Typography>

                    {serverError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {serverError}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            autoComplete="email"
                            autoFocus
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            {...register('email')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            {...register('password')}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, height: 48 }}
                            disabled={isSubmitting || !isValid}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                        
                        <Divider sx={{ my: 2 }}>or</Divider>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={handleGoogleLogin}
                            sx={{ mb: 3, height: 48 }}
                        >
                            Sign In with Google
                        </Button>

                        <Box display="flex" justifyContent="center">
                            <Link component={RouterLink} to="/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
