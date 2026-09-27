import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, Image as ImageIcon, Send, Clock, CheckCircle, Wrench, RefreshCw, LayoutDashboard, History, User, Activity, AlertCircle, Moon, Sun } from 'lucide-react';
import useSessionTimeout from '../hooks/useSessionTimeout';

export default function Student() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ category: 'Electrical', roomNumber: '', description: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const getCount = (status) => tickets.filter(t => t.status === status).length;

  return (
    <div className="flex h-screen bg-indigo-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-500">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-700" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 dark:bg-cyan-900/20 rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-700" />

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800/60 z-10 flex flex-col justify-between shadow-2xl shadow-indigo-200/30 dark:shadow-none"
      >
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-white/50 dark:border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-white tracking-tight">Hostel Care</h1>
              <p className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Student Portal</p>
            </div>
          </div>
          
          <div className="px-6 py-5 border-b border-white/50 dark:border-slate-800/50">
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Welcome back,</p>
             <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate">{user.name}</p>
          </div>

          <nav className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-violet-100/50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold rounded-xl border border-violet-200/50 dark:border-violet-800/50 transition">
              <LayoutDashboard className="w-4 h-4" /> My Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
              <History className="w-4 h-4" /> Full History
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
              <User className="w-4 h-4" /> Profile
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
        <header className="h-20 px-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">My Maintenance Hub</h2>
          <button 
            onClick={fetchTickets} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md border border-white dark:border-slate-700 px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing...' : 'Sync Records'}
          </button>
        </header>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"><Activity className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{tickets.length}</p>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Awaiting Fix</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Pending')}</p>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-colors">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{getCount('Resolved')}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <motion.section 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-7 shadow-lg shadow-indigo-100/50 dark:shadow-none sticky top-4 h-fit transition-colors"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-violet-100/80 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"><Send className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Request</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select 
                    className="w-full bg-white/80 dark:bg-slate-800 border border-white dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition font-medium shadow-sm"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Electrical</option><option>Plumbing</option><option>Carpentry</option><option>Cleaning</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Room Number</label>
                  <input 
                    type="number" min="1" required placeholder="e.g. 204"
                    className="w-full bg-white/80 dark:bg-slate-800 border border-white dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition font-medium placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                    value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea 
                    required rows="3" placeholder="Describe the problem..."
                    className="w-full bg-white/80 dark:bg-slate-800 border border-white dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm p-3 rounded-xl focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition font-medium resize-none placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Photo (Max 5MB)</label>
                  <div className="relative border-2 border-dashed border-violet-200/60 dark:border-violet-500/30 rounded-xl p-5 text-center bg-white/50 dark:bg-slate-800/50 hover:bg-violet-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white/80 dark:bg-slate-700 p-2 rounded-full shadow-sm border border-white dark:border-slate-600 group-hover:scale-110 transition-transform"><ImageIcon className="w-5 h-5 text-violet-500 dark:text-violet-400" /></div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{image ? image.name : 'Click to attach photo'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-200 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-slate-800 flex items-center justify-center mb-4 border border-white dark:border-slate-700">
                      <CheckCircle className="w-8 h-8 text-violet-300 dark:text-violet-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">No issues reported!</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1">Your room maintenance requests will appear here.</p>
                  </div>
                ) : (
                  tickets.map((ticket, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (index * 0.05) }}
                      key={ticket._id} 
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg dark:hover:border-violet-500/50 transition-all"
                    >
                      {ticket.imageUrl && (
                        <div className="w-full sm:w-40 h-32 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative group/img">
                          <img src={ticket.imageUrl} alt="Defect" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                          <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">View Full</a>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-1 rounded-md uppercase tracking-wider">
                            {ticket.category} • Room {ticket.roomNumber}
                          </span>
                          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                            ticket.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                            ticket.status === 'Assigned' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[15px] font-medium leading-relaxed">{ticket.description}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-4 block">
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