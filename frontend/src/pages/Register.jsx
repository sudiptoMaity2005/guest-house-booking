import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await API.post('/auth/register', { name, email, password });
            toast.success(res.data.message || 'OTP sent!');
            setStep(2);
        } catch (err) { toast.error(err.response?.data?.message || 'Error sending OTP'); }
        finally { setIsSubmitting(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('/auth/verify-otp', { email, otp });
            toast.success('Registered! Please sign in.');
            navigate('/login');
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
        finally { setIsSubmitting(false); }
    };

    const inputClass = "w-full px-4 py-3.5 rounded-lg bg-clay border border-rule text-ink font-sans text-sm font-medium outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all placeholder:text-stone/40";

    return (
        <div className="min-h-[calc(100vh-56px)] relative flex items-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/register-bg.svg')" }}></div>
            <div className="absolute inset-0 bg-forest/70"></div>

            <div className="relative z-10 w-full px-6 lg:px-16 xl:px-24 py-16 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-16">

                <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <p className="text-gold text-[11px] font-label font-bold uppercase tracking-[0.25em] mb-8">Get Started</p>
                    <h1 className="font-serif text-white text-5xl lg:text-7xl leading-[1.08] mb-8">
                        Create your <br />account.
                    </h1>
                    <p className="text-white/40 text-base leading-relaxed max-w-sm mb-12">
                        Unlock instant bookings, priority waitlists, and seamless stay management with your free account.
                    </p>

                    <div className="space-y-4">
                        {[
                            { label: 'Instant Booking', desc: 'Confirm rooms in seconds' },
                            { label: 'Priority Waitlist', desc: 'Get first access to cancellations' },
                            { label: 'Booking History', desc: 'Track all your past stays' },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">{item.label}</p>
                                    <p className="text-white/30 text-xs mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-md bg-paper rounded-2xl shadow-overlay p-10 lg:p-12">

                    {step === 1 ? (
                        <div>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <p className="text-[11px] font-label font-bold text-stone uppercase tracking-[0.15em] mb-1">Account</p>
                                    <h2 className="font-serif text-ink text-3xl">Register</h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-1 rounded-full bg-forest"></div>
                                    <div className="w-8 h-1 rounded-full bg-rule"></div>
                                </div>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Full Name</label>
                                    <input type="text" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Email</label>
                                    <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Password</label>
                                    <input type="password" required minLength="6" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 rounded-lg font-label text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors shadow-card mt-2 ${isSubmitting ? 'bg-stone cursor-not-allowed' : 'bg-forest hover:bg-forest/90'}`}>
                                    {isSubmitting ? 'Sending…' : 'Continue'}
                                </button>
                            </form>

                            <div className="h-px bg-rule my-8"></div>
                            <p className="text-center text-sm text-stone">
                                Have an account? <Link to="/login" className="text-forest font-semibold hover:underline underline-offset-4">Sign in</Link>
                            </p>
                        </div>
                    ) : (
                        <div className="animate-fadeUp">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <button type="button" onClick={() => setStep(1)} className="text-[11px] font-label font-semibold text-stone hover:text-ink transition-colors uppercase tracking-wider mb-2 block">
                                        ← Back
                                    </button>
                                    <h2 className="font-serif text-ink text-3xl">Verify</h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-1 rounded-full bg-forest"></div>
                                    <div className="w-8 h-1 rounded-full bg-forest"></div>
                                </div>
                            </div>

                            <p className="text-stone text-sm mb-8 leading-relaxed">
                                We sent a 6-digit code to <span className="text-ink font-semibold">{email}</span>. It expires in 5 minutes.
                            </p>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-3 text-center">Verification Code</label>
                                    <input type="text" required maxLength="6" placeholder="000000" className="w-full p-4 border border-rule rounded-lg bg-clay text-center text-3xl tracking-[0.4em] font-serif font-bold text-ink placeholder:text-stone/20 outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                </div>

                                <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 rounded-lg font-label text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors shadow-card ${isSubmitting ? 'bg-stone cursor-not-allowed' : 'bg-forest hover:bg-forest/90'}`}>
                                    {isSubmitting ? 'Verifying…' : 'Verify & Register'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}