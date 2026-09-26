import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, Inbox, Settings, PieChart, Activity } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

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
        className="flex flex-col h-[calc(100vh-220px)] bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/40"
      >
        <div className="p-4 border-b border-white/50 bg-white/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`font-bold text-sm ${headerAccent}`}>{statusName}</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border shadow-sm ${badgeColor}`}>
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {columnTickets.map((ticket, index) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
              key={ticket._id} 
              className="bg-white/90 backdrop-blur-md border border-white hover:border-violet-200 hover:shadow-lg rounded-2xl p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  {ticket.category}
                </span>
                <span className="text-[11px] font-extrabold text-violet-700 bg-violet-50 border border-violet-100 shadow-sm px-2 py-0.5 rounded-md">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 text-sm mb-3 font-medium leading-relaxed line-clamp-3">
                {ticket.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <div className="bg-white p-1 rounded-full border border-slate-200"><User className="w-3 h-3 text-slate-400" /></div>
                <span className="truncate">{ticket.studentId?.name || 'Student'}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded-xl transition shadow-sm">
                    Reset
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold py-2 rounded-xl transition shadow-md shadow-blue-200">
                    Assign
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold py-2 rounded-xl transition shadow-md shadow-emerald-200">
                    Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {columnTickets.length === 0 && (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/60 bg-white/30 rounded-2xl text-slate-500 text-xs font-semibold gap-2">
              <Inbox className="w-5 h-5 opacity-50 text-violet-400" />
              <span>Queue Empty</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-200 border-t-violet-600"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-indigo-50 font-sans overflow-hidden">
      {/* Background Aurora */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar - Makes it look like real software */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/70 backdrop-blur-2xl border-r border-white/60 z-10 flex flex-col justify-between shadow-2xl shadow-indigo-200/30"
      >
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-white/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 tracking-tight">Hostel Care</h1>
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Admin Console</p>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-violet-100/50 text-violet-700 font-bold rounded-xl border border-violet-200/50 transition">
              <Activity className="w-4 h-4" /> Live Board
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-white/50 rounded-xl transition">
              <PieChart className="w-4 h-4" /> Analytics <span className="ml-auto text-[9px] bg-slate-200 px-2 py-0.5 rounded-full">Soon</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-white/50 rounded-xl transition">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-white/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 px-8 flex justify-between items-center bg-white/30 backdrop-blur-md border-b border-white/40">
          <h2 className="text-lg font-bold text-slate-800">Operational Overview</h2>
          <button 
            onClick={fetchAllTickets} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 bg-white/80 hover:bg-white backdrop-blur-md border border-white px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing DB...' : 'Sync Database'}
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-hidden flex flex-col gap-6">
          
          {/* Metrics Widget Row */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-6"
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Inbox className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requires Action</p>
                <p className="text-2xl font-extrabold text-slate-800">{getCount('Pending')}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Activity className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-extrabold text-slate-800">{getCount('Assigned')}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Successfully Resolved</p>
                <p className="text-2xl font-extrabold text-slate-800">{getCount('Resolved')}</p>
              </div>
            </div>
          </motion.div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-3 gap-6 flex-1 items-start">
            {renderColumn('Pending', 'text-amber-600', 'text-amber-600 border-amber-200', <ChevronRight className="w-5 h-5 text-amber-500" />, 1)}
            {renderColumn('Assigned', 'text-blue-600', 'text-blue-600 border-blue-200', <LayoutDashboard className="w-5 h-5 text-blue-500" />, 2)}
            {renderColumn('Resolved', 'text-emerald-600', 'text-emerald-600 border-emerald-200', <CheckCircle2 className="w-5 h-5 text-emerald-500" />, 3)}
          </div>
        </div>
      </main>
    </div>
  );
}