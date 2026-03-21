import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ImageUpload from './components/ImageUpload';
import RoomDetails from './pages/RoomDetails';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      {/* Simplified main container:
         Removed z-indexes, pointers, and absolute overlays.
         Set a clean, solid light gray background (bg-gray-50) suitable for a professional platform.
      */}
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* Your dark navbar will now sit perfectly against the clean light background */}
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/upload" element={<ImageUpload />} />
            <Route path="/room/:id" element={<RoomDetails />} />
          </Routes>
        </main>

        <Footer />
        
      </div>
    </Router>
  );
}