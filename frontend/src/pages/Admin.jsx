import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, Inbox, Settings, PieChart, Activity, Moon, Sun } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    // Check saved theme
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

  const renderColumn = (statusName, headerAccent, badgeColor, icon, delayIndex) => {
    const columnTickets = tickets.filter(t => t.status === statusName);
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delayIndex * 0.1 }}
        className="flex flex-col h-[calc(100vh-220px)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/40 dark:shadow-none"
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
          <nav className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-violet-100/50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold rounded-xl border border-violet-200/50 dark:border-violet-800/50 transition">
              <Activity className="w-4 h-4" /> Live Board
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
              <PieChart className="w-4 h-4" /> Analytics <span className="ml-auto text-[9px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">Soon</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-white/50 dark:border-slate-800/50 space-y-2">
          {/* THEME TOGGLE BUTTON */}
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
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Operational Overview</h2>
          <button 
            onClick={fetchAllTickets} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md border border-white dark:border-slate-700 px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing DB...' : 'Sync Database'}
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-hidden flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-6"
          >
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
          </motion.div>

          <div className="grid grid-cols-3 gap-6 flex-1 items-start">
            {renderColumn('Pending', 'text-amber-600 dark:text-amber-400', 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', <ChevronRight className="w-5 h-5 text-amber-500" />, 1)}
            {renderColumn('Assigned', 'text-blue-600 dark:text-blue-400', 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', <LayoutDashboard className="w-5 h-5 text-blue-500" />, 2)}
            {renderColumn('Resolved', 'text-emerald-600 dark:text-emerald-400', 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', <CheckCircle2 className="w-5 h-5 text-emerald-500" />, 3)}
          </div>
        </div>
      </main>
    </div>
  );
}