import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Enforces an absolute session lifespan based on the sessionExpiresAt timestamp.
 */
export default function useSessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('sessionExpiresAt');

    if (!token || !expiresAt) return;

    const remainingTime = parseInt(expiresAt, 10) - Date.now();

    const logout = () => {
      localStorage.clear();
      alert('Your session has ended. Please log in again.');
      navigate('/');
    };

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(logout, remainingTime);

    return () => clearTimeout(timer);
  }, [navigate]);
}