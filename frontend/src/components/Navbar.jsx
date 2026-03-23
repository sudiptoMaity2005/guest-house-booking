import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const isAuthenticated = !!localStorage.getItem('token');

    const storedUser = localStorage.getItem('user');
    const userProfile = storedUser ? JSON.parse(storedUser) : null;
    const avatarLetter = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'G';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsProfileOpen(false);
        toast.success('Logged out successfully.');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-rule">
            <div className="w-full px-6 lg:px-16 xl:px-24">
                <div className="flex justify-between items-center h-14">

                    <div className="flex items-center gap-8 relative">
                        <button
                            onClick={() => { setIsNavOpen(!isNavOpen); setIsProfileOpen(false); }}
                            className="md:hidden p-1.5 text-stone hover:text-ink transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isNavOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>

                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className={`text-[13px] font-label font-semibold uppercase tracking-[0.12em] transition-colors ${isActive('/') ? 'text-ink' : 'text-stone hover:text-ink'}`}>
                                Rooms
                            </Link>
                            {isAuthenticated && (
                                <Link to="/dashboard" className={`text-[13px] font-label font-semibold uppercase tracking-[0.12em] transition-colors ${isActive('/dashboard') ? 'text-ink' : 'text-stone hover:text-ink'}`}>
                                    Bookings
                                </Link>
                            )}
                        </div>

                        {isNavOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsNavOpen(false)}></div>
                                <div className="md:hidden absolute left-0 top-10 w-48 bg-paper rounded-lg shadow-lifted border border-rule overflow-hidden z-50 animate-fadeUp">
                                    <Link to="/" onClick={() => setIsNavOpen(false)} className={`block px-5 py-3 text-sm font-label font-semibold transition-colors ${isActive('/') ? 'text-forest bg-clay' : 'text-ink hover:bg-clay'}`}>Rooms</Link>
                                    {isAuthenticated && (
                                        <Link to="/dashboard" onClick={() => setIsNavOpen(false)} className={`block px-5 py-3 text-sm font-label font-semibold transition-colors ${isActive('/dashboard') ? 'text-forest bg-clay' : 'text-ink hover:bg-clay'}`}>Bookings</Link>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate('/')}>
                        <span className="font-serif text-xl tracking-[0.04em] text-ink">
                            Drey<span className="text-forest font-bold">Go</span>
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNavOpen(false); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-label font-bold bg-forest text-white hover:bg-forest/90 transition-colors"
                        >
                            {isAuthenticated ? avatarLetter : (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute right-0 top-10 w-56 bg-paper rounded-lg shadow-lifted border border-rule overflow-hidden z-50 animate-fadeUp">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-5 py-4 border-b border-rule">
                                                <p className="text-sm font-label font-bold text-ink">{userProfile?.name || 'Guest'}</p>
                                                <p className="text-xs text-stone truncate mt-0.5">{userProfile?.email}</p>
                                            </div>
                                            <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-label font-semibold text-red-700 hover:bg-clay transition-colors">Log Out</button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setIsProfileOpen(false)} className={`block px-5 py-3 text-sm font-label font-semibold transition-colors ${isActive('/login') ? 'text-forest bg-clay' : 'text-ink hover:bg-clay'}`}>Sign In</Link>
                                            <Link to="/register" onClick={() => setIsProfileOpen(false)} className={`block px-5 py-3 text-sm font-label font-semibold transition-colors ${isActive('/register') ? 'text-forest bg-clay' : 'text-ink hover:bg-clay'}`}>Create Account</Link>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}