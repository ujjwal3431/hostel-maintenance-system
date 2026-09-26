import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'admin' ? '/admin' : '/student');
    } catch (error) {
      alert('Login failed. Please use your @gkv.ac.in email.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-indigo-50 overflow-hidden font-sans">
      {/* Colorful Aurora Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-pink-300/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card - Glass effect over the colors */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-200/50">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-violet-100 text-violet-600 text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Campus Maintenance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hostel Care</h1>
          <p className="text-slate-600 text-sm mt-2 font-medium">Sign in with your university credentials</p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-inner">
          <div className="transform hover:-translate-y-0.5 transition-transform">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              shape="pill"
              prompt="select_account"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium text-center mt-2">
            Restricted to <span className="text-violet-600 font-bold">@gkv.ac.in</span> accounts
          </p>
        </div>
      </div>
    </div>
  );
}