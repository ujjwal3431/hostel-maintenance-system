import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, 
  Inbox, Settings, PieChart, Activity, Moon, Sun, TrendingUp, AlertTriangle, 
  Building, BarChart3, Sparkles, Wrench, ShieldAlert, Menu, X 
} from 'lucide-react';

// Self-contained session timeout hook
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
  const [activeTab, setActiveTab] = useState('board');
  
  // NEW: Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const analyticsData = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === 'Pending').length;
    const assigned = tickets.filter(t => t.status === 'Assigned').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const categories = ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Other'];
    const categoryStats = categories.map(cat => {
      const count = tickets.filter(t => t.category === cat).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { name: cat, count, percentage };
    }).sort((a, b) => b.count - a.count);

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
        className="flex flex-col h-[400px] md:h-[calc(100vh-230px)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/40 dark:shadow-none"
      >
        <div className="p-4 border-b border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
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
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-500 hover:shadow-lg rounded-2xl p-4 transition-all duration-200 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                  {ticket.category}
                </span>
                <span className="text-[11px] font-extrabold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 shadow-sm px-2 py-0.5 rounded-md">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 dark:text-slate-200 text-sm mb-3 font-medium leading-relaxed line-clamp-3 flex-1">
                {ticket.description}
              </p>

              {ticket.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-white dark:border-slate-700 h-32 relative shadow-sm group/img shrink-0">
                  <img src={ticket.imageUrl} alt="Defect proof" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
                    View Full Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 bg-slate-50/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                <div className="bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-600"><User className="w-3 h-3 text-slate-400 dark:text-slate-500" /></div>
                <span className="truncate">{ticket.studentId?.name || 'Student'}</span>
              </div>

              <div className="flex gap-2 mt-auto shrink-0">
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

      {/* MOBILE DARK OVERLAY: Closes sidebar when tapped outside */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Absolute on Mobile, Relative on Desktop */}
      <motion.aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800/60 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Hostel Care</h1>
                <p className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Admin</p>
              </div>
            </div>
            {/* Mobile Close Button (X) inside sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <button 
              onClick={() => { setActiveTab('board'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'board'
                  ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Board
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'analytics'
                  ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <PieChart className="w-4 h-4" /> Analytics
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/50 dark:border-slate-800/50 space-y-2">
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
        <header className="h-20 px-4 md:px-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">
                {activeTab === 'board' ? 'Operational Kanban' : 'Analytics'}
              </h2>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                {activeTab === 'board' ? 'Real-time issue triage and status workflow' : 'Performance indicators & defect hotspots'}
              </p>
            </div>
          </div>

          <button 
            onClick={fetchAllTickets} disabled={refreshing}
            className="flex items-center gap-2 text-xs md:text-sm font-bold text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md border border-white dark:border-slate-700 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            <span className="hidden md:inline">{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </header>

        {/* Scrolling View Area */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'board' ? (
              <motion.div 
                key="board-view"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Metric Summary Row - Stacks on Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl"><Inbox className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Requires Action</p>
                      <p className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Pending')}</p>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl"><Activity className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
                      <p className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Assigned')}</p>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</p>
                      <p className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Resolved')}</p>
                    </div>
                  </div>
                </div>

                {/* 3-Column Board - Stacks vertically on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start pb-6 md:pb-0">
                  {renderColumn('Pending', 'text-amber-600', 'text-amber-600 border-amber-200', <ChevronRight className="w-5 h-5 text-amber-500" />, 1)}
                  {renderColumn('Assigned', 'text-blue-600', 'text-blue-600 border-blue-200', <LayoutDashboard className="w-5 h-5 text-blue-500" />, 2)}
                  {renderColumn('Resolved', 'text-emerald-600', 'text-emerald-600 border-emerald-200', <CheckCircle2 className="w-5 h-5 text-emerald-500" />, 3)}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="analytics-view"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Mobile Stacking for Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                  {/* Total Reports */}
                  <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Reported</p>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.total}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-violet-100/70 dark:bg-violet-900/40 text-violet-600 flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
                  </div>
                  {/* Resolution Rate */}
                  <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resolution Rate</p>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.resolutionRate}%</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                  </div>
                  {/* Active Backlog */}
                  <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Queue</p>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">{analyticsData.pending + analyticsData.assigned}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center"><Wrench className="w-6 h-6" /></div>
                  </div>
                  {/* Top Category */}
                  <div className="bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Top Category</p>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white truncate max-w-[100px]">{analyticsData.mostCommonCategory}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center"><PieChart className="w-6 h-6" /></div>
                  </div>
                </div>
                
                {/* Additional analytics content stays mostly the same but uses grid-cols-1 for mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category bars container */}
                  <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base mb-4">Category Distribution</h4>
                    <div className="space-y-4">
                      {analyticsData.categoryStats.map((item, idx) => {
                        const style = getCategoryColor(item.name);
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${style.bar}`} />{item.name}</span>
                              <span>{item.percentage}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-white dark:border-slate-700/50">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className={`h-full rounded-full ${style.bar}`} />
                            </div>
                          </div>
                        );
                      })}
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