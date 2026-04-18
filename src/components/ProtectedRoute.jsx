import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { profile, isAuthenticated, loading, pendingInvite } = useAuth();
    const location = useLocation();

    if (loading || (isAuthenticated && !profile && !pendingInvite)) {
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
