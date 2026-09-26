import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Moon, Sun, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-indigo-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-500">
      
      {/* Theme Toggle Button (Top Right) */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Colorful Aurora Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/50 dark:bg-purple-900/30 rounded-full blur-[140px] pointer-events-none transition-colors duration-700" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/50 dark:bg-cyan-900/20 rounded-full blur-[140px] pointer-events-none transition-colors duration-700" />
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-pink-300/40 dark:bg-pink-900/20 rounded-full blur-[140px] pointer-events-none transition-colors duration-700" />

      {/* Main Wide Split Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none overflow-hidden"
      >
        
        {/* Left Side: Branding & Features (Always Dark/Vibrant Gradient) */}
        <div className="lg:w-5/12 bg-gradient-to-br from-violet-600 to-indigo-800 p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Glass Orbs inside left panel */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>GKV University Portal</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Hostel Care</h1>
            </div>
            <p className="text-indigo-200 font-medium text-sm lg:text-base leading-relaxed max-w-sm">
              The smart, unified platform to report, track, and resolve campus maintenance issues in real-time.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 border border-white/10"><Zap className="w-4 h-4 text-amber-300" /></div>
              <span className="font-semibold text-sm">Lightning fast reporting</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 border border-white/10"><CheckCircle2 className="w-4 h-4 text-emerald-300" /></div>
              <span className="font-semibold text-sm">Real-time status tracking</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 border border-white/10"><ShieldCheck className="w-4 h-4 text-blue-300" /></div>
              <span className="font-semibold text-sm">Verified institutional access</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Login Action */}
        <div className="lg:w-7/12 p-10 lg:p-16 flex flex-col justify-center items-center relative bg-white/40 dark:bg-slate-900/40">
          <div className="w-full max-w-sm">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Sign in to your account to continue
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/80 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              
              <div className="w-full flex justify-center transform hover:-translate-y-1 transition-transform duration-300">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => console.log('Login Failed')}
                  useOneTap
                  shape="rectangular"
                  size="large"
                  theme={isDarkMode ? "filled_black" : "outline"}
                  prompt="select_account"
                />
              </div>

              <div className="w-full flex items-center justify-between gap-3 mt-4 mb-2">
                <hr className="w-full border-slate-200 dark:border-slate-700" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Secure</span>
                <hr className="w-full border-slate-200 dark:border-slate-700" />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                Access is strictly limited to users with a valid <span className="text-violet-600 dark:text-violet-400 font-bold">@gkv.ac.in</span> email address.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}