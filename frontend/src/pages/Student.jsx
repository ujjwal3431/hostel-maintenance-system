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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-12">
      {/* Glass Navbar */}
      <nav className="bg-white/60 backdrop-blur-lg shadow-sm border-b border-white/80 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900">
              Student Portal
            </h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 bg-white/50 hover:bg-red-50 px-4 py-2 rounded-full transition-all border border-slate-200 hover:border-red-200">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-1">
          {/* Glassmorphism Form Card */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/80 sticky top-28">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-500" /> New Request
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Category</label>
                <select 
                  className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
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
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Room Number</label>
                <input 
                  type="number" min="1" required placeholder="e.g., 204"
                  className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-400"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Describe the problem..."
                  className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 resize-none placeholder-slate-400"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Evidence (Max 5MB)</label>
                <div className="relative border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center bg-white/40 hover:bg-indigo-50/50 transition-colors group cursor-pointer">
                  <input 
                    type="file" accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 transform group-hover:scale-105 transition-transform">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <ImageIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-indigo-900/70 px-2 line-clamp-1">
                      {image ? image.name : 'Tap to upload photo'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-2"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-500" /> My History
            </h2>
            <button 
              onClick={fetchTickets}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="space-y-5">
            {tickets.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl p-12 rounded-3xl text-center border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col items-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                <p className="text-slate-500 font-medium mt-1">You have no active maintenance requests.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/80 flex flex-col sm:flex-row gap-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {ticket.imageUrl && (
                    <img src={ticket.imageUrl} alt="Issue" className="w-full sm:w-48 h-36 object-cover rounded-2xl shadow-sm" />
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-indigo-50 text-indigo-700 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                        {ticket.category} • RM {ticket.roomNumber}
                      </span>
                      <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-sm ${
                        ticket.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        ticket.status === 'Assigned' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[15px] mt-1 font-medium leading-relaxed">{ticket.description}</p>
                    <p className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}