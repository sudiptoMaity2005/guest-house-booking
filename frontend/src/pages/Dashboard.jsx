import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Default safe state
    const [userProfile, setUserProfile] = useState({ name: 'Guest User', email: '' });
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        // --- THE CRASH-PROOF FIX ---
        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
                const storedUser = JSON.parse(rawUser);
                // Only update if it actually has a name to prevent the charAt(0) crash
                if (storedUser && storedUser.name) {
                    setUserProfile(storedUser);
                }
            }
        } catch (e) {
            console.error("Safe catch: No valid user data found in storage.");
        }

        fetchBookings();
    }, [navigate]);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/my-bookings');
            setBookings(res.data);
        } catch (err) {
            toast.error('Error fetching your bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id, isWaitlist) => {
        if (!window.confirm("Are you sure you want to cancel this?")) return;
        
        try {
            if (isWaitlist) {
                await API.put(`/bookings/${id}/cancel`);
            } else {
                await API.delete(`/bookings/${id}`);
            }
            toast.success("Cancelled successfully!");
            fetchBookings(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error cancelling booking');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Safety fallback for the Avatar to guarantee it never crashes again
    const avatarLetter = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'G';

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4">

            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Bookings</h2>
            </div>

            {bookings.length === 0 ? (
                /* Beautiful Empty State */
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">It looks like you haven't booked any rooms yet. Start exploring to find your perfect stay.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md transform hover:-translate-y-1"
                    >
                        Explore Rooms
                    </button>
                </div>
            ) : (
                /* Bookings Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => {
                        const isWaitlisted = booking.status === 'WAITLISTED';
                        const isCancelled = booking.status === 'CANCELLED';

                        return (
                            <div key={booking.id} className={`relative bg-white rounded-2xl p-6 shadow-sm border ${isCancelled ? 'border-gray-200 opacity-60' : 'border-gray-100 hover:shadow-xl transition-all'}`}>
                                
                                <div className="absolute top-6 right-6">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                        isWaitlisted ? 'bg-orange-100 text-orange-700' : 
                                        isCancelled ? 'bg-gray-200 text-gray-600' : 
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Room {booking.room_number}</h3>
                                    <span className="inline-block text-gray-500 text-sm mt-1">{booking.room_type}</span>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Check-in</span>
                                        <span className="text-sm font-semibold text-gray-900">{booking.check_in}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Check-out</span>
                                        <span className="text-sm font-semibold text-gray-900">{booking.check_out}</span>
                                    </div>
                                </div>

                                {!isCancelled && (
                                    <button 
                                        onClick={() => handleCancel(booking.id, isWaitlisted)}
                                        className="w-full bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold py-2.5 rounded-xl transition-all"
                                    >
                                        Cancel {isWaitlisted ? 'Request' : 'Booking'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}