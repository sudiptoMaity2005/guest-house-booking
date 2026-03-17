const today = new Date().toISOString().split('T')[0];
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Home() {
    const [rooms, setRooms] = useState([]);
    const [searchDates, setSearchDates] = useState({ check_in: '', check_out: '' });
    const [searched, setSearched] = useState(false);
    
    // Modal State
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({ num_visitors: 1, purpose_of_visit: '' });
    
    const navigate = useNavigate();

    // Fetch all rooms on initial load
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
            alert('Error searching for rooms');
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem('token')) {
            alert("Please log in to book or waitlist a room.");
            navigate('/login');
            return;
        }

        try {
            // DYNAMIC ROUTING: Choose endpoint based on room status
            const endpoint = selectedRoom.status === 'occupied' ? '/bookings/waitlist' : '/bookings';
            
            const response = await API.post(endpoint, {
                room_id: selectedRoom.id,
                check_in: searchDates.check_in,
                check_out: searchDates.check_out,
                num_visitors: bookingDetails.num_visitors,
                purpose_of_visit: bookingDetails.purpose_of_visit
            });
            
            alert(response.data.message); 
            setSelectedRoom(null);
            
            // Only redirect to dashboard if it was an actual booking, otherwise stay on home
            if (selectedRoom.status !== 'occupied') {
                navigate('/dashboard'); 
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8">
            {/* Hero Section & Search Form */}
            <div className="bg-blue-600 rounded-xl p-8 text-white shadow-lg mb-10">
                <h1 className="text-4xl font-bold mb-2">Find Your Perfect Stay</h1>
                <p className="mb-6 opacity-90">Search availability and book your room instantly.</p>
                
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-inner">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-1">Check-in</label>
                        <input 
                            type="date" required
                            min={today} // Cannot book in the past
                            className="w-full text-gray-800 p-2 border rounded"
                            value={searchDates.check_in}
                            onChange={(e) => setSearchDates({...searchDates, check_in: e.target.value})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-1">Check-out</label>
                        <input 
                            type="date" required
                            // Min check-out must be at least the check-in date
                            min={searchDates.check_in || today} 
                            className="w-full text-gray-800 p-2 border rounded"
                            value={searchDates.check_out}
                            onChange={(e) => setSearchDates({...searchDates, check_out: e.target.value})}
                        />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full md:w-auto bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-8 rounded h-[42px]">
                            Check Availability
                        </button>
                    </div>
                </form>
            </div>

            {/* Rooms Grid */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {searched ? 'Available Rooms for Selected Dates' : 'All Guest House Rooms'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div key={room.id} className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Room {room.room_number}</h3>
                                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mt-1">{room.room_type}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">₹{room.price_per_night}</p>
                                <p className="text-xs text-gray-500">per night</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 h-10">{room.description}</p>
                        <p className="text-xs text-gray-500 mb-4"><span className="font-semibold">Facilities:</span> {room.facilities}</p>
                        <p className={`text-xs font-bold mb-4 ${room.status === 'occupied' ? 'text-orange-500' : 'text-green-500'}`}>System Status: {room.status ? room.status.toUpperCase() : 'UNKNOWN'}</p>

                        <button 
                            onClick={() => searched ? setSelectedRoom(room) : alert('Please select check-in and check-out dates first!')}
                            className={`w-full py-2 rounded font-bold transition ${searched ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {searched ? 'Book This Room' : 'Select Dates to Book'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full m-4 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Complete Booking</h2>
                        <p className="mb-4 text-gray-600">Room {selectedRoom.room_number} from {searchDates.check_in} to {searchDates.check_out}</p>
                        
                        <form onSubmit={handleBook}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Number of Visitors</label>
                                <input 
                                    type="number" min="1" max="4" required
                                    className="w-full p-2 border rounded"
                                    value={bookingDetails.num_visitors}
                                    onChange={(e) => setBookingDetails({...bookingDetails, num_visitors: e.target.value})}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Purpose of Visit</label>
                                <textarea 
                                    required rows="3"
                                    className="w-full p-2 border rounded"
                                    value={bookingDetails.purpose_of_visit}
                                    onChange={(e) => setBookingDetails({...bookingDetails, purpose_of_visit: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setSelectedRoom(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}