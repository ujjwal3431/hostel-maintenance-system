import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, ChevronRight, CheckCircle2, User, RefreshCw } from 'lucide-react';

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
      <div className={`rounded-xl flex flex-col h-full border border-slate-200 ${bgColor}`}>
        <div className={`p-4 border-b border-slate-200 flex justify-between items-center rounded-t-xl bg-white`}>
          <h2 className={`font-bold flex items-center gap-2 ${headerColor}`}>
            {icon} {statusName}
          </h2>
          <span className="bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full text-sm">
            {columnTickets.length}
          </span>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {columnTickets.map(ticket => (
            <div key={ticket._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                  {ticket.category}
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Room {ticket.roomNumber}
                </span>
              </div>
              
              <p className="text-slate-800 text-sm mb-4 leading-relaxed font-medium">
                {ticket.description}
              </p>
              
              {ticket.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg border border-slate-100 h-32 relative">
                  <img src={ticket.imageUrl} alt="Issue" className="w-full h-full object-cover" />
                  <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" 
                     className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
                    View Full Image
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                <User className="w-3 h-3" />
                <span className="truncate">{ticket.studentId?.name}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors">
                    Reset
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs font-bold py-2 rounded-lg transition-colors">
                    Assign Task
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm text-xs font-bold py-2 rounded-lg transition-colors">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {columnTickets.length === 0 && (
            <div className="text-center p-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
              No tickets here
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold animate-pulse text-xl">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAllTickets}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {renderColumn('Pending', 'text-amber-600', 'bg-slate-50/50', <ChevronRight className="w-5 h-5" />)}
          {renderColumn('Assigned', 'text-blue-600', 'bg-blue-50/30', <LayoutDashboard className="w-5 h-5" />)}
          {renderColumn('Resolved', 'text-green-600', 'bg-green-50/30', <CheckCircle2 className="w-5 h-5" />)}
        </div>
      </div>
    </div>
  );
}