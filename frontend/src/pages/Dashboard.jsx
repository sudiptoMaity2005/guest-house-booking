import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Get the user details we saved during login
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login'); // Kick them out if not logged in
            return;
        }
        fetchBookings();
    }, [navigate, user]);

    const fetchBookings = async () => {
        try {
            const response = await API.get('/bookings/my-bookings');
            setBookings(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch your bookings.');
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await API.put(`/bookings/${bookingId}/cancel`);
            alert(response.data.message); // This will show the auto-confirm message if triggered!
            fetchBookings(); // Refresh the list to show the CANCELLED status
        } catch (err) {
            alert('Error cancelling booking');
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading your dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-gray-700">Your Bookings</h2>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {bookings.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed">
                    You have no bookings yet. 
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-gray-50 relative">
                            {/* Status Badge */}
                            <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full 
                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                  booking.status === 'WAITLISTED' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-200 text-gray-600'}`}>
                                {booking.status}
                            </span>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">Room {booking.room_number}</h3>
                            <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Type:</span> {booking.room_type}</p>
                            <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Check-in:</span> {new Date(booking.check_in).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mb-3"><span className="font-semibold">Check-out:</span> {new Date(booking.check_out).toLocaleDateString()}</p>
                            
                            {booking.status !== 'CANCELLED' && (
                                <button 
                                    onClick={() => handleCancel(booking.id)}
                                    className="w-full mt-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 font-semibold py-2 px-4 rounded transition"
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}