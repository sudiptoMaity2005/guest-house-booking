const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createBooking, cancelBooking, getUserBookings, joinWaitlist, checkAvailability } = require('../controllers/bookingController');

router.use(verifyToken); 

router.post('/check-availability', checkAvailability);
router.post('/waitlist', joinWaitlist);
router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);

// --- THE FIX: We add the DELETE route so React can find it ---
router.delete('/:id', cancelBooking); 
router.put('/:id/cancel', cancelBooking); 

module.exports = router;