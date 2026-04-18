import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Container,
    TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import { supabase } from '../../supabaseClient';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const [password, setPassword]   = useState('');
    const [confirm, setConfirm]     = useState('');
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [invitedEmail, setInvitedEmail] = useState('');

    useEffect(() => {
        // Check if already signed in (e.g. redirected from ProtectedRoute with pendingInvite)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setInvitedEmail(session.user.email ?? '');
                setSessionReady(true);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
                setInvitedEmail(session.user.email ?? '');
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
            // Only update password — never allow email change here
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            await supabase.auth.signOut();
            navigate('/login', {
                replace: true,
                state: { message: 'Account activated! Please log in with your new password.' }
            });
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
                            If this takes too long, the link may have expired. Ask your admin to resend the invite.
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
                        Activate Your Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Set a password for your account.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        {/* Read-only email — locked to the invited address */}
                        <TextField
                            margin="normal" fullWidth
                            label="Email" value={invitedEmail}
                            disabled
                            helperText="This is the email your account is tied to"
                        />
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
