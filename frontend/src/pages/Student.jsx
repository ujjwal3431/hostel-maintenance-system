import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Image as ImageIcon, Send, Clock, CheckCircle, Wrench, RefreshCw, Sparkles } from 'lucide-react';

export default function Student() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ category: 'Electrical', roomNumber: '', description: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    
    setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large! Please select a file smaller than 5MB.");
        e.target.value = "";
        setImage(null);
        return;
      }
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('category', formData.category);
    data.append('roomNumber', formData.roomNumber);
    data.append('description', formData.description);
    if (image) data.append('image', image);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tickets`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setTickets([res.data.ticket, ...tickets]);
      setFormData({ category: 'Electrical', roomNumber: '', description: '' });
      setImage(null);
      e.target.reset();
    } catch (error) {
      alert('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative font-sans overflow-x-hidden">
      {/* Blueprint Dot Matrix & Subtle Ambient Lights */}
      <div className="fixed inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Modern Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 border border-indigo-400/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Student Portal</h1>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Campus Hostel Maintenance</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition border border-slate-700/80 hover:border-slate-600 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Issue Submission Box */}
        <section className="lg:col-span-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Lodge a Request</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Service Category</label>
              <select 
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-200 text-sm p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Carpentry</option>
                <option>Cleaning</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Room Identifier</label>
              <input 
                type="number" min="1" required placeholder="e.g. 204"
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-200 text-sm p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-500"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Description of Issue</label>
              <textarea 
                required rows="3" placeholder="Provide specific details of the defect..."
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-200 text-sm p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none placeholder-slate-500"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Visual Proof (Max 5MB)</label>
              <div className="relative border border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group">
                <input 
                  type="file" accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <ImageIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 truncate max-w-[200px]">
                    {image ? image.name : 'Attach photograph'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Register Issue'}
            </button>
          </form>
        </section>

        {/* Tickets History */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Your Lodged Tickets</h2>
            </div>
            <button 
              onClick={fetchTickets}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-xs font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {tickets.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-300 font-medium text-sm">No ongoing requests</p>
                <p className="text-slate-500 text-xs mt-1">Submitted room issues will appear here in real time.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-700 transition">
                  {ticket.imageUrl && (
                    <img src={ticket.imageUrl} alt="Defect" className="w-full sm:w-36 h-28 object-cover rounded-xl border border-slate-800" />
                  )}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2.5 py-0.5 rounded-md">
                          {ticket.category} • Room {ticket.roomNumber}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          ticket.status === 'Pending' ? 'bg-amber-950/50 text-amber-300 border-amber-800/60' :
                          ticket.status === 'Assigned' ? 'bg-blue-950/50 text-blue-300 border-blue-800/60' :
                          'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{ticket.description}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-3">
                      Recorded on {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}