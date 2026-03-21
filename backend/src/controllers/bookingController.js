const pool = require('../config/db');
const nodemailer = require('nodemailer');

// 1. Setup the Email Transporter (Reusing your .env credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function so we don't write the same email code 5 times
const sendMail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent
        });
    } catch (err) {
        // We just log the error. We don't want to crash the booking process just because an email failed!
        console.error("Failed to send email to", to, ":", err.message);
    }
};

const createBooking = async (req, res) => {
    try {
        const { room_id, check_in, check_out, num_visitors, purpose_of_visit } = req.body;
        const user_id = req.user.id; 

        // GUARDRAIL 1: Time Machine Check
        if (new Date(check_out) <= new Date(check_in)) {
            return res.status(400).json({ message: "Invalid dates: Check-out must be after check-in." });
        }

        // GUARDRAIL 2: Overlap Check
        const overlapCheck = await pool.query(`
            SELECT id FROM bookings 
            WHERE room_id = $1 AND status = 'CONFIRMED'
            AND (check_in::DATE, check_out::DATE) OVERLAPS ($2::DATE, $3::DATE)
        `, [room_id, check_in, check_out]);

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ message: "Room is already booked for these dates. Please use the Waitlist." });
        }

        // Safe to insert confirmed booking
        const newBooking = await pool.query(`
            INSERT INTO bookings (user_id, room_id, check_in, check_out, num_visitors, purpose_of_visit, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED') RETURNING *
        `, [user_id, room_id, check_in, check_out, num_visitors, purpose_of_visit]);

        // Fetch user details for the email
        const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [user_id]);
        const user = userRes.rows[0];

        // Fetch room details for the email
        const roomRes = await pool.query("SELECT room_number FROM rooms WHERE id = $1", [room_id]);
        const room_number = roomRes.rows[0].room_number;

        // SEND CONFIRMATION EMAIL
        await sendMail(
            user.email,
            "Booking Confirmed! - GuestHouseBooker",
            `<h2>Hello ${user.name},</h2>
             <p>Your booking for <b>Room ${room_number}</b> has been confirmed!</p>
             <p><b>Check-in:</b> ${check_in}<br/><b>Check-out:</b> ${check_out}</p>
             <p>Safe travels!</p>`
        );

        res.status(201).json({
            message: 'Room booked successfully!',
            booking: newBooking.rows[0]
        });
    } catch (err) {
        console.error("Booking Error:", err.message); 
        res.status(500).json({ message: 'Server Error during booking' });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    
    try {
        // 1. FIRST, check if it's a Confirmed booking in the main table
        const originalBooking = await pool.query(
            "SELECT room_id, check_in, check_out, status FROM bookings WHERE id = $1", 
            [id]
        );

        if (originalBooking.rows.length > 0) {
            if (originalBooking.rows[0].status === 'CANCELLED') {
                return res.status(400).json({ message: "Booking is already cancelled." });
            }

            const { room_id, check_in, check_out } = originalBooking.rows[0];

            // SOFT DELETE: Free up the slot by changing status to CANCELLED
            await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = $1", [id]);

            // Get info for the emails
            const cancellingUser = await pool.query("SELECT name, email FROM users WHERE id = $1", [user_id]);
            const roomInfo = await pool.query("SELECT room_number FROM rooms WHERE id = $1", [room_id]);

            // SEND CANCELLATION EMAIL
            await sendMail(
                cancellingUser.rows[0].email,
                "Booking Cancelled - GuestHouseBooker",
                `<p>Hi ${cancellingUser.rows[0].name},</p>
                 <p>Your booking for Room ${roomInfo.rows[0].room_number} (${check_in} to ${check_out}) has been cancelled successfully.</p>`
            );

            // THE MASTER FIX: Strict Auto-Promote Logic
            const nextInLine = await pool.query(
                `SELECT * FROM waiting_list w
                 WHERE w.room_id = $1 
                 AND NOT EXISTS (
                     SELECT 1 FROM bookings b 
                     WHERE b.room_id = w.room_id 
                     AND b.status = 'CONFIRMED'
                     /* Postgres native calendar math: strips timezones and calculates strict overlaps */
                     AND (b.check_in::DATE, b.check_out::DATE) OVERLAPS (w.check_in::DATE, w.check_out::DATE)
                 )
                 ORDER BY w.id ASC LIMIT 1`,
                [room_id]
            );

            // Promote if a valid candidate is found
            if (nextInLine.rows.length > 0) {
                const person = nextInLine.rows[0];
                
                await pool.query(
                    `INSERT INTO bookings 
                    (user_id, room_id, check_in, check_out, num_visitors, purpose_of_visit, status) 
                    VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED')`,
                    [person.user_id, person.room_id, person.check_in, person.check_out, person.num_visitors || 1, person.purpose_of_visit || 'Auto-Promote']
                );

                await pool.query("DELETE FROM waiting_list WHERE id = $1", [person.id]);

                const luckyUser = await pool.query("SELECT name, email FROM users WHERE id = $1", [person.user_id]);
                await sendMail(luckyUser.rows[0].email, "Great News! You're off the waitlist! 🎉", `<p>A spot opened up! You have been promoted for Room ${roomInfo.rows[0].room_number}.</p>`);
            }

            return res.json({ message: "Booking cancelled successfully." });
        }

        // 2. IF NOT IN BOOKINGS, check if it's a Waitlist request
        const waitlistBooking = await pool.query(
            "SELECT id FROM waiting_list WHERE id = $1", 
            [id]
        );

        if (waitlistBooking.rows.length > 0) {
            // HARD DELETE: Remove them from the waiting list entirely
            await pool.query("DELETE FROM waiting_list WHERE id = $1", [id]);
            return res.json({ message: "Removed from waitlist successfully." });
        }

        // 3. IF NEITHER, it actually doesn't exist
        return res.status(404).json({message: "Booking not found"});

    } catch (err) {
        console.error("Cancel Error:", err.message); 
        res.status(500).json({ message: "Server error during cancellation" });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Confirmed/Cancelled bookings from the main table
        const bookingsRes = await pool.query(`
            SELECT 
                b.id, b.room_id, b.status, b.num_visitors, b.purpose_of_visit,
                TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in, 
                TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out, 
                r.room_number, r.room_type, r.location, r.price_per_night, r.thumbnail_url 
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = $1
        `, [userId]);

        // 2. Fetch Waitlisted entries from your waiting_list table
        // FIXED: Added the 'w' alias and joined properly to avoid the FROM-clause error
        const waitlistRes = await pool.query(`
            SELECT 
                w.id, w.room_id, 'WAITLISTED' as status, 
                TO_CHAR(w.check_in, 'YYYY-MM-DD') as check_in, 
                TO_CHAR(w.check_out, 'YYYY-MM-DD') as check_out, 
                r.room_number, r.room_type, r.location, r.price_per_night, r.thumbnail_url 
            FROM waiting_list w
            JOIN rooms r ON w.room_id = r.id
            WHERE w.user_id = $1
        `, [userId]);

        // 3. Combine them exactly as you had it, preserving your brick-by-brick logic
        const allBookings = [...bookingsRes.rows, ...waitlistRes.rows];
        
        // Sort by check-in date so the UI numbering stays consistent
        allBookings.sort((a, b) => new Date(a.check_in) - new Date(b.check_in));

        res.json(allBookings);
    } catch (err) {
        console.error("Get Bookings Error:", err.message); 
        res.status(500).json({ message: 'Server Error fetching bookings' });
    }
};

const joinWaitlist = async (req, res) => {
    const { room_id, check_in, check_out } = req.body;
    const user_id = req.user.id; 

    try {
        await pool.query(
            "INSERT INTO waiting_list (user_id, room_id, check_in, check_out) VALUES ($1, $2, $3, $4)",
            [user_id, room_id, check_in, check_out]
        );

        // Fetch details for the email
        const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [user_id]);
        const roomRes = await pool.query("SELECT room_number FROM rooms WHERE id = $1", [room_id]);

        // SEND WAITLIST EMAIL
        await sendMail(
            userRes.rows[0].email,
            "You are on the Waitlist - GuestHouseBooker",
            `<p>Hi ${userRes.rows[0].name},</p>
             <p>You have been added to the waitlist for Room ${roomRes.rows[0].room_number} from ${check_in} to ${check_out}.</p>
             <p>If someone cancels, our system will automatically book the room for you and send you an email notification!</p>`
        );

        res.json({ message: "You have been added to the waitlist! We will notify you if it opens up." });
    } catch (err) {
        console.error("Waitlist Error:", err.message); 
        res.status(500).json({ message: "Server error while joining waitlist" });
    }
};

const checkAvailability = async (req, res) => {
    try {
        const { room_id, check_in, check_out } = req.body;
        
        // If dates aren't fully selected yet, just assume available to keep UI clean
        if (!check_in || !check_out) return res.json({ available: true });

        // Check if there are any confirmed bookings that overlap with these dates
        const overlapCheck = await pool.query(`
            SELECT id FROM bookings 
            WHERE room_id = $1 AND status = 'CONFIRMED'
            AND (check_in::DATE, check_out::DATE) OVERLAPS ($2::DATE, $3::DATE)
        `, [room_id, check_in, check_out]);

        // If rows > 0, there is a clash (available = false)
        res.json({ available: overlapCheck.rows.length === 0 });

    } catch (err) {
        console.error("Availability Check Error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createBooking, cancelBooking, getUserBookings, joinWaitlist, checkAvailability };