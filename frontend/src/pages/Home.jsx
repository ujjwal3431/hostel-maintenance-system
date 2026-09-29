import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, ShieldCheck, Activity, Smartphone, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans overflow-x-hidden selection:bg-violet-200 dark:selection:bg-violet-900 transition-colors duration-500">
      
      {/* Background Aurora */}
      <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-300/40 dark:bg-cyan-900/20 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 md:px-12 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">Hostel Care</h1>
        </div>
        <Link 
          to="/login"
          className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-violet-700 dark:text-violet-300 px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md border border-white dark:border-slate-700 transition shadow-sm"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">System Online</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-tight max-w-4xl mb-6"
        >
          Campus Maintenance, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">Simplified & Streamlined.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-2xl font-medium mb-12"
        >
          A centralized platform for students to report issues and wardens to track, manage, and resolve hostel maintenance requests in real-time.
        </motion.p>

        {/* Entry Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Student Portal Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-violet-200/50 dark:hover:shadow-none transition-all duration-300 text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Student Portal</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mb-8 flex-1">
              Submit maintenance requests, upload photo evidence, and track the real-time resolution status of your room issues.
            </p>
            <Link 
              to="/login"
              className="mt-auto inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 text-slate-800 dark:text-white px-5 py-3 rounded-xl font-bold transition group-hover:bg-violet-50 dark:group-hover:bg-slate-700"
            >
              Enter Portal <ArrowRight className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Admin Portal Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-cyan-200/50 dark:hover:shadow-none transition-all duration-300 text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Admin Console</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mb-8 flex-1">
              Kanban-style triage board, visual analytics, defect hotspot tracking, and SLA management for hostel wardens.
            </p>
            <Link 
              to="/login"
              className="mt-auto inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 text-slate-800 dark:text-white px-5 py-3 rounded-xl font-bold transition group-hover:bg-cyan-50 dark:group-hover:bg-slate-700"
            >
              Enter Console <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}