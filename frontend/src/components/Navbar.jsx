import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    
    // Check if the user is currently logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        // Clear the local storage and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo / Brand Name */}
                <Link to="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-200 transition">
                    GuestHouse<span className="text-blue-400">Booker</span>
                </Link>
                
                {/* Navigation Links */}
                <div className="flex items-center gap-6 font-semibold">
                    <Link to="/" className="hover:text-blue-300 transition">Home</Link>
                    
                    {token ? (
                        /* Show these if user IS logged in */
                        <>
                            <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
                            <span className="text-blue-300 text-sm border-l border-blue-700 pl-4 hidden md:block">
                                Hello, {user?.name?.split(' ')[0]}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        /* Show these if user is NOT logged in */
                        <>
                            <Link to="/login" className="hover:text-blue-300 transition">Log In</Link>
                            <Link to="/register" className="bg-white text-blue-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm transition shadow-sm">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}