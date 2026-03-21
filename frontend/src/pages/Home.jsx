import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Home() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    // 1. STATE FOR THE SEARCH BAR
    const [searchQuery, setSearchQuery] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllRooms = async () => {
            try {
                const res = await API.get('/rooms');
                setRooms(res.data);
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllRooms();
    }, []);

    // 2. FRONTEND FILTERING LOGIC (Real-time as you type)
    // This creates a derived list of rooms that match the user's search query.
    const filteredRooms = rooms.filter(room => {
        const query = searchQuery.toLowerCase().trim();
        // Check if query is present in location OR room_type
        const locationMatch = room.location?.toLowerCase().includes(query);
        const typeMatch = room.room_type?.toLowerCase().includes(query);
        
        // Show everything if search is empty, otherwise show matches
        return query === '' || locationMatch || typeMatch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* 3. NEW STICKY SEARCH BAR SECTION */}
            {/* Placed prominently at the top, centered */}
            <div className="sticky top-[80px] z-20 mb-12 flex justify-center pt-2 pb-6 px-1">
                <div className="relative w-full max-w-xl group">
                    {/* Search Icon (SVG) */}
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    {/* The Actual Input */}
                    <input 
                        type="search"
                        placeholder="Search by Location (e.g., Manali) or Room Type (e.g., Suite)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-16 pr-8 text-base font-medium bg-white border border-gray-200 rounded-full shadow-lg outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder:text-gray-400 placeholder:font-normal"
                    />
                </div>
            </div>

            {/* Title removed per request (was above the grid) */}

            {/* 4. UPDATE MAPPING: Use filteredRooms instead of rooms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredRooms.map(room => (
                    <div 
                        key={room.id} 
                        onClick={() => navigate(`/room/${room.id}`)}
                        className="group cursor-pointer flex flex-col gap-3"
                    >
                        {/* Image Container (Background adjusted to bg-gray-100 for light theme) */}
                        <div className="aspect-[20/19] w-full overflow-hidden rounded-2xl bg-gray-100 relative shadow-sm border border-gray-200">
                            <img 
                                src={room.thumbnail_url} 
                                alt={`${room.location || 'Room'} property`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop' }} 
                            />
                            {/* Heart Icon (SVG adjusted slightly for lighter UI) */}
                            <button className="absolute top-3 right-3 text-white/90 hover:text-white transition-all hover:scale-110 drop-shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="rgba(0,0,0,0.3)" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            </button>
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col px-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-base font-bold text-gray-950 truncate pr-4">
                                    {room.location || `Room ${room.room_number}`}
                                </h3>
                                <div className="flex items-center gap-1 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-900">
                                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-950">{room.rating || 'New'}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate">{room.room_type} Room</p>
                            
                            <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-sm font-extrabold text-gray-950">₹{room.price_per_night}</span>
                                <span className="text-sm text-gray-600 font-medium">night</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. EMPTY STATE: Shown if search returns no results */}
            {filteredRooms.length === 0 && searchQuery !== '' && (
                <div className="flex flex-col items-center text-center mt-20 py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950 mb-2">No matching properties</h3>
                    <p className="text-gray-600 font-medium">Try searching for something else, or clear your search.</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
}