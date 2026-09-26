import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Student from './pages/Student';
import Admin from './pages/Admin'; // Import the Admin component

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<Student />} />
      <Route path="/admin" element={<Admin />} /> {/* Connect it here */}
    </Routes>
  );
}