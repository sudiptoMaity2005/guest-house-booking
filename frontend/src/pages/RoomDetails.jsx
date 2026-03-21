import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function RoomDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    
    // --- THE FIX: Add Waitlist State ---
    const [isWaitlistMode, setIsWaitlistMode] = useState(false);
    
    // Booking Form State
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [visitors, setVisitors] = useState(1);
    const [purpose, setPurpose] = useState('');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await API.get(`/rooms/${id}`);
                setRoom(res.data);
            } catch (err) {
                console.error("Failed to fetch room details", err);
                toast.error("Could not load room details.");
                navigate('/'); 
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id, navigate]);

    // --- THE REAL-TIME FIX ---
    useEffect(() => {
        const verifyDates = async () => {
            // Only check if both dates are filled out AND checkout is after checkin
            if (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
                try {
                    const res = await API.post('/bookings/check-availability', {
                        room_id: id,
                        check_in: checkIn,
                        check_out: checkOut
                    });
                    // If available is false (dates taken), switch to Waitlist Mode instantly!
                    setIsWaitlistMode(!res.data.available);
                } catch (err) {
                    console.error("Error checking dates:", err);
                }
            } else {
                // Default back to available if they clear the dates
                setIsWaitlistMode(false); 
            }
        };

        // We use a small timeout to "debounce" so we don't spam the server while they type
        const timeoutId = setTimeout(verifyDates, 300);
        return () => clearTimeout(timeoutId);
        
    }, [checkIn, checkOut, id]);

    const handleBook = async (e) => {
        e.preventDefault();
        
        if (!localStorage.getItem('token')) {
            toast.error("Please log in to book this room.");
            navigate('/login');
            return;
        }

        if (!checkIn || !checkOut) {
            return toast.error("Please select both check-in and check-out dates.");
        }

        setIsBooking(true);
        const loadingToast = toast.loading(isWaitlistMode ? "Joining waitlist..." : "Processing reservation...");

        try {
            // --- THE FIX: Use our dynamic state, not the static room status ---
            const endpoint = isWaitlistMode ? '/bookings/waitlist' : '/bookings';
            
            const response = await API.post(endpoint, {
                room_id: room.id,
                check_in: checkIn,
                check_out: checkOut,
                num_visitors: visitors,
                purpose_of_visit: purpose
            });
        
            toast.success(response.data.message, { id: loadingToast });
            navigate('/dashboard'); 
            
        } catch (err) {
            const errorMsg = err.response?.data?.message;
            
            // --- THE FIX: Catch the backend overlap error and trigger Waitlist Mode ---
            if (errorMsg && errorMsg.includes('Waitlist')) {
                toast.error("Dates are taken! Switched to Waitlist mode.", { id: loadingToast });
                setIsWaitlistMode(true); // Transforms the UI!
            } else {
                toast.error(errorMsg || 'Error processing request', { id: loadingToast });
            }
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!room) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 animate-fadeIn container relative z-10 antialiased">
            
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {room.location || `Premium Room ${room.room_number}`}
                </h1>
                <div className="flex items-center text-gray-600 gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {room.rating || 'New'}
                    </span>
                    <span className="underline decoration-gray-300 underline-offset-4">{room.room_type} Room</span>
                </div>
            </div>

            <div className="w-full mb-12 flex items-center justify-center relative z-10 group antialiased">
                <div className="w-full lg:w-3/4 rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 p-2 transition-all duration-300 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 antialiased">
                    <div className="overflow-hidden rounded-2xl flex items-center justify-center aspect-[16/10] bg-gray-50">
                        <img 
                            src={room.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop'} 
                            alt="Room View" 
                            className="mx-auto w-auto h-auto max-w-full max-h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop' }} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 relative z-0">
                <div className="flex-1">
                    <div className="mb-10 pb-10 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About this space</h2>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">{room.description}</p>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">What this place offers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {room.facilities && room.facilities.split(',').map((facility, index) => (
                                <div key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-lg">{facility.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 relative">
                    <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-6 shadow-xl transition-shadow duration-300 focus-within:shadow-2xl relative z-10 antialiased">
                        
                        <div className="flex justify-between items-baseline mb-6 gap-2">
                            <div className="text-2xl font-extrabold text-gray-900 tracking-tight shrink-0">
                                ₹{room.price_per_night} <span className="text-base font-medium text-gray-500">night</span>
                            </div>
                            
                            {/* --- THE FIX: Dynamic UI Badge based on Waitlist State --- */}
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                isWaitlistMode ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {isWaitlistMode ? 'Waitlist Only' : 'AVAILABLE'}
                            </span>
                        </div>

                        <form onSubmit={handleBook} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                                <div className="p-3 border-r border-gray-300 bg-white">
                                    <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-widest mb-1.5">Check-in</label>
                                    <input 
                                        type="date" required min={today}
                                        className="w-full text-sm outline-none bg-transparent cursor-pointer font-bold text-gray-900 placeholder:text-gray-400"
                                        value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                                    />
                                </div>
                                <div className="p-3 bg-white">
                                    <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-widest mb-1.5">Check-out</label>
                                    <input 
                                        type="date" required min={checkIn || today} 
                                        className="w-full text-sm outline-none bg-transparent cursor-pointer font-bold text-gray-900 placeholder:text-gray-400"
                                        value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow bg-white">
                                <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-widest mb-1.5">Guests</label>
                                <input 
                                    type="number" min="1" max="4" required
                                    className="w-full text-sm outline-none bg-transparent font-bold text-gray-900"
                                    value={visitors} onChange={(e) => setVisitors(e.target.value)}
                                />
                            </div>

                            <div className="border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow bg-white">
                                <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-widest mb-1.5">Purpose of Visit</label>
                                <input 
                                    type="text" required placeholder="Vacation, Business, etc."
                                    className="w-full text-sm outline-none bg-transparent font-bold text-gray-900 placeholder:text-gray-400"
                                    value={purpose} onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>

                            {/* --- THE FIX: Dynamic Button styling and text --- */}
                            <button 
                                type="submit" 
                                disabled={isBooking} 
                                className={`mt-4 w-full py-4.5 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-md ${
                                    isBooking ? 'bg-gray-400 cursor-not-allowed' : 
                                    isWaitlistMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#E51D53] hover:bg-[#D41B4D]'
                                }`} 
                            >
                                {isBooking ? 'Processing...' : (isWaitlistMode ? 'Join Waitlist' : 'Reserve')}
                            </button>
                            
                            <p className="text-center text-xs text-gray-500 font-medium mt-3 tracking-tight">You won't be charged yet</p>
                        </form>

                    </div>
                </div>

            </div>
        </div>
    );
}