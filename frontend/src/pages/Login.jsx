import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            
            // --- THE DYNAMIC FIX ---
            // Try to get the name from the backend. If it's not there, extract it from the email!
            const dynamicName = res.data.user?.name || email.split('@')[0]; 
            
            localStorage.setItem('user', JSON.stringify({ 
                name: dynamicName, 
                email: email 
            }));
            // -----------------------

            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden border border-gray-100">
                
                {/* Left Side: The Framed Atmospheric Image */}
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 hidden md:flex border-r border-gray-100">
                    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner border border-gray-100 group">
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                            style={{ backgroundImage: "url('/image.png')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent z-10"></div>
                        <div className="relative z-20 flex flex-col justify-end h-full p-10 text-white">
                            <h2 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight">Welcome Back.</h2>
                            <p className="text-gray-200 font-medium leading-relaxed max-w-sm">Access your dashboard, manage your bookings, and find your next perfect stay.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: The Clean Form (With High-Contrast Fields) */}
                <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                    <p className="text-gray-500 mb-8 font-medium">Enter your details to proceed.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Email Address</label>
                            <input
                                type="email" required
                                className="w-full p-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-950 shadow-inner placeholder:text-gray-300"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Password</label>
                            <input
                                type="password" required
                                className="w-full p-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-950 shadow-inner placeholder:text-gray-300"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button
                            type="submit" disabled={isSubmitting}
                            className={`w-full py-4 mt-5 rounded-2xl font-bold text-white transition-all shadow-md transform hover:-translate-y-1 ${
                                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}