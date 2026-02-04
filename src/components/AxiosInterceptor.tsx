import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AxiosInterceptor = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Create an interceptor
        const interceptor = axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                const userType = localStorage.getItem('userType');

                // Check if the user is a Staff member
                if (userType === 'staff') {
                    // Check for Unauthorized (401) or Forbidden (403)
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {

                        // Prevent handling if we are already on the login page (optional, but good for safety)
                        // The route for staff login is '/staff-login'
                        if (location.pathname !== '/staff-login') {

                            // Clear Staff authentication data
                            localStorage.removeItem('token');
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('userType');

                            // Optional: Show a brief message
                            // Using a unique toastId prevents duplicate toasts
                            if (!toast.isActive('session-expired')) {
                                toast.error("Session expired. Please login again.", {
                                    toastId: 'session-expired',
                                    position: "bottom-right",
                                    autoClose: 3000
                                });
                            }

                            // Automatically redirect to Staff Login
                            navigate('/staff-login');
                        }
                    }

                    // Also check for specific error messages if status is not 401/403 but message implies it
                    // (Though usually backend should send 401/403)
                    else if (error.response && error.response.data && error.response.data.message) {
                        const message = error.response.data.message.toLowerCase();
                        if (message.includes('invalid token') ||
                            message.includes('token expired') ||
                            message.includes('unauthorized access')) {

                            if (location.pathname !== '/staff-login') {
                                localStorage.removeItem('token');
                                localStorage.removeItem('isLoggedIn');
                                localStorage.removeItem('userType');

                                if (!toast.isActive('session-expired')) {
                                    toast.error("Session expired. Please login again.", {
                                        toastId: 'session-expired',
                                        position: "bottom-right",
                                        autoClose: 3000
                                    });
                                }
                                navigate('/staff-login');
                            }
                        }
                    }
                }

                // Reject the promise so that the calling code can handle it (or fail)
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate, location.pathname]);

    return null;
};

export default AxiosInterceptor;
