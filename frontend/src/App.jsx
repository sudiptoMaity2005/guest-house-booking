import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen relative bg-gray-950 text-gray-900 font-sans">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* --- THE PROMINENT DARK LUXURY BACKGROUND --- */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            {/* The image - Opacity cranked up to 60% */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-60" 
                style={{ backgroundImage: "url('/app-bg.jpg')" }}
            ></div>
            {/* Dark glassmorphism overlay to ensure text remains readable */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-gray-900/30 to-black/80 backdrop-blur-[3px]"></div>
        </div>

        <div className="relative z-10">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
        </div>
        
      </div>
    </Router>
  );
}