import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ImageUpload() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch rooms to populate our dropdown menu
    useEffect(() => {
        API.get('/rooms').then(res => setRooms(res.data)).catch(console.error);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedRoom || !image) {
            return toast.error("Please select both a room and an image!");
        }

        // The Magic Trick: JSON can't send files, so we use FormData!
        const formData = new FormData();
        // The word 'image' here MUST match what you put in upload.single('image') on the backend
        formData.append('image', image); 

        setUploading(true);
        const loadingToast = toast.loading("Uploading to Cloudinary...");

        try {
            // Note: We MUST set the Content-Type to multipart/form-data for files
            await API.put(`/rooms/${selectedRoom}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            toast.success("Upload complete! Database updated.", { id: loadingToast });
            setImage(null);
            document.getElementById('fileInput').value = ""; // Clear the input
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Check the console.", { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Admin Image Upload</h2>
            </div>
            
            <form onSubmit={handleUpload} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Property</label>
                    <select 
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                        <option value="">-- Choose a Room --</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>
                                Room {room.room_number} - {room.location || room.room_type}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Image File</label>
                    <input 
                        id="fileInput"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 transition-colors cursor-pointer"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={uploading}
                    className={`mt-2 py-4 rounded-xl font-bold text-white transition-all shadow-md ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg transform hover:-translate-y-1'}`}
                >
                    {uploading ? 'Optimizing & Uploading to Cloud...' : 'Upload to Cloudinary'}
                </button>
            </form>
        </div>
    );
}