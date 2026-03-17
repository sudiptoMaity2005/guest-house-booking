import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; // Make sure this path is correct for your project!

export default function Register() {
    // Step 1 State
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    
    // Step 2 State
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Triggered when user clicks "Send Verification Code"
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // This hits your new registerAndSendOTP backend function
            const response = await API.post('/auth/register', formData);
            alert(response.data.message); // "OTP sent to your email..."
            setIsOtpSent(true);           // Flip the UI to Step 2
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending OTP');
        } finally {
            setLoading(false);
        }
    };

    // Triggered when user enters the 6 digits and clicks "Verify & Register"
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // This hits your verifyOTPAndRegister backend function
            const response = await API.post('/auth/verify-otp', { 
                email: formData.email, 
                otp: otp 
            });
            
            alert(response.data.message); // "Registration successful!"
            navigate('/login');           // Send them to login!
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
                
                <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
                    {isOtpSent ? 'Verify Your Email' : 'Create an Account'}
                </h2>

                {/* --- STEP 1: Details Form --- */}
                {!isOtpSent ? (
                    <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
                            <input 
                                type="text" required
                                className="w-full p-2 border rounded text-gray-800"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Email Address</label>
                            <input 
                                type="email" required
                                className="w-full p-2 border rounded text-gray-800"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
                            <input 
                                type="password" required minLength="6"
                                className="w-full p-2 border rounded text-gray-800"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full text-white font-bold py-2 rounded mt-2 transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </form>
                ) : (
                /* --- STEP 2: OTP Verification Form --- */
                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 text-center mb-2">
                            We sent a 6-digit code to <b>{formData.email}</b>. It expires in 5 minutes.
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1 text-center">Enter 6-Digit Code</label>
                            <input 
                                type="text" required maxLength="6"
                                className="w-full p-3 border rounded text-center text-2xl tracking-widest font-mono text-gray-800"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="------"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full text-white font-bold py-2 rounded mt-2 transition ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Verifying...' : 'Verify & Register'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsOtpSent(false)}
                            className="text-sm text-gray-500 hover:text-gray-800 mt-2 underline text-center"
                        >
                            Wait, I need to change my email
                        </button>
                    </form>
                )}

                {/* Bottom Links */}
                {!isOtpSent && (
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in here</Link>
                    </p>
                )}
            </div>
        </div>
    );
}