import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState({ name: 'Guest User', email: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) { const u = JSON.parse(rawUser); if (u?.name) setUserProfile(u); }
        } catch (e) { /* safe */ }
        fetchBookings();
    }, [navigate]);

    const fetchBookings = async () => {
        try { const res = await API.get('/bookings/my-bookings'); setBookings(res.data); }
        catch { toast.error('Error fetching bookings'); }
        finally { setLoading(false); }
    };

    const handleCancel = async (id, isWaitlist) => {
        if (!window.confirm("Cancel this booking?")) return;
        try {
            if (isWaitlist) await API.put(`/bookings/${id}/cancel`);
            else await API.delete(`/bookings/${id}`);
            toast.success("Cancelled!");
            fetchBookings();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-rule border-t-forest"></div>
        </div>
    );

    return (
        <div className="w-full px-6 lg:px-16 xl:px-24 py-16 lg:py-24">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4">
                <div>
                    <p className="text-[11px] font-label font-bold text-stone uppercase tracking-[0.15em] mb-2">Dashboard</p>
                    <h2 className="font-serif text-ink text-4xl lg:text-5xl">Your Bookings</h2>
                </div>
                <button onClick={() => navigate('/')} className="mt-4 sm:mt-0 bg-forest text-white font-label text-[12px] font-bold uppercase tracking-[0.1em] px-6 py-3 rounded-lg hover:bg-forest/90 transition-colors shadow-card">
                    + New Booking
                </button>
            </div>
            <div className="h-px bg-rule mb-12"></div>

            {bookings.length === 0 ? (
                <div className="py-24 text-center">
                    <h3 className="font-serif text-ink text-3xl mb-3">Nothing here yet</h3>
                    <p className="text-stone max-w-md mx-auto mb-10 leading-relaxed">You haven't made any reservations. Browse our rooms and book your stay.</p>
                    <button onClick={() => navigate('/')} className="bg-forest text-white font-label text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-3.5 rounded-lg hover:bg-forest/90 transition-colors shadow-card">
                        Explore Rooms
                    </button>
                </div>
            ) : (
                <div className="space-y-0">
                    {bookings.map((booking, i) => {
                        const isWaitlisted = booking.status === 'WAITLISTED';
                        const isCancelled = booking.status === 'CANCELLED';

                        return (
                            <div key={booking.id} className={`group border-b border-rule ${isCancelled ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 py-8 lg:py-10">

                                    <span className="font-serif text-rule text-4xl lg:text-5xl w-16 flex-shrink-0 hidden lg:block">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                                            <h3 className="font-serif text-ink text-2xl lg:text-3xl">
                                                Room {booking.room_number}
                                            </h3>
                                            <span className="text-[11px] font-label font-bold uppercase tracking-[0.15em] text-stone">
                                                {booking.room_type}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone">
                                            <span><span className="font-semibold text-ink">In:</span> {booking.check_in}</span>
                                            <span><span className="font-semibold text-ink">Out:</span> {booking.check_out}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <span className={`text-[10px] font-label font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-md ${isWaitlisted ? 'bg-amber-50 text-amber-700' :
                                            isCancelled ? 'bg-stone/10 text-stone' :
                                                'bg-emerald-50 text-emerald-700'
                                            }`}>
                                            {booking.status}
                                        </span>

                                        {!isCancelled && (
                                            <button
                                                onClick={() => handleCancel(booking.id, isWaitlisted)}
                                                className="font-label text-[12px] font-bold uppercase tracking-[0.1em] text-red-700 hover:text-red-900 transition-colors underline underline-offset-4"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- THE FIXED VIEW DETAILS MODAL --- */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-modalUp">
                        
                        <div className="h-44 bg-gray-200 relative">
                            <img src={selectedBooking.thumbnail_url || 'https://via.placeholder.com/400x200'} className="w-full h-full object-cover" alt="room" />
                            {/* Adding the Trip Number badge to the modal image for consistency */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Trip #{selectedBookingIndex}</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-6">
                                <h3 className="text-3xl font-black text-gray-900">{selectedBooking.location}</h3>
                                <p className="text-gray-500 font-bold text-lg">{selectedBooking.room_type} Room</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-400 uppercase">Room Number</p>
                                    <p className="text-xl font-black text-blue-900">#{selectedBooking.room_number || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Accommodated</p>
                                    <p className="text-xl font-black text-gray-900">{selectedBooking.num_visitors} Guest(s)</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Breakdown</h4>
                                {(() => {
                                    const { nights, total } = getPricing(selectedBooking.check_in, selectedBooking.check_out, selectedBooking.price_per_night);
                                    return (
                                        <>
                                            <div className="flex justify-between font-bold text-gray-600">
                                                <span>₹{selectedBooking.price_per_night || 0} x {nights} nights</span>
                                                <span className="text-gray-900">₹{total}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-gray-600">
                                                <span>Taxes & Service Fees</span>
                                                <span className="text-green-600">Included</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                                                <span className="text-lg font-black text-gray-900">Total Payment</span>
                                                <span className="text-2xl font-black text-blue-600">₹{total}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <button onClick={() => setSelectedBooking(null)} className="w-full mt-8 py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all">
                                Close Itinerary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}