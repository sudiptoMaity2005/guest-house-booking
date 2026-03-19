import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Register() {
    // Step 1 States (User Details)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Step 2 States (OTP Verification)
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    // HANDLER 1: Send the OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await API.post('/auth/register', { name, email, password });
            toast.success(res.data.message || 'OTP sent to your email!');
            setStep(2); // Instantly slide to the OTP screen!
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error sending OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    // HANDLER 2: Verify the OTP & Create Account
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Note: Make sure your backend authRoutes.js maps to '/verify-otp' for the verifyOTPAndRegister controller!
            const res = await API.post('/auth/verify-otp', { email, otp });
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden border border-gray-100">
                
                {/* Left Side: The Framed Atmospheric Image */}
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 hidden md:flex border-r border-gray-100">
    
                    {/* The Framed Container */}
                    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner border border-gray-100 group">
        
                        {/* The Image (Using local image from public folder) */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                            style={{ backgroundImage: "url('/register-bg.svg')" }} 
                        ></div>
        
                        {/* Darkened Gradient Overlay (Keeps text readable) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent z-10"></div>
        
                        {/* Content (Positioned over the framed image) */}
                        <div className="relative z-20 flex flex-col justify-end h-full p-10 text-white">
                            <h2 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight">Join Us Today.</h2>
                            <p className="text-gray-200 font-medium leading-relaxed max-w-sm">Create an account to unlock instant bookings, priority waitlists, and seamless stay management.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: The Dynamic Form Area */}
                <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white relative">
                    
                    {step === 1 ? (
                        /* --- STEP 1: INITIAL REGISTRATION FORM --- */
                        <div className="animate-fadeIn">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h2>
                            <p className="text-gray-500 mb-8 font-medium">Please enter your details to sign up.</p>

                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text" required
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-gray-50"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email" required
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-gray-50"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
                                    <input
                                        type="password" required minLength="6"
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-gray-50"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className={`w-full py-3.5 mt-4 rounded-xl font-bold text-white transition-all shadow-md transform hover:-translate-y-1 ${
                                        isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                                    }`}
                                >
                                    {isSubmitting ? 'Sending Code...' : 'Continue'}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-gray-600">
                                Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">Log in here</Link>
                            </p>
                        </div>
                    ) : (
                        /* --- STEP 2: OTP VERIFICATION FORM --- */
                        <div className="animate-fadeIn">
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                className="text-sm font-bold text-gray-400 hover:text-blue-600 mb-6 flex items-center transition-colors"
                            >
                                ← Back to details
                            </button>
                            
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                            <p className="text-gray-500 mb-8 font-medium">We sent a 6-digit code to <span className="text-gray-900 font-bold">{email}</span>. It expires in 5 minutes.</p>

                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Enter 6-Digit Code</label>
                                    <input
                                        type="text" required maxLength="6"
                                        placeholder="• • • • • •"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-gray-50 text-center text-2xl tracking-[0.5em] font-bold text-gray-800"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-md transform hover:-translate-y-1 ${
                                        isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                                    }`}
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verify & Register'}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}