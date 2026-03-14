const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createBooking, cancelBooking, getUserBookings } = require('../controllers/bookingController');

router.use(verifyToken); 

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;