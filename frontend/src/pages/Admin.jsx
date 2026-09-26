import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTickets = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Kick them out if they aren't an admin
      if (!token || user?.role !== 'admin') {
        return navigate('/'); 
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        alert('Unauthorized or server error');
      } finally {
        setLoading(false);
      }
    };
    fetchAllTickets();
  }, [navigate]);

  const updateStatus = async (ticketId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update the UI instantly by modifying the local state
      setTickets(tickets.map(t => 
        t._id === ticketId ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Helper function to render a Kanban column
  const renderColumn = (statusName, bgColor) => {
    const columnTickets = tickets.filter(t => t.status === statusName);
    
    return (
      <div className={`p-4 rounded-lg min-h-[500px] ${bgColor}`}>
        <h2 className="font-bold text-lg mb-4 flex justify-between items-center">
          {statusName} 
          <span className="bg-white px-2 py-1 rounded-full text-sm shadow-sm">{columnTickets.length}</span>
        </h2>
        
        <div className="space-y-4">
          {columnTickets.map(ticket => (
            <div key={ticket._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">{ticket.category}</span>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">Room {ticket.roomNumber}</span>
              </div>
              
              <p className="text-gray-800 text-sm mb-3">{ticket.description}</p>
              
              {ticket.imageUrl && (
                <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline block mb-3">
                  View Attached Photo
                </a>
              )}
              
              <div className="text-xs text-gray-500 mb-4 border-t pt-2">
                Reported by: {ticket.studentId?.name} ({ticket.studentId?.email})
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-2">
                {statusName !== 'Pending' && (
                  <button onClick={() => updateStatus(ticket._id, 'Pending')} className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-1.5 rounded transition">
                    Move to Pending
                  </button>
                )}
                {statusName !== 'Assigned' && (
                  <button onClick={() => updateStatus(ticket._id, 'Assigned')} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold py-1.5 rounded transition">
                    Assign Task
                  </button>
                )}
                {statusName !== 'Resolved' && (
                  <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-1.5 rounded transition">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard - Kanban Board</h1>
          <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-700">Logout</button>
        </div>

        {/* The 3 Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn('Pending', 'bg-yellow-50')}
          {renderColumn('Assigned', 'bg-blue-50')}
          {renderColumn('Resolved', 'bg-green-50')}
        </div>
      </div>
    </div>
  );
}