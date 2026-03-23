import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Added missing state for the modal
    const [selectedBooking, setSelectedBooking] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchBookings();
    }, [navigate]);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/my-bookings');
            setBookings(res.data);
        } catch {
            toast.error('Error fetching bookings');
        } finally {
            setLoading(false);
        }
    };

    // Helper function for the modal pricing
    const getPricing = (checkIn, checkOut, pricePerNight = 0) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        return { nights, total: nights * pricePerNight };
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
                    <p className="text-stone max-w-md mx-auto mb-10 leading-relaxed">You haven't made any reservations.</p>
                    <button onClick={() => navigate('/')} className="bg-forest text-white font-label text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-3.5 rounded-lg hover:bg-forest/90">Explore Rooms</button>
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

                                    <div className="flex-grow min-w-0 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                                            <h3 className="font-serif text-ink text-2xl lg:text-3xl">Room {booking.room_number}</h3>
                                            <span className="text-[11px] font-label font-bold uppercase tracking-[0.15em] text-stone">{booking.room_type}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone">
                                            <span><span className="font-semibold text-ink">In:</span> {booking.check_in}</span>
                                            <span><span className="font-semibold text-ink">Out:</span> {booking.check_out}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <span className={`text-[10px] font-label font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-md ${isWaitlisted ? 'bg-amber-50 text-amber-700' : isCancelled ? 'bg-stone/10 text-stone' : 'bg-emerald-50 text-emerald-700'}`}>
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
                        );
                    })}
                </div>
            )}

            {/* MODAL SECTION */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
                        <div className="h-44 bg-gray-200 relative">
                            <img src={selectedBooking.thumbnail_url || 'https://via.placeholder.com/400x200'} className="w-full h-full object-cover" alt="room" />
                        </div>
                        <div className="p-8">
                            <div className="mb-6">
                                <h3 className="text-3xl font-black text-gray-900">{selectedBooking.room_type} Room</h3>
                                <p className="text-gray-500 font-bold text-lg">Room #{selectedBooking.room_number}</p>
                            </div>
                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                {(() => {
                                    const { nights, total } = getPricing(selectedBooking.check_in, selectedBooking.check_out, selectedBooking.price_per_night);
                                    return (
                                        <>
                                            <div className="flex justify-between font-bold text-gray-600">
                                                <span>Price for {nights} night(s)</span>
                                                <span className="text-gray-900">₹{total}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                                                <span className="text-lg font-black text-gray-900">Total</span>
                                                <span className="text-2xl font-black text-blue-600">₹{total}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="w-full mt-8 py-4 bg-gray-100 text-gray-900 font-black rounded-2xl">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}