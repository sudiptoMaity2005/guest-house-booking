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

    const fetchAllRooms = async () => {
        try { const res = await API.get('/rooms'); setRooms(res.data); }
        catch (err) { console.error("Failed to fetch rooms", err); }
    };

    useEffect(() => { fetchAllRooms(); }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await API.get(`/rooms?check_in=${searchDates.check_in}&check_out=${searchDates.check_out}`);
            setRooms(res.data);
            setSearched(true);
        } catch (err) { toast.error('Error searching for rooms'); }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem('token')) { toast.error("Please log in first."); navigate('/login'); return; }
        setIsBooking(true);
        try {
            const endpoint = selectedRoom.status === 'occupied' ? '/bookings/waitlist' : '/bookings';
            const response = await API.post(endpoint, {
                room_id: selectedRoom.id, check_in: searchDates.check_in, check_out: searchDates.check_out,
                num_visitors: bookingDetails.num_visitors, purpose_of_visit: bookingDetails.purpose_of_visit
            });
            toast.success(response.data.message);
            setSelectedRoom(null);
            if (selectedRoom.status !== 'occupied') navigate('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Error processing request'); }
        finally { setIsBooking(false); }
    };

    return (
        <div>
            <section className="w-full relative overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/app-bg.jpg')" }}></div>
                <div className="absolute inset-0 bg-forest/65"></div>

                <div className="relative z-10 flex-1 w-full px-6 lg:px-16 xl:px-24 flex flex-col lg:flex-row gap-8 lg:gap-16">

                    <div className="flex-1 flex flex-col justify-center pt-16 pb-8 lg:pt-0 lg:pb-0">
                        <p className="font-label text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-8">Est. 2024 — Guest House Booking</p>

                        <h1 className="font-serif text-white text-5xl md:text-7xl lg:text-[6rem] xl:text-[7rem] leading-[1.02] mb-8 tracking-[-0.02em]">
                            A Place<br />to Rest<br />&amp; Belong
                        </h1>

                        <p className="text-white/45 text-base lg:text-lg max-w-md leading-relaxed">
                            Simple availability search, transparent pricing, and instant confirmation — all in one place.
                        </p>
                    </div>

                    <div className="hidden lg:flex flex-col justify-center w-[340px] xl:w-[380px] flex-shrink-0">
                        <div className="bg-white/[0.07] border border-white/[0.1] rounded-2xl p-8 xl:p-10 space-y-8">
                            <div className="flex justify-between">
                                {[
                                    { num: '12', label: 'Rooms' },
                                    { num: '4.8', label: 'Rating' },
                                    { num: '2k+', label: 'Guests' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <p className="font-serif text-white text-4xl xl:text-5xl leading-none">{s.num}</p>
                                        <p className="text-white/35 text-[9px] font-label font-bold uppercase tracking-[0.2em] mt-2">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-white/10"></div>

                            <div>
                                <p className="font-serif text-white/60 text-lg xl:text-xl italic leading-relaxed mb-4">
                                    "The kind of place you never want to leave."
                                </p>
                                <p className="text-white/25 text-[10px] font-label font-bold uppercase tracking-[0.2em]">— A Returning Guest</p>
                            </div>

                            <div className="h-px bg-white/10"></div>

                            <div className="flex flex-wrap gap-2">
                                {['Free WiFi', '24/7 Service', 'Garden View', 'Room Service'].map(f => (
                                    <span key={f} className="text-[9px] font-label font-bold uppercase tracking-[0.12em] text-white/35 border border-white/10 px-3.5 py-1.5 rounded-full">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 w-full px-6 lg:px-16 xl:px-24 pb-10">
                    <form onSubmit={handleSearch} className="bg-paper rounded-2xl shadow-overlay px-6 py-5 lg:px-10 lg:py-6 flex flex-col md:flex-row items-stretch gap-4 lg:gap-6 w-full">
                        <div className="flex-1 flex items-center gap-4 border-b md:border-b-0 md:border-r border-rule pb-4 md:pb-0 md:pr-6">
                            <div className="w-10 h-10 rounded-full bg-clay flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="flex-1">
                                <label className="block text-stone text-[10px] font-label font-bold uppercase tracking-[0.15em] mb-0.5">Check In</label>
                                <input type="date" required min={today} className="w-full bg-transparent text-ink font-sans text-sm font-semibold outline-none cursor-pointer" value={searchDates.check_in} onChange={(e) => setSearchDates({ ...searchDates, check_in: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-4 border-b md:border-b-0 md:border-r border-rule pb-4 md:pb-0 md:pr-6">
                            <div className="w-10 h-10 rounded-full bg-clay flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="flex-1">
                                <label className="block text-stone text-[10px] font-label font-bold uppercase tracking-[0.15em] mb-0.5">Check Out</label>
                                <input type="date" required min={searchDates.check_in || today} className="w-full bg-transparent text-ink font-sans text-sm font-semibold outline-none cursor-pointer" value={searchDates.check_out} onChange={(e) => setSearchDates({ ...searchDates, check_out: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" className="bg-forest text-white font-label text-[13px] font-bold uppercase tracking-[0.1em] px-12 py-4 rounded-xl hover:bg-forest/90 transition-colors shadow-card flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Search Rooms
                        </button>
                    </form>
                </div>
            </section>

            <section className="w-full bg-paper px-6 lg:px-16 xl:px-24 pt-12 pb-20 lg:pt-16 lg:pb-28">
                <div className="flex items-end justify-between mb-4">
                    <h2 className="font-serif text-ink text-4xl lg:text-5xl">
                        {searched ? 'Available' : 'Our Rooms'}
                    </h2>
                    {searched && (
                        <button onClick={() => { setSearched(false); setSearchDates({ check_in: '', check_out: '' }); fetchAllRooms(); }} className="text-[12px] font-label font-bold uppercase tracking-[0.12em] text-stone hover:text-ink transition-colors">
                            Clear filters
                        </button>
                    )}
                </div>
                <div className="h-px bg-rule mb-12"></div>

                <div className="space-y-0">
                    {rooms.map((room, i) => (
                        <div key={room.id} className="group border-b border-rule">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 py-8 lg:py-10">
                                <span className="font-serif text-rule text-4xl lg:text-5xl w-16 flex-shrink-0 hidden lg:block">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                                        <h3 className="font-serif text-ink text-2xl lg:text-3xl group-hover:text-forest transition-colors">Room {room.room_number}</h3>
                                        <span className="text-[11px] font-label font-bold uppercase tracking-[0.15em] text-stone">{room.room_type}</span>
                                    </div>
                                    <p className="text-stone text-sm max-w-xl leading-relaxed mb-3">{room.description}</p>
                                    <p className="text-[11px] font-label text-stone/70 uppercase tracking-wider">
                                        <span className="text-ink font-semibold">Facilities:</span> {room.facilities}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 lg:gap-10 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="font-serif text-ink text-2xl lg:text-3xl">{'\u20B9'}{room.price_per_night}</p>
                                        <p className="text-[10px] font-label text-stone uppercase tracking-[0.12em]">per night</p>
                                    </div>
                                    <span className={`text-[10px] font-label font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-md ${room.status === 'occupied' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {room.status || 'Open'}
                                    </span>
                                    <button
                                        onClick={() => searched ? setSelectedRoom(room) : toast.error('Select dates first')}
                                        className={`font-label text-[12px] font-bold uppercase tracking-[0.1em] px-6 py-3 rounded-lg transition-all ${searched ? 'bg-forest text-white hover:bg-forest/90 shadow-card' : 'bg-clay text-stone cursor-not-allowed'}`}
                                    >
                                        {searched ? 'Book' : 'Select dates'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {selectedRoom && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setSelectedRoom(null)}></div>
                    <div className="relative bg-paper p-8 lg:p-12 rounded-xl max-w-lg w-full shadow-overlay animate-fadeUp">
                        <p className="text-[11px] font-label font-bold text-stone uppercase tracking-[0.15em] mb-3">Booking Details</p>
                        <h2 className="font-serif text-ink text-3xl mb-2">Room {selectedRoom.room_number}</h2>
                        <p className="text-stone text-sm mb-8">{searchDates.check_in} {'\u2192'} {searchDates.check_out}</p>
                        <form onSubmit={handleBook} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Visitors</label>
                                <input type="number" min="1" max="4" required className="w-full p-3.5 bg-clay border border-rule rounded-lg text-ink font-sans text-sm font-medium outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all" value={bookingDetails.num_visitors} onChange={(e) => setBookingDetails({ ...bookingDetails, num_visitors: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[11px] font-label font-bold text-stone uppercase tracking-[0.12em] mb-2">Purpose</label>
                                <textarea required rows="3" className="w-full p-3.5 bg-clay border border-rule rounded-lg text-ink font-sans text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all" value={bookingDetails.purpose_of_visit} onChange={(e) => setBookingDetails({ ...bookingDetails, purpose_of_visit: e.target.value })} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setSelectedRoom(null)} className="flex-1 bg-clay border border-rule text-ink font-label text-[13px] font-bold py-3.5 rounded-lg hover:bg-rule transition-colors">Cancel</button>
                                <button type="submit" disabled={isBooking} className={`flex-1 text-white font-label text-[13px] font-bold py-3.5 rounded-lg transition-colors shadow-card ${isBooking ? 'bg-stone cursor-not-allowed' : selectedRoom?.status === 'occupied' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-forest hover:bg-forest/90'}`}>
                                    {isBooking ? 'Processing\u2026' : selectedRoom?.status === 'occupied' ? 'Join Waitlist' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}