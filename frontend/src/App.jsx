import { useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const isLoginRequest = error.config?.url?.includes('/auth/google');
          
          if (!isLoginRequest) {
            localStorage.clear();
            alert('Your session has ended. Please sign in again.');
            navigate('/');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return null;
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Interceptor runs globally because main.jsx wraps <App /> in a Router */}
      <AxiosInterceptor />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<Student />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Fallback to redirect unknown routes to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}