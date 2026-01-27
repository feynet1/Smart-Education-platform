import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { loginSchema } from '../../utils/validationSchemas';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const user = await login(data.email, data.password);
            // specific dashboard redirect based on role
            let target = '/student/dashboard';
            if (user.role === 'Teacher') target = '/teacher/dashboard';
            else if (user.role === 'Admin') target = '/admin/dashboard';
            navigate(target, { replace: true });
        } catch (error) {
            setServerError(error || 'Failed to login');
        } finally {
            setIsSubmitting(false);
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
