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

  useEffect(() => {
    const [refreshing, setRefreshing] = useState(false); // Add this state

  // Extracted fetch function so the button can call it
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
      // Check if file is larger than 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large! Please select a file smaller than 5MB.");
        e.target.value = ""; // Clear the input
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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Student Portal</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" /> Report an Issue
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50"
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room Number</label>
                <input 
                  type="number" min="1" required placeholder="e.g., 204"
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Describe the problem in detail..."
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Photo Evidence</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-500">{image ? image.name : 'Click to upload or drag & drop'}</span>
                  </div>
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-blue-300 transition-all flex justify-center items-center gap-2"
              >
                {loading ? 'Uploading...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket History */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> My Recent Requests
            </h2>
            <button 
              onClick={fetchTickets}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all disabled:opacity-50"
              title="Refresh Tickets"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 shadow-sm flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">You have no active maintenance requests.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
                  {ticket.imageUrl && (
                    <img src={ticket.imageUrl} alt="Issue" className="w-full sm:w-40 h-32 object-cover rounded-xl border border-slate-100" />
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {ticket.category} • Room {ticket.roomNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        ticket.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm mt-2 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-slate-400 mt-3 font-medium">
                      Reported on {new Date(ticket.createdAt).toLocaleDateString()}
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