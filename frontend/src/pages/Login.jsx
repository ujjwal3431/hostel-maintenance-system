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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-50 overflow-hidden font-sans">
      {/* Light Dot Grid & Soft Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Campus Maintenance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hostel Care</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sign in with your university credentials</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
          <div className="transform hover:-translate-y-0.5 transition-transform">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              shape="pill"
              prompt="select_account"
            />
          </div>
          <p className="text-xs text-slate-400 font-medium text-center mt-2">
            Restricted to <span className="text-slate-600 font-bold">@gkv.ac.in</span> accounts
          </p>
        </div>
      </div>
    </div>
  );
}