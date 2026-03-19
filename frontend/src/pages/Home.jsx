import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
const today = new Date().toISOString().split('T')[0];

export default function Home() {
    const [rooms, setRooms] = useState([]);
    const [searchDates, setSearchDates] = useState({ check_in: '', check_out: '' });
    const [searched, setSearched] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({ num_visitors: 1, purpose_of_visit: '' });
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllRooms = async () => {
            try {
                const res = await API.get('/rooms');
                setRooms(res.data);
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            }
        };
        fetchAllRooms();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await API.get(`/rooms?check_in=${searchDates.check_in}&check_out=${searchDates.check_out}`);
            setRooms(res.data);
            setSearched(true);
        } catch (err) {
            toast.error('Error searching for rooms');
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem('token')) {
            toast.error("Please log in to book a room.");
            navigate('/login');
            return;
        }

        setIsBooking(true);
        try {
            const endpoint = selectedRoom.status === 'occupied' ? '/bookings/waitlist' : '/bookings';
            const response = await API.post(endpoint, {
                room_id: selectedRoom.id,
                check_in: searchDates.check_in,
                check_out: searchDates.check_out,
                num_visitors: bookingDetails.num_visitors,
                purpose_of_visit: bookingDetails.purpose_of_visit
            });
        
            toast.success(response.data.message);
            setSelectedRoom(null);
            if (selectedRoom.status !== 'occupied') {
                navigate('/dashboard'); 
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing request');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4">
            
            {/* --- THE DARK TRANSPARENT HERO SECTION --- */}
            <div 
                className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl bg-gray-900/40 backdrop-blur-xl border border-gray-700/50"
                style={{ minHeight: '450px' }}
            >
                {/* Content */}
                <div className="relative z-10 p-10 md:p-16 flex flex-col justify-center h-full">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                        Find Your Perfect Stay.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light drop-shadow-md">
                        Search availability, compare premium rooms, and book your experience instantly.
                    </p>
                    
                    {/* The Dark Transparent Search Tabs */}
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-gray-600/50 shadow-2xl max-w-4xl">
                        <div className="flex-1">
                            <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wider">Check-in</label>
                            <input 
                                type="date" required min={today}
                                // Dark inputs to match the tabs!
                                className="w-full bg-gray-900/60 text-white font-bold p-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner cursor-pointer [color-scheme:dark]"
                                value={searchDates.check_in}
                                onChange={(e) => setSearchDates({...searchDates, check_in: e.target.value})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wider">Check-out</label>
                            <input 
                                type="date" required min={searchDates.check_in || today} 
                                // Dark inputs to match the tabs!
                                className="w-full bg-gray-900/60 text-white font-bold p-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner cursor-pointer [color-scheme:dark]"
                                value={searchDates.check_out}
                                onChange={(e) => setSearchDates({...searchDates, check_out: e.target.value})}
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg h-[60px]">
                                Check Availability
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Rooms Grid */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight bg-white/80 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
                {searched ? 'Available Rooms for Selected Dates' : 'All Guest House Rooms'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map(room => (
                    <div key={room.id} className="border border-gray-100 rounded-2xl p-6 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Room {room.room_number}</h3>
                                <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mt-2 font-semibold tracking-wide border border-blue-100">{room.room_type}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">₹{room.price_per_night}</p>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">per night</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 h-10 leading-relaxed">{room.description}</p>
                        
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700 uppercase tracking-wider">Facilities:</span> <br/>{room.facilities}</p>
                        </div>

                        <div className="mb-6">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                room.status === 'occupied' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                                Status: {room.status ? room.status : 'AVAILABLE'}
                            </span>
                        </div>

                        <button 
                            onClick={() => searched ? setSelectedRoom(room) : toast.error('Please select check-in and check-out dates first!')}
                            className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                                searched ? 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg' : 
                                'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {searched ? 'Book This Room' : 'Select Dates to Book'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal (Unchanged) */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Complete Booking</h2>
                        <p className="mb-6 text-gray-500 font-medium">Room {selectedRoom.room_number} • {searchDates.check_in} to {searchDates.check_out}</p>
                        
                        <form onSubmit={handleBook}>
                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wide">Number of Visitors</label>
                                <input 
                                    type="number" min="1" max="4" required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                    value={bookingDetails.num_visitors}
                                    onChange={(e) => setBookingDetails({...bookingDetails, num_visitors: e.target.value})}
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wide">Purpose of Visit</label>
                                <textarea 
                                    required rows="3"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 resize-none"
                                    value={bookingDetails.purpose_of_visit}
                                    onChange={(e) => setBookingDetails({...bookingDetails, purpose_of_visit: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setSelectedRoom(null)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl">Cancel</button>
                                <button type="submit" disabled={isBooking} className={`flex-1 text-white font-bold py-3 rounded-xl ${isBooking ? 'bg-gray-400' : selectedRoom?.status === 'occupied' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                                    {isBooking ? 'Processing...' : (selectedRoom?.status === 'occupied' ? 'Confirm Waitlist' : 'Confirm Booking')}
                                </button>                                
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}