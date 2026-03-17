const pool = require('../config/db');

const getRooms = async (req, res) => {
    const { check_in, check_out } = req.query;

    try {
        if (!check_in || !check_out) {
            // Default view: just show all rooms when no dates are picked
            const allRooms = await pool.query("SELECT * FROM rooms ORDER BY room_number ASC");
            return res.json(allRooms.rows);
        }

        // The Smart Query: Returns ALL rooms, but flags them as 'occupied' or 'available'
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

module.exports = { getRooms };