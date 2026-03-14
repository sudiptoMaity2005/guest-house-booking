import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // Check if user is logged in

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the session
        localStorage.removeItem('user');  // Clear user info
        navigate('/login');               // Send back to login
    };

    return (
        <nav className="bg-blue-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <Link to="/" className="text-2xl font-bold">
                    GuestHouse<span className="text-blue-300">Booker</span>
                </Link>

                <div className="flex items-center gap-4 md:gap-6">
                    <Link to="/" className="hover:text-blue-200">Home</Link>
                    
                    {token ? (
                        <>
                            {/* Show these if LOGGED IN */}
                            <Link to="/dashboard" className="hover:text-blue-200 font-semibold">Dashboard</Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-bold transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Show these if NOT logged in */}
                            <Link to="/login" className="hover:text-blue-200">Log In</Link>
                            <Link to="/register" className="bg-white text-blue-800 px-4 py-2 rounded-md font-bold hover:bg-gray-100">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;