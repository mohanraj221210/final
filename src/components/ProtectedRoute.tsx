import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    useEffect(() => {
        if (!isLoggedIn) {
            // If we are on a warden route, redirect to warden login
            if (location.pathname.startsWith('/warden')) {
                navigate('/wardenlogin');
            } else if (location.pathname.startsWith('/year-incharge')) { // Added Year Incharge Logic
                navigate('/year-incharge-login');
            } else {
                navigate('/login');
            }
        }
    }, [isLoggedIn, navigate, location.pathname]);

    return isLoggedIn ? <>{children}</> : null;
};

export default ProtectedRoute;
