import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, Inbox } from 'lucide-react';

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
      alert('Unauthorized or server error');
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

  const renderColumn = (statusName, headerAccent, badgeColor, icon) => {
    const columnTickets = tickets.filter(t => t.status === statusName);
    
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/30">
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`font-bold text-sm tracking-wide ${headerAccent}`}>{statusName}</h2>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {columnTickets.map(ticket => (
            <div key={ticket._id} className="bg-slate-800/70 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-150">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/70 px-2 py-0.5 rounded border border-slate-700/50">
                  {ticket.category}
                </span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/50 px-2 py-0.5 rounded">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-200 text-sm mb-3 font-medium leading-snug">
                {ticket.description}
              </p>
              
              {ticket.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-700/80 h-28 relative group">
                  <img src={ticket.imageUrl} alt="Defect proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-xs">
                    Inspect Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{ticket.studentId?.name || 'Student'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-2 rounded-lg transition">
                    Set Pending
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition">
                    Assign
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg transition col-span-2">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {columnTickets.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs gap-2">
              <Inbox className="w-5 h-5 opacity-40" />
              <span>Queue Empty</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-semibold text-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans overflow-x-hidden">
      {/* Background Matrix */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1500px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 border border-indigo-400/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Operations Console</h1>
              <p className="text-xs text-slate-400">Hostel Maintenance System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllTickets}
              disabled={refreshing}
              className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 px-3.5 py-2 rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} /> 
              <span>{refreshing ? 'Syncing...' : 'Sync Board'}</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Column View */}
      <main className="relative z-10 max-w-[1500px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {renderColumn('Pending', 'text-amber-400', 'bg-amber-950/60 text-amber-300 border-amber-800/50', <ChevronRight className="w-4 h-4 text-amber-400" />)}
          {renderColumn('Assigned', 'text-blue-400', 'bg-blue-950/60 text-blue-300 border-blue-800/50', <LayoutDashboard className="w-4 h-4 text-blue-400" />)}
          {renderColumn('Resolved', 'text-emerald-400', 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50', <CheckCircle2 className="w-4 h-4 text-emerald-400" />)}
        </div>
      </main>
    </div>
  );
}