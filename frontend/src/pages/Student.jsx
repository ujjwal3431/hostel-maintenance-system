import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Student() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ category: 'Electrical', roomNumber: '', description: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch past tickets when the page loads
  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/'); // Send back to login if no token

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    // We use FormData instead of standard JSON because we are sending a file (image)
    const data = new FormData();
    data.append('category', formData.category);
    data.append('roomNumber', formData.roomNumber);
    data.append('description', formData.description);
    if (image) data.append('image', image);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tickets`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the newly created ticket to the top of our list
      setTickets([res.data.ticket, ...tickets]);
      
      // Reset the form
      setFormData({ category: 'Electrical', roomNumber: '', description: '' });
      setImage(null);
      e.target.reset(); // Clears the file input visually
    } catch (error) {
      console.error(error);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header section */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
          <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-700">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Submission Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4">Report an Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border p-2 rounded-md bg-gray-50"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., A-204"
                  className="w-full border p-2 rounded-md bg-gray-50"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Describe the problem..."
                  className="w-full border p-2 rounded-md bg-gray-50"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Right Column: Ticket History */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">My Requests</h2>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-gray-500 bg-white p-6 rounded-lg text-center shadow-sm">No tickets submitted yet.</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                    
                    {/* Display image if it exists */}
                    {ticket.imageUrl && (
                      <img src={ticket.imageUrl} alt="Issue" className="w-full sm:w-32 h-32 object-cover rounded-md" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{ticket.category} - Room {ticket.roomNumber}</h3>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          ticket.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{ticket.description}</p>
                      <p className="text-xs text-gray-400">Submitted on: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}