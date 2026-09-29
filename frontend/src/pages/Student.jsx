import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, PlusCircle, List, Moon, Sun, UploadCloud, 
  CheckCircle2, Clock, Wrench, Menu, X, LayoutDashboard 
} from 'lucide-react';

// Self-contained session timeout hook
function useLocalSessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('sessionExpiresAt');

    if (!token || !expiresAt) return;

    const remainingTime = parseInt(expiresAt, 10) - Date.now();

    const logout = () => {
      localStorage.clear();
      alert('Your session has ended. Please log in again.');
      navigate('/');
    };

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(logout, remainingTime);
    return () => clearTimeout(timer);
  }, [navigate]);
}

export default function Student() {
  const navigate = useNavigate();
  useLocalSessionTimeout();

  const [activeTab, setActiveTab] = useState('submit');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyTickets();
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fetchMyTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber || isNaN(roomNumber)) {
      alert('Please enter a valid numeric room number.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('roomNumber', roomNumber);
    formData.append('category', category);
    formData.append('description', description);
    if (file) formData.append('image', file);

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/tickets`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Ticket submitted successfully!');
      setRoomNumber('');
      setCategory('Electrical');
      setDescription('');
      setFile(null);
      setPreview(null);
      fetchMyTickets();
      setActiveTab('history');
    } catch (error) {
      alert('Error submitting ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Resolved': return <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Resolved</span>;
      case 'Assigned': return <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md border border-blue-200"><Wrench className="w-3 h-3"/> In Progress</span>;
      default: return <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div className="flex h-screen bg-indigo-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-500">
      
      {/* Background Aurora */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/40 dark:bg-cyan-900/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <motion.aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800/60 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Hostel Care</h1>
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Student Portal</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <button 
              onClick={() => { setActiveTab('submit'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'submit' ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> New Request
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); fetchMyTickets(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition ${
                activeTab === 'history' ? 'bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <List className="w-4 h-4" /> My Tickets
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/50 dark:border-slate-800/50 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 px-4 md:px-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">
                {activeTab === 'submit' ? 'Submit Maintenance Request' : 'My Ticket History'}
              </h2>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'submit' ? (
              <motion.div 
                key="submit-form"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Room Number</label>
                      <input 
                        type="text" 
                        value={roomNumber} 
                        onChange={(e) => setRoomNumber(e.target.value.replace(/\D/g, ''))} // Numeric validation
                        required 
                        placeholder="e.g. 101"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                      >
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Issue Description</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      required 
                      rows="4" 
                      placeholder="Please describe the problem in detail..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-violet-500 outline-none transition resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Photo Evidence (Max 5MB)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 text-violet-500 mb-2" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Click to upload image</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    {/* Restored Image Preview Block */}
                    {preview && (
                      <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-40">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setFile(null); setPreview(null); }}
                          className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-600 text-white p-1.5 rounded-lg backdrop-blur-sm transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-200 dark:shadow-none transition-all disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="history-view"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto"
              >
                {tickets.length === 0 ? (
                  <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-white dark:border-slate-800">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Tickets Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You haven't submitted any maintenance requests.</p>
                  </div>
                ) : (
                  // Grid Layout that stacks to 1 column on Mobile, 2 columns on Desktop
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {tickets.map((ticket, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        key={ticket._id} 
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            {ticket.category}
                          </span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">Room {ticket.roomNumber}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-4 line-clamp-3">
                          {ticket.description}
                        </p>
                        {ticket.imageUrl && (
                          <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={ticket.imageUrl} alt="Ticket evidence" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                          Submitted on {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}