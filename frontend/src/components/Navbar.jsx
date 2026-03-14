import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Guest House <span className="text-blue-300">Booker</span>
        </Link>

        {/* Navigation Links & Buttons */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/login" className="hover:text-blue-200">Log In</Link>
          <Link to="/register" className="bg-white text-blue-800 px-4 py-2 rounded-md font-bold hover:bg-gray-100">
            Register
          </Link>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;