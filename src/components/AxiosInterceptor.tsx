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

                // Check for Unauthorized (401) or Forbidden (403)
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Determine login path based on userType
                    let loginPath = '/login'; // Default (Student)
                    if (userType === 'staff') loginPath = '/staff-login';
                    else if (userType === 'year_incharge') loginPath = '/year-incharge-login';
                    else if (userType === 'warden') loginPath = '/warden-login'; // Assuming warden uses default login or specific if exists
                    else if (userType === 'watchman') loginPath = '/watchmanlogin';

                    // Avoid redirection loop if already on the correct login page
                    if (location.pathname !== loginPath) {
                        // Clear authentication data
                        localStorage.removeItem('token');
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userType');

                        // Show session expired message
                        if (!toast.isActive('session-expired')) {
                            toast.error("Session expired. Please login again.", {
                                toastId: 'session-expired',
                                position: "bottom-right",
                                autoClose: 3000
                            });
                        }

                        // Redirect to the appropriate login page
                        navigate(loginPath);
                    }
                }
                // Handle specific error messages if status code isn't 401/403 but implies auth failure
                else if (error.response && error.response.data && error.response.data.message) {
                    const message = error.response.data.message.toLowerCase();
                    if (message.includes('invalid token') ||
                        message.includes('token expired') ||
                        message.includes('unauthorized access')) {

                        let loginPath = '/login';
                        if (userType === 'staff') loginPath = '/staff-login';
                        else if (userType === 'year_incharge') loginPath = '/year-incharge-login';
                        else if (userType === 'warden') loginPath = '/warden-login';
                        else if (userType === 'watchman') loginPath = '/watchmanlogin';

                        if (location.pathname !== loginPath) {
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
                            navigate(loginPath);
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
