const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/db');


const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const roomRoutes = require('./src/routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('Guest House API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});