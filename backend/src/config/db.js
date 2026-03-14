const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for cloud databases like Neon or Render
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Cloud Database connection failed:', err.stack);
    } else {
        console.log('Successfully connected to Cloud PostgreSQL!');
        release();
    }
});

module.exports = pool;