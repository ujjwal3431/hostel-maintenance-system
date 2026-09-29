import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { LayoutDashboard, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // SMART REDIRECT: If already logged in, skip the login screen!
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } catch (e) {
        console.error("Error parsing user data");
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      setError(''); // Clear previous errors
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      // Initialize the Fixed Session Timeout (1 Hour)
      const SESSION_DURATION = 60 * 60 * 1000; 
      const expiresAt = Date.now() + SESSION_DURATION;

      // Save Auth Data to Local Storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('sessionExpiresAt', expiresAt.toString());

      // Route based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error("FULL LOGIN ERROR:", error);
      const errorMsg = error.response?.data?.message || "An error occurred during sign in.";
      setError(errorMsg);
    }
  };

  const handleLoginFailure = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Aurora */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-300/40 dark:bg-cyan-900/20 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 dark:shadow-none relative z-10 flex flex-col items-center text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none mb-6">
          <LayoutDashboard className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Welcome Back</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8">
          Sign in with your authorized Google account to access the Hostel Care portal.
        </p>

        {/* Error Message UI */}
        {error && (
          <div className="w-full mb-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold text-left animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Google OAuth Button Container */}
        <div className="w-full flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="rectangular"
          />
        </div>

        {/* Security Badge */}
        <div className="w-full pt-6 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure OAuth 2.0 Authentication
        </div>

      </div>
    </div>
  );
}