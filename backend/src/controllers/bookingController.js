const pool = require('../config/db');

const createBooking = async (req, res) => {
    try {
        const { room_id, check_in, check_out, num_visitors, purpose_of_visit } = req.body;
        const user_id = req.user.id; 

        const overlapCheck = await pool.query(`
            SELECT id FROM bookings 
            WHERE room_id = $1 AND status = 'CONFIRMED'
            AND (check_in < $3 AND check_out > $2)
        `, [room_id, check_in, check_out]);

        const status = overlapCheck.rows.length > 0 ? 'WAITLISTED' : 'CONFIRMED';

        const newBooking = await pool.query(`
            INSERT INTO bookings (user_id, room_id, check_in, check_out, num_visitors, purpose_of_visit, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [user_id, room_id, check_in, check_out, num_visitors, purpose_of_visit, status]);

        res.status(201).json({
            message: status === 'CONFIRMED' ? 'Room booked successfully!' : 'Room full. Added to waitlist.',
            booking: newBooking.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error during booking' });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    
    try {
        const originalBooking = await pool.query(
            "SELECT room_id, check_in, check_out, status FROM bookings WHERE id = $1", 
            [id]
        );

        if (originalBooking.rows.length === 0) return res.status(404).json({message: "Booking not found"});
        
        // Prevent cancelling something that is already cancelled
        if (originalBooking.rows[0].status === 'CANCELLED') {
            return res.status(400).json({ message: "Booking is already cancelled." });
        }

        const { room_id, check_in, check_out } = originalBooking.rows[0];

        // SOFT DELETE: We update the status instead of erasing the row entirely
        await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = $1", [id]);

        // Auto-Promote Logic checks the queue for the newly opened slot
        const nextInLine = await pool.query(
            `SELECT * FROM waiting_list 
             WHERE room_id = $1 AND check_in < $3 AND check_out > $2 
             ORDER BY priority ASC LIMIT 1`,
            [room_id, check_in, check_out]
        );

        if (nextInLine.rows.length > 0) {
            const person = nextInLine.rows[0];
            
            await pool.query(
                "INSERT INTO bookings (user_id, room_id, check_in, check_out, status) VALUES ($1, $2, $3, $4, 'CONFIRMED')",
                [person.user_id, person.room_id, person.check_in, person.check_out]
            );

            await pool.query("DELETE FROM waiting_list WHERE id = $1", [person.id]);
        }

        res.json({ message: "Booking cancelled successfully." });
    } catch (err) {
        console.error("Cancel Error:", err.message); 
        res.status(500).json({ message: "Server error during cancellation" });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get all Confirmed and Cancelled bookings
        const bookingsRes = await pool.query(`
            SELECT b.id, b.room_id, b.check_in, b.check_out, b.status, r.room_number, r.room_type 
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = $1
        `, [userId]);

        // 2. Get all Waitlisted items and manually tag them with status 'WAITLISTED'
        // We add 'W-' to the ID so React doesn't get confused by duplicate keys
        const waitlistRes = await pool.query(`
            SELECT 'W-' || w.id AS id, w.room_id, w.check_in, w.check_out, 'WAITLISTED' AS status, r.room_number, r.room_type 
            FROM waiting_list w
            JOIN rooms r ON w.room_id = r.id
            WHERE w.user_id = $1
        `, [userId]);

        // 3. Combine both lists together
        const allBookings = [...bookingsRes.rows, ...waitlistRes.rows];
        
        // 4. Sort them so the newest trips show up at the top
        allBookings.sort((a, b) => new Date(b.check_in) - new Date(a.check_in));

        res.json(allBookings);
    } catch (err) {
        console.error("Get Bookings Error:", err.message); 
        res.status(500).json({ message: 'Server Error fetching bookings' });
    }
};

const joinWaitlist = async (req, res) => {
    const { room_id, check_in, check_out } = req.body;
    const user_id = req.user.id; // Assuming you have authentication middleware setting req.user

    try {
        await pool.query(
            "INSERT INTO waiting_list (user_id, room_id, check_in, check_out) VALUES ($1, $2, $3, $4)",
            [user_id, room_id, check_in, check_out]
        );
        res.json({ message: "You have been added to the waitlist! We will notify you if it opens up." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error while joining waitlist" });
    }
};

module.exports = { createBooking, cancelBooking, getUserBookings, joinWaitlist };