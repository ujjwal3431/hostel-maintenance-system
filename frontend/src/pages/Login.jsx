import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  // Check if user is already logged in when the page loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }
  }, [navigate]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // 1. Send the Google token to our Node.js backend
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });

      // 2. Save the session token to local storage
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 3. Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please ensure you are using a university email address.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hostel Maintenance</h1>
        <p className="text-gray-500 mb-8">Sign in with your university email to continue</p>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            useOneTap
          />
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
          Faculty of Engineering and Technology, GKV
        </p>
      </div>
    </div>
  );
}