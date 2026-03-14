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
    const client = await pool.connect(); 
    try {
        await client.query('BEGIN');

        const bookingId = req.params.id;
        const user_id = req.user.id;

        const booking = await client.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [bookingId, user_id]);
        if (booking.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Booking not found or not yours' });
        }

        const { room_id, check_in, check_out, status } = booking.rows[0];

        await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['CANCELLED', bookingId]);

        let promotedUserMessage = '';

        if (status === 'CONFIRMED') {
            const nextInQueue = await client.query(`
                SELECT id FROM bookings
                WHERE room_id = $1 AND status = 'WAITLISTED'
                AND check_in >= $2 AND check_out <= $3
                ORDER BY created_at ASC LIMIT 1
            `, [room_id, check_in, check_out]);

            if (nextInQueue.rows.length > 0) {
                await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['CONFIRMED', nextInQueue.rows[0].id]);
                promotedUserMessage = ' The next eligible user in the queue was automatically confirmed.';
            }
        }

        await client.query('COMMIT'); 
        res.json({ message: 'Booking cancelled successfully.' + promotedUserMessage });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: 'Server Error during cancellation' });
    } finally {
        client.release();
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await pool.query(`
            SELECT b.*, r.room_number, r.room_type 
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = $1
            ORDER BY b.check_in DESC
        `, [req.user.id]);

        res.json(bookings.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching bookings' });
    }
};

module.exports = { createBooking, cancelBooking, getUserBookings };