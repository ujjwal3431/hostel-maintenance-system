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
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/40">
        <div className="p-5 border-b border-white/50 bg-white/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`font-bold text-base ${headerAccent}`}>{statusName}</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border shadow-sm ${badgeColor}`}>
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {columnTickets.map(ticket => (
            <div key={ticket._id} className="bg-white/80 backdrop-blur-md border border-white hover:border-violet-200 hover:shadow-lg rounded-2xl p-5 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  {ticket.category}
                </span>
                <span className="text-xs font-extrabold text-violet-700 bg-violet-50 border border-violet-100 shadow-sm px-2.5 py-1 rounded-md">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 text-[15px] mb-4 font-medium leading-relaxed">
                {ticket.description}
              </p>
              
              {ticket.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 h-32 relative shadow-sm">
                  <img src={ticket.imageUrl} alt="Defect proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
                    View Full Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-4 bg-white/80 p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="bg-slate-100 p-1 rounded-full border border-slate-200"><User className="w-3.5 h-3.5 text-slate-500" /></div>
                <span className="truncate">{ticket.studentId?.name || 'Student'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition shadow-sm">
                    Set Pending
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md shadow-blue-200">
                    Assign Task
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md shadow-emerald-200 col-span-2">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {columnTickets.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/60 bg-white/30 rounded-2xl text-slate-500 text-sm font-semibold gap-2">
              <Inbox className="w-6 h-6 opacity-50 text-violet-400" />
              <span>No tickets in queue</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-200 border-t-violet-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900 relative font-sans overflow-x-hidden">
      {/* Colorful Aurora Mesh Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[20%] left-[20%] w-[50%] h-[50%] bg-pink-300/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-md shadow-fuchsia-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-slate-600 font-medium">Hostel Maintenance System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllTickets}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-bold text-violet-700 bg-white/80 hover:bg-white backdrop-blur-md border border-white px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              <span>{refreshing ? 'Syncing...' : 'Sync Board'}</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 bg-white/80 hover:bg-red-50 backdrop-blur-md border border-white hover:border-red-200 px-4 py-2 rounded-xl transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Column View */}
      <main className="relative z-10 max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {renderColumn('Pending', 'text-amber-600', 'text-amber-600 border-amber-200', <ChevronRight className="w-5 h-5 text-amber-500" />)}
          {renderColumn('Assigned', 'text-blue-600', 'text-blue-600 border-blue-200', <LayoutDashboard className="w-5 h-5 text-blue-500" />)}
          {renderColumn('Resolved', 'text-emerald-600', 'text-emerald-600 border-emerald-200', <CheckCircle2 className="w-5 h-5 text-emerald-500" />)}
        </div>
      </main>
    </div>
  );
}