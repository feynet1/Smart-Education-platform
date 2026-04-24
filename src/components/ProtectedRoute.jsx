import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { profile, isAuthenticated, loading, pendingInvite, noProfile } = useAuth();
    const location = useLocation();

    if (loading || (isAuthenticated && !profile && !pendingInvite && !noProfile)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // User clicked invite link — must set password before accessing dashboard
    if (pendingInvite) {
        return <Navigate to="/accept-invite" replace />;
    }

    // Authenticated but no profile row — block access, send to login
    if (isAuthenticated && noProfile) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
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
