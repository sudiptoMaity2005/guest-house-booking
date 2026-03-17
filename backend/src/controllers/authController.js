const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Temporary memory store to hold users while they verify OTP
// In a massive production app, we'd use Redis, but this is perfect for a BTech project!
const otpStore = new Map(); 

// 1. Configure the Email Sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Step One of Registration: Send OTP
const registerAndSendOTP = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists in the database
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save user details and OTP in temporary memory for 5 minutes
        otpStore.set(email, { name, email, password, otp, expiresAt: Date.now() + 300000 });

        // Send the email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Guest House Booking - Verify Your Email',
            html: `<h2>Welcome to GuestHouseBooker, ${name}!</h2>
                   <p>Your email verification code is: <b style="font-size: 24px; color: blue;">${otp}</b></p>
                   <p>This code will expire in 5 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP sent to your email. Please verify." });

    } catch (err) {
        console.error("OTP Error:", err.message);
        res.status(500).json({ message: "Server error while sending OTP" });
    }
};

// 3. Step Two of Registration: Verify OTP and Save to Database
const verifyOTPAndRegister = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ message: "OTP expired or invalid email. Please register again." });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Incorrect OTP." });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired." });
        }

        // OTP is correct! Hash the password and save to Neon database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(storedData.password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [storedData.name, storedData.email, hashedPassword]
        );

        // Clean up the memory store
        otpStore.delete(email);

        res.status(201).json({ message: "Registration successful! You can now log in." });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.rows[0].id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { registerAndSendOTP, verifyOTPAndRegister, login };