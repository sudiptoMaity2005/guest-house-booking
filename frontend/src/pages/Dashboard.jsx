import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedBookingIndex, setSelectedBookingIndex] = useState(null); 
    const [cancellingId, setCancellingId] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [navigate]);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/my-bookings');
            
            // Sort DESCENDING: Newest check-in dates sit at the top, pushing older ones down
            const sorted = res.data.sort((a, b) => new Date(b.check_in) - new Date(a.check_in));
            setBookings(sorted);
        } catch (err) {
            toast.error('Error fetching your bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        
        setCancellingId(id); 
        
        try {
            await API.put(`/bookings/${id}/cancel`);
            toast.success("Cancelled successfully!");
            setSelectedBooking(null);
            await fetchBookings(); 
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error cancelling');
        } finally {
            setCancellingId(null); 
        }
    };

    const getPricing = (checkIn, checkOut, price) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
        const perNight = Number(price) || 0;
        return { nights, total: nights * perNight };
    };

    if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4 pb-20">
            <h2 className="text-3xl font-black text-gray-900 mb-10">Your Trips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookings.map((booking, index) => {
                    // --- THE MASTER FIX: Calculate the true historical trip number ---
                    const tripNumber = bookings.length - index;

                    return (
                        <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        {/* Dynamic Trip Number applied here */}
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                                            Trip #{tripNumber}
                                        </p>
                                        <h3 className="text-xl font-extrabold text-gray-900 truncate">
                                            {booking.location || 'Premium Room'}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                                        booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 
                                        booking.status === 'WAITLISTED' ? 'bg-orange-100 text-orange-700' : 
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm font-bold text-gray-700">
                                    {new Date(booking.check_in).toDateString()} - {new Date(booking.check_out).toDateString()}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { 
                                        setSelectedBooking(booking); 
                                        // Dynamic Trip Number applied to modal here
                                        setSelectedBookingIndex(tripNumber); 
                                    }}
                                    className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-black"
                                >
                                    View Details
                                </button>
                                {booking.status !== 'CANCELLED' && (
                                    <button 
                                        onClick={() => handleCancel(booking.id)} 
                                        disabled={cancellingId === booking.id}
                                        className={`flex-1 font-bold py-3 rounded-xl text-xs border transition-all ${
                                            cancellingId === booking.id 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'
                                        }`}
                                    >
                                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                )}
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