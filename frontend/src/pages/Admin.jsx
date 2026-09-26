import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw, ShieldAlert } from 'lucide-react';

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

  const renderColumn = (statusName, headerColor, bgColor, icon) => {
    const columnTickets = tickets.filter(t => t.status === statusName);
    
    return (
      <div className={`rounded-3xl flex flex-col h-[calc(100vh-140px)] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl ${bgColor}`}>
        <div className="p-5 border-b border-white/50 flex justify-between items-center rounded-t-3xl bg-white/40">
          <h2 className={`font-extrabold flex items-center gap-2 text-lg ${headerColor}`}>
            {icon} {statusName}
          </h2>
          <span className={`font-bold px-3 py-1 rounded-full text-sm shadow-sm bg-white ${headerColor}`}>
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {columnTickets.map(ticket => (
            <div key={ticket._id} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white hover:border-indigo-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-widest px-2.5 py-1 rounded-md">
                  {ticket.category}
                </span>
                <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full shadow-sm">
                  RM {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 text-[15px] mb-5 leading-relaxed font-semibold">
                {ticket.description}
              </p>
              
              {ticket.imageUrl && (
                <div className="mb-5 overflow-hidden rounded-xl border border-slate-100 h-36 relative shadow-sm">
                  <img src={ticket.imageUrl} alt="Issue" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold backdrop-blur-sm">
                    View Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-5 bg-white/50 p-2.5 rounded-xl border border-slate-100">
                <div className="bg-slate-200 p-1 rounded-full"><User className="w-3 h-3 text-slate-600" /></div>
                <span className="truncate">{ticket.studentId?.name}</span>
              </div>

              <div className="flex gap-3 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="flex-1 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm">
                    Reset
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 text-xs font-extrabold py-2.5 rounded-xl transition-all">
                    Assign Task
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 text-xs font-extrabold py-2.5 rounded-xl transition-all">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {columnTickets.length === 0 && (
            <div className="text-center p-10 flex flex-col items-center justify-center h-40 text-slate-400 bg-white/30 border-2 border-dashed border-white rounded-2xl">
              <ShieldAlert className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm font-bold">Queue is empty</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-100 to-white">
      <nav className="bg-white/60 backdrop-blur-lg shadow-sm border-b border-white/80 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md shadow-purple-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900">
              Admin Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAllTickets}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-full transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Syncing...' : 'Sync Data'}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 bg-white/50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-full transition-all shadow-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {renderColumn('Pending', 'text-amber-700', 'bg-gradient-to-b from-amber-50/50 to-transparent', <ChevronRight className="w-5 h-5 text-amber-500" />)}
          {renderColumn('Assigned', 'text-blue-700', 'bg-gradient-to-b from-blue-50/50 to-transparent', <LayoutDashboard className="w-5 h-5 text-blue-500" />)}
          {renderColumn('Resolved', 'text-emerald-700', 'bg-gradient-to-b from-emerald-50/50 to-transparent', <CheckCircle2 className="w-5 h-5 text-emerald-500" />)}
        </div>
      </div>
    </div>
  );
}