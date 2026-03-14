const pool = require('../config/db');

const getRooms = async (req, res) => {
    try {
        const { check_in, check_out } = req.query;

        if (check_in && check_out) {
            const availableRooms = await pool.query(`
                SELECT * FROM rooms 
                WHERE id NOT IN (
                    SELECT room_id FROM bookings 
                    WHERE status = 'CONFIRMED'
                    AND (check_in < $2 AND check_out > $1)
                )
                ORDER BY price_per_night ASC
            `, [check_in, check_out]);
            
            return res.json(availableRooms.rows);
        } 
        
        const allRooms = await pool.query('SELECT * FROM rooms ORDER BY price_per_night ASC');
        res.json(allRooms.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching rooms' });
    }
};

module.exports = { getRooms };