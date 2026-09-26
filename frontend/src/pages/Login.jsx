import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wrench } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/student');
    }
  }, [navigate]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') navigate('/admin');
      else navigate('/student');
    } catch (error) {
      alert('Login failed. Please use a valid university email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 text-center transform transition-all">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Wrench className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Hostel Maintenance System</h1>
        <p className="text-gray-500 mb-8 font-medium">Faculty of Engineering & Technology</p>
        
        <div className="flex justify-center border-t border-gray-100 pt-8">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap
            shape="pill"
            prompt="select_account"
          />
        </div>
        
        <p className="mt-8 text-xs text-gray-400 font-medium tracking-wide uppercase">
          Secure Student Portal
        </p>
      </div>
    </div>
  );
}