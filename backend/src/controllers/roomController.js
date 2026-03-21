const pool = require('../config/db');

const getRooms = async (req, res) => {
    const { check_in, check_out } = req.query;

    try {
        if (!check_in || !check_out) {
            const allRooms = await pool.query("SELECT * FROM rooms ORDER BY room_number ASC");
            return res.json(allRooms.rows);
        }

        const query = `
            SELECT r.*,
            CASE WHEN EXISTS (
                SELECT 1 FROM bookings b
                WHERE b.room_id = r.id
                AND b.check_in < $2 AND b.check_out > $1
                AND b.status = 'CONFIRMED'
            ) THEN 'occupied' ELSE 'available' END AS status
            FROM rooms r
            ORDER BY r.room_number ASC;
        `;
        
        const result = await pool.query(query, [check_in, check_out]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

// --- THE NEW FUNCTION ---
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching room details:", err);
        res.status(500).json({ error: "Failed to fetch room details" });
    }
};

const uploadRoomImage = async (req, res) => {
    try {
        const roomId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided." });
        }
        
        const imageUrl = req.file.path; 

        const updateQuery = `
            UPDATE rooms 
            SET thumbnail_url = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        
        const result = await pool.query(updateQuery, [imageUrl, roomId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." });
        }

        res.json({ 
            message: "Image successfully uploaded to Cloudinary and saved to database!", 
            room: result.rows[0] 
        });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Server error during image upload" });
    }
};

// Make sure it is exported here!
module.exports = { getRooms, getRoomById, uploadRoomImage };