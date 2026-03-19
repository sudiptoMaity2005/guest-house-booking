import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = !!localStorage.getItem('token');
    
    // Safely get user info for the profile avatar and dropdown
    const storedUser = localStorage.getItem('user');
    const userProfile = storedUser ? JSON.parse(storedUser) : null;
    const avatarLetter = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'G';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsProfileOpen(false); // Close menu on logout
        toast.success('Logged out successfully.');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-gray-800 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* --- LEFT SIDE: Hamburger & Logo --- */}
                    <div className="flex items-center gap-4 md:gap-6">
                        
                        {/* 1. The Hamburger Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => { setIsNavOpen(!isNavOpen); setIsProfileOpen(false); }}
                                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-lg transition-all focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Nav Dropdown (Left aligned) */}
                            {isNavOpen && (
                                <>
                                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNavOpen(false)}></div>
                                    <div className="absolute left-0 mt-4 w-56 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden z-50 animate-fadeIn">
                                        <div className="py-2">
                                            <Link to="/" onClick={() => setIsNavOpen(false)} className={`block px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors ${isActive('/') ? 'text-blue-400' : 'text-gray-300'}`}>Home</Link>
                                            {isAuthenticated && (
                                                <Link to="/dashboard" onClick={() => setIsNavOpen(false)} className={`block px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors ${isActive('/dashboard') ? 'text-blue-400' : 'text-gray-300'}`}>Bookings</Link>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 2. The Logo */}
                        <div className="flex-shrink-0 flex items-center cursor-pointer transform transition-transform hover:scale-105" onClick={() => navigate('/')}>
                            <span className="text-2xl font-extrabold tracking-tighter text-white">
                                Drey<span className="text-blue-500">Go</span>
                            </span>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: User Profile --- */}
                    <div className="relative flex items-center">
                        <button 
                            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNavOpen(false); }}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden shadow-lg border border-gray-700 hover:scale-105 transition-transform focus:outline-none"
                            style={{ background: isAuthenticated ? 'linear-gradient(to bottom right, #2563eb, #1e40af)' : '#374151' }}
                        >
                            {isAuthenticated ? avatarLetter : (
                                <svg className="w-5 h-5 mt-1 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        {/* Profile Dropdown (Right aligned) */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute right-0 top-14 w-64 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden z-50 animate-fadeIn">
                                    <div className="py-2">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/50 cursor-default">
                                                    <p className="text-sm font-bold text-white">{userProfile?.name || 'Guest'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                                                </div>
                                                <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-semibold text-red-400 hover:bg-gray-800 transition-colors">Log Out</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/login" onClick={() => setIsProfileOpen(false)} className={`block px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors ${isActive('/login') ? 'text-blue-400' : 'text-gray-300'}`}>Log In</Link>
                                                <Link to="/register" onClick={() => setIsProfileOpen(false)} className={`block px-5 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors ${isActive('/register') ? 'text-blue-400' : 'text-gray-300'}`}>Register</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}