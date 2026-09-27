import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, 
  Inbox, Settings, PieChart, Activity, Moon, Sun, TrendingUp, AlertTriangle, 
  Building, BarChart3, Sparkles, Wrench, ShieldAlert 
} from 'lucide-react';

// Self-contained session timeout hook (no external file needed)
function useLocalSessionTimeout() {
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
export default function Admin() {
  const navigate = useNavigate();
  useLocalSessionTimeout();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'analytics'

  const fetchAllTickets = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || user?.role !== 'admin') return navigate('/'); 

    setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

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

  const updateStatus = async (ticketId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getCount = (status) => tickets.filter(t => t.status === status).length;

  // --- ANALYTICS COMPUTATIONS ---
  const analyticsData = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === 'Pending').length;
    const assigned = tickets.filter(t => t.status === 'Assigned').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Category Distribution
    const categories = ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Other'];
    const categoryStats = categories.map(cat => {
      const count = tickets.filter(t => t.category === cat).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { name: cat, count, percentage };
    }).sort((a, b) => b.count - a.count);

    // Top Reported Rooms
    const roomMap = {};
    tickets.forEach(t => {
      if (t.roomNumber) {
        roomMap[t.roomNumber] = (roomMap[t.roomNumber] || 0) + 1;
      }
    });
    const topRooms = Object.entries(roomMap)
      .map(([room, count]) => ({ room, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const mostCommonCategory = categoryStats[0]?.count > 0 ? categoryStats[0].name : 'None';

    return { total, pending, assigned, resolved, resolutionRate, categoryStats, topRooms, mostCommonCategory };
  }, [tickets]);

  // Color mapping for categories
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Electrical': return { bar: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900/50' };
      case 'Plumbing': return { bar: 'bg-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-900/50' };
      case 'Carpentry': return { bar: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-900/50' };
      case 'Cleaning': return { bar: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900/50' };
      default: return { bar: 'bg-violet-500', text: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-200 dark:border-violet-900/50' };
    }
  };

  const renderColumn = (statusName, headerAccent, badgeColor, icon, delayIndex) => {
    const columnTickets = tickets.filter(t => t.status === statusName);
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delayIndex * 0.1 }}
        className="flex flex-col h-[calc(100vh-230px)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/40 dark:shadow-none"
      >
        <div className="p-4 border-b border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`font-bold text-sm ${headerAccent}`}>{statusName}</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-sm ${badgeColor}`}>
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {columnTickets.map((ticket, index) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
              key={ticket._id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-500 hover:shadow-lg rounded-2xl p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                  {ticket.category}
                </span>
                <span className="text-[11px] font-extrabold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 shadow-sm px-2 py-0.5 rounded-md">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 dark:text-slate-200 text-sm mb-3 font-medium leading-relaxed line-clamp-3">
                {ticket.description}
              </p>

              {ticket.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-white dark:border-slate-700 h-32 relative shadow-sm group/img">
                  <img src={ticket.imageUrl} alt="Defect proof" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
                    View Full Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 bg-slate-50/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-600"><User className="w-3 h-3 text-slate-400 dark:text-slate-500" /></div>
                <span className="truncate">{ticket.studentId?.name || 'Student'}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs font-bold py-2 rounded-xl transition shadow-sm">
                    Reset
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold py-2 rounded-xl transition shadow-md shadow-blue-200 dark:shadow-none">
                    Assign
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold py-2 rounded-xl transition shadow-md shadow-emerald-200 dark:shadow-none">
                    Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {columnTickets.length === 0 && (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/60 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 rounded-2xl text-slate-500 dark:text-slate-400 text-xs font-semibold gap-2">
              <Inbox className="w-5 h-5 opacity-50 text-violet-400" />
              <span>Queue Empty</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-200 dark:border-slate-800 border-t-violet-600 dark:border-t-violet-500"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-indigo-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-500">
      {/* Background Aurora */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-700" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 dark:bg-cyan-900/20 rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-700" />

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800/60 z-10 flex flex-col justify-between shadow-2xl shadow-indigo-200/30 dark:shadow-none"
      >
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-white/50 dark:border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-white tracking-tight">Hostel Care</h1>
              <p className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Admin Console</p>
            </div>
          </div>

          {/* Navigation with Live Board & Analytics Switches */}
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'board'
                  ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Board
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'analytics'
                  ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <PieChart className="w-4 h-4" /> Analytics
              <span className="ml-auto text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">Live</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/50 dark:border-slate-800/50 space-y-2">
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 px-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {activeTab === 'board' ? 'Operational Kanban' : 'Hostel Maintenance Analytics'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === 'board' ? 'Real-time issue triage and status workflow' : 'Performance indicators, resolution metrics & defect hotspots'}
            </p>
          </div>
          <button 
            onClick={fetchAllTickets} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md border border-white dark:border-slate-700 px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing DB...' : 'Sync Database'}
          </button>
        </header>

        {/* Tab View Switcher */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'board' ? (
              // TAB 1: KANBAN BOARD
              <motion.div 
                key="board-view"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Metric Summary Row */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl"><Inbox className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requires Action</p>
                      <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Pending')}</p>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl"><Activity className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</p>
                      <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Assigned')}</p>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Successfully Resolved</p>
                      <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Resolved')}</p>
                    </div>
                  </div>
                </div>

                {/* 3-Column Board */}
                <div className="grid grid-cols-3 gap-6 flex-1 items-start">
                  {renderColumn('Pending', 'text-amber-600 dark:text-amber-400', 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', <ChevronRight className="w-5 h-5 text-amber-500" />, 1)}
                  {renderColumn('Assigned', 'text-blue-600 dark:text-blue-400', 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', <LayoutDashboard className="w-5 h-5 text-blue-500" />, 2)}
                  {renderColumn('Resolved', 'text-emerald-600 dark:text-emerald-400', 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', <CheckCircle2 className="w-5 h-5 text-emerald-500" />, 3)}
                </div>
              </motion.div>
            ) : (
              // TAB 2: ANALYTICS VIEW
              <motion.div 
                key="analytics-view"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Row 1: KPI Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* Total Reports */}
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Reported</p>
                      <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.total}</h3>
                      <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> All-time submissions
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-violet-100/70 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Resolution Rate */}
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Resolution Rate</p>
                      <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.resolutionRate}%</h3>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Efficiency index
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Active Backlog */}
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Queue</p>
                      <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.pending + analyticsData.assigned}</h3>
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending or assigned
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Wrench className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Primary Issue Domain */}
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Top Category</p>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white truncate max-w-[130px]">{analyticsData.mostCommonCategory}</h3>
                      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Highest frequency
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <PieChart className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Visual Distribution Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Breakdown by Category */}
                  <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Issue Category Distribution</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Complaints categorized by maintenance domain</p>
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-900/50">
                        {analyticsData.categoryStats.length} Domains
                      </span>
                    </div>

                    <div className="space-y-4">
                      {analyticsData.categoryStats.map((item, idx) => {
                        const style = getCategoryColor(item.name);
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${style.bar}`} />
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 dark:text-slate-500 font-medium">{item.count} tickets</span>
                                <span className="text-slate-800 dark:text-white font-extrabold">{item.percentage}%</span>
                              </div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white dark:border-slate-700/50">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${item.percentage}%` }} 
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                                className={`h-full rounded-full ${style.bar}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resolution Pipeline Meter */}
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Resolution Pipeline</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Status conversion efficiency</p>

                      <div className="my-6 flex flex-col items-center justify-center">
                        {/* Circular Progress Ring */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                            <motion.circle 
                              cx="50" cy="50" r="40" 
                              stroke="currentColor" 
                              strokeWidth="8" 
                              strokeDasharray="251.2"
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{ strokeDashoffset: 251.2 - (251.2 * analyticsData.resolutionRate) / 100 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              strokeLinecap="round" 
                              className="text-emerald-500" 
                              fill="transparent" 
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-800 dark:text-white">{analyticsData.resolutionRate}%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleared</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pending Action
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{analyticsData.pending}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Currently In Progress
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{analyticsData.assigned}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Fully Resolved
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{analyticsData.resolved}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Hotspot Rooms and AI Insight Notice */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Hotspot Rooms */}
                  <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Defect Frequency Hotspots</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Rooms with recurring maintenance tickets</p>
                      </div>
                      <div className="p-2 rounded-xl bg-violet-100/60 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <Building className="w-4 h-4" />
                      </div>
                    </div>

                    {analyticsData.topRooms.length === 0 ? (
                      <div className="py-8 text-center text-xs font-semibold text-slate-400">
                        No room hotspot data recorded yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {analyticsData.topRooms.map((item, index) => (
                          <div 
                            key={item.room}
                            className="bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm"
                          >
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                              Rank #{index + 1}
                            </span>
                            <span className="text-lg font-black text-violet-700 dark:text-violet-400">
                              Room {item.room}
                            </span>
                            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mt-1 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/50">
                              {item.count} {item.count === 1 ? 'ticket' : 'tickets'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary / Advisory Banner */}
                  <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-7 text-white shadow-xl shadow-indigo-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold mb-4 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Executive Summary</span>
                      </div>
                      <h4 className="text-lg font-extrabold tracking-tight">System Operational Health</h4>
                      <p className="text-xs text-indigo-100/90 leading-relaxed mt-2 font-medium">
                        {analyticsData.resolutionRate >= 70 
                          ? `Hostel resolution efficiency is in healthy standing at ${analyticsData.resolutionRate}%. The team is keeping up with student requests.`
                          : `Backlog resolution is currently at ${analyticsData.resolutionRate}%. Focus resources on clearing the ${analyticsData.pending} pending items in queue.`
                        }
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-200">Primary Focus</span>
                      <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md">{analyticsData.mostCommonCategory} Maintenance</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}