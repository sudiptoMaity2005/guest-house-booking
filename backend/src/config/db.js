const { Pool } = require('pg');
require('dotenv').config();

// Check if we are running locally by looking at the URL
const isLocal = process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // If local, turn SSL off. If cloud, turn SSL on.
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("Connected to Database!"))
    .catch(err => console.error("Local Database connection failed:", err.message));

module.exports = pool;