import { Box, Button, Container, Paper, Typography } from '@mui/material';
import useAuth from '../../hooks/useAuth';

const StudentDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1" color="primary">
                        Student Dashboard
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={logout}>
                        Logout
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Welcome, {user?.name}!
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Role: <Box component="span" fontWeight="bold" color="primary.main">{user?.role}</Box>
                </Typography>

                <Box mt={4} p={2} bgcolor="background.default" borderRadius={2}>
                    <Typography variant="body2">
                        This is the student portal area. You can access your course materials and grades here.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default StudentDashboard;
