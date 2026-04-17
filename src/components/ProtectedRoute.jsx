import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, profile, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Wait until loading is done and we have the profile if authenticated
    if (loading || (isAuthenticated && !profile)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect to their appropriate dashboard if unauthorized for this route
        let dashboard = '/student/dashboard';
        if (profile.role === 'Teacher') dashboard = '/teacher/dashboard';
        else if (profile.role === 'Admin') dashboard = '/admin/dashboard';
        return <Navigate to={dashboard} replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
