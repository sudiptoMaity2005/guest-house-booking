const express = require('express');
const router = express.Router();
const { registerAndSendOTP, verifyOTPAndRegister, login } = require('../controllers/authController');

router.post('/register', registerAndSendOTP);
router.post('/verify-otp', verifyOTPAndRegister);
router.post('/login', login);

module.exports = router;