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
            const dynamicName = res.data.user?.name || email.split('@')[0];
            localStorage.setItem('user', JSON.stringify({ name: dynamicName, email }));
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid credentials'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-[calc(100vh-56px)] relative flex items-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/image.png')" }}></div>
            <div className="absolute inset-0 bg-forest/70"></div>

            <div className="relative z-10 w-full px-6 lg:px-16 xl:px-24 py-16 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-16">

                <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <p className="text-gold text-[11px] font-label font-bold uppercase tracking-[0.25em] mb-8">Welcome Back</p>
                    <h1 className="font-serif text-white text-5xl lg:text-7xl leading-[1.08] mb-8">
                        Sign in to <br />your account.
                    </h1>
                    <p className="text-white/40 text-base leading-relaxed max-w-sm mb-12">
                        Access your dashboard, manage reservations, and discover new rooms.
                    </p>

                    <div className="flex gap-10">
                        <div>
                            <p className="font-serif text-white text-3xl leading-none">2k+</p>
                            <p className="text-white/30 text-[10px] font-label font-bold uppercase tracking-[0.15em] mt-1.5">Happy Guests</p>
                        </div>
                        <div>
                            <p className="font-serif text-white text-3xl leading-none">4.8</p>
                            <p className="text-white/30 text-[10px] font-label font-bold uppercase tracking-[0.15em] mt-1.5">Avg. Rating</p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md bg-paper rounded-2xl shadow-overlay p-10 lg:p-12">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-[11px] font-label font-bold text-stone uppercase tracking-[0.15em] mb-1">Account</p>
                            <h2 className="font-serif text-ink text-3xl">Sign In</h2>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Email</label>
                            <input type="email" required className="w-full px-4 py-3.5 rounded-lg bg-clay border border-rule text-ink font-sans text-sm font-medium outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all placeholder:text-stone/40" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Password</label>
                            <input type="password" required className="w-full px-4 py-3.5 rounded-lg bg-clay border border-rule text-ink font-sans text-sm font-medium outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all placeholder:text-stone/40" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 rounded-lg font-label text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors shadow-card mt-2 ${isSubmitting ? 'bg-stone cursor-not-allowed' : 'bg-forest hover:bg-forest/90'}`}>
                            {isSubmitting ? 'Signing in…' : 'Continue'}
                        </button>
                    </form>

                    <div className="h-px bg-rule my-8"></div>

                    <p className="text-center text-sm text-stone">
                        New here? <Link to="/register" className="text-forest font-semibold hover:underline underline-offset-4">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}