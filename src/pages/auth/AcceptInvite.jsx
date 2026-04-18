import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Container,
    TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import { supabase } from '../../supabaseClient';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase puts the token in the URL hash on invite links.
    // The JS client picks it up automatically via onAuthStateChange.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
                setSessionReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            // Redirect to login after password is set
            await supabase.auth.signOut();
            navigate('/login', { replace: true, state: { message: 'Password set successfully. Please log in.' } });
        } catch (err) {
            setError(err.message ?? 'Failed to set password. The invite link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!sessionReady) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
                <Card sx={{ p: 2 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="body1">Verifying your invite link...</Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                            If this takes too long, the link may have expired. Request a new invite from your admin.
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Set Your Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Welcome! Choose a password to activate your account.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal" required fullWidth
                            label="New Password" type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="Minimum 8 characters"
                        />
                        <TextField
                            margin="normal" required fullWidth
                            label="Confirm Password" type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                        <Button
                            type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, height: 48 }}
                            disabled={loading || !password || !confirm}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Activate Account'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AcceptInvite;
