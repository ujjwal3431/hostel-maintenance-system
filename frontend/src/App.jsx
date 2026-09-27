import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

// Page Components
import Login from './pages/Login';
import Student from './pages/Student';
import Admin from './pages/Admin';

/**
 * Global Axios response interceptor that listens for 401 Unauthorized errors
 * (e.g., when a JWT expires) and cleanly routes the user back to the login page.
 */
function AxiosInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Let successful responses pass straight through
      (error) => {
        // Intercept 401 Unauthorized responses
        if (error.response && error.response.status === 401) {
          // Exclude initial login requests so custom error alerts can display
          const isLoginRequest = error.config?.url?.includes('/auth/google');
          
          if (!isLoginRequest) {
            localStorage.clear();
            alert('Your session has expired. Please sign in again.');
            navigate('/');
          }
        }
        return Promise.reject(error);
      }
    );

    // Eject interceptor on unmount to prevent duplicate event listeners
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return null;
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        {/* Interceptor must reside inside BrowserRouter to access useNavigate */}
        <AxiosInterceptor />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<Student />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Fallback wildcard to redirect undefined routes back to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}