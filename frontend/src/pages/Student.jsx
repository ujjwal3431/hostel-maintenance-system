import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Image as ImageIcon, Send, Clock, CheckCircle, Wrench, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen bg-indigo-50 text-slate-800 relative font-sans pb-12 overflow-x-hidden">
      {/* Colorful Aurora Mesh Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[20%] left-[20%] w-[50%] h-[50%] bg-pink-300/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Glass Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight">Student Portal</h1>
              <p className="text-xs text-slate-600 font-medium hidden sm:block">GKV Hostel Maintenance</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 bg-white/80 backdrop-blur-sm hover:bg-red-50 px-4 py-2 rounded-xl transition border border-white/80 hover:border-red-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Issue Submission Box */}
        <section className="lg:col-span-1 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-7 shadow-xl shadow-indigo-100/50 sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-violet-100/80 text-violet-600">
              <Send className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">New Request</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Category</label>
              <select 
                className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition font-medium shadow-sm"
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
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Room Number</label>
              <input 
                type="number" min="1" required placeholder="e.g. 204"
                className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition font-medium placeholder-slate-400 shadow-sm"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea 
                required rows="3" placeholder="Describe the problem in detail..."
                className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition font-medium resize-none placeholder-slate-400 shadow-sm"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Photo (Max 5MB)</label>
              <div className="relative border-2 border-dashed border-violet-200/60 rounded-xl p-5 text-center bg-white/50 hover:bg-violet-50/50 hover:border-violet-300 transition-all cursor-pointer group">
                <input 
                  type="file" accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="bg-white/80 p-2 rounded-full shadow-sm border border-white group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5 text-violet-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                    {image ? image.name : 'Click to attach photo'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-200 hover:shadow-xl disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </section>

        {/* Tickets History */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-violet-500" /> Your History
            </h2>
            <button 
              onClick={fetchTickets}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md text-slate-700 hover:text-violet-600 hover:bg-white rounded-full border border-white text-sm font-bold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4 border border-white">
                  <CheckCircle className="w-8 h-8 text-violet-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
                <p className="text-slate-600 font-medium text-sm mt-1">You have no active maintenance requests.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg hover:border-violet-100 transition-all">
                  {ticket.imageUrl && (
                    <img src={ticket.imageUrl} alt="Defect" className="w-full sm:w-40 h-32 object-cover rounded-xl border border-slate-100 shadow-sm" />
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-extrabold text-slate-600 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-md uppercase tracking-wider">
                        {ticket.category} • Room {ticket.roomNumber}
                      </span>
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                        ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        ticket.status === 'Assigned' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[15px] font-medium leading-relaxed">{ticket.description}</p>
                    <span className="text-xs text-slate-500 font-semibold mt-4 block">
                      Reported on {new Date(ticket.createdAt).toLocaleDateString()}
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