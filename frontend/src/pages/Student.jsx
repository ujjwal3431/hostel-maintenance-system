import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, Image as ImageIcon, Send, Clock, CheckCircle, Wrench, RefreshCw, LayoutDashboard, History, User, Activity, AlertCircle } from 'lucide-react';

export default function Student() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ category: 'Electrical', roomNumber: '', description: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // We parse the user object to display their name in the sidebar!
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };

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
      console.error('Error fetching tickets');
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

  // Helper for the new Metric Cards
  const getCount = (status) => tickets.filter(t => t.status === status).length;

  return (
    <div className="flex h-screen bg-indigo-50 font-sans overflow-hidden">
      {/* Background Aurora */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/70 backdrop-blur-2xl border-r border-white/60 z-10 flex flex-col justify-between shadow-2xl shadow-indigo-200/30"
      >
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-white/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 tracking-tight">Hostel Care</h1>
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Student Portal</p>
            </div>
          </div>
          
          <div className="px-6 py-5 border-b border-white/50">
             <p className="text-xs text-slate-500 font-bold mb-1">Welcome back,</p>
             <p className="text-sm font-extrabold text-slate-800 truncate">{user.name}</p>
          </div>

          <nav className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-violet-100/50 text-violet-700 font-bold rounded-xl border border-violet-200/50 transition">
              <LayoutDashboard className="w-4 h-4" /> My Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-white/50 rounded-xl transition">
              <History className="w-4 h-4" /> Full History
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-white/50 rounded-xl transition">
              <User className="w-4 h-4" /> Profile
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
          <h2 className="text-lg font-bold text-slate-800">My Maintenance Hub</h2>
          <button 
            onClick={fetchTickets} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 bg-white/80 hover:bg-white backdrop-blur-md border border-white px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing...' : 'Sync Records'}
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          {/* Metrics Widget Row */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Activity className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-extrabold text-slate-800">{tickets.length}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Fix</p>
                <p className="text-2xl font-extrabold text-slate-800">{getCount('Pending')}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-extrabold text-slate-800">{getCount('Resolved')}</p>
              </div>
            </div>
          </motion.div>

          {/* Form and List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Box */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-1 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-7 shadow-lg shadow-indigo-100/50 sticky top-4 h-fit"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-violet-100/80 text-violet-600"><Send className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-slate-800">New Request</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Category</label>
                  <select 
                    className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 outline-none transition font-medium shadow-sm"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Electrical</option><option>Plumbing</option><option>Carpentry</option><option>Cleaning</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Room Number</label>
                  <input 
                    type="number" min="1" required placeholder="e.g. 204"
                    className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 outline-none transition font-medium placeholder-slate-400 shadow-sm"
                    value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea 
                    required rows="3" placeholder="Describe the problem..."
                    className="w-full bg-white/80 border border-white text-slate-800 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 outline-none transition font-medium resize-none placeholder-slate-400 shadow-sm"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Photo (Max 5MB)</label>
                  <div className="relative border-2 border-dashed border-violet-200/60 rounded-xl p-5 text-center bg-white/50 hover:bg-violet-50/50 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white/80 p-2 rounded-full shadow-sm border border-white group-hover:scale-110 transition-transform"><ImageIcon className="w-5 h-5 text-violet-500" /></div>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">{image ? image.name : 'Click to attach photo'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-200 hover:shadow-xl disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.section>

            {/* History List */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4 border border-white">
                      <CheckCircle className="w-8 h-8 text-violet-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No issues reported!</h3>
                    <p className="text-slate-600 font-medium text-sm mt-1">Your room maintenance requests will appear here.</p>
                  </div>
                ) : (
                  tickets.map((ticket, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (index * 0.05) }}
                      key={ticket._id} 
                      className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg hover:border-violet-100 transition-all"
                    >
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
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  );
}