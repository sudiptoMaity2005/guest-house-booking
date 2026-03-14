const pool = require('./db');

const seedRooms = async () => {
    try {
        console.log('Clearing old rooms...');
        await pool.query('DELETE FROM rooms'); // Clears the table

        console.log('Inserting new rooms...');
        await pool.query(`
            INSERT INTO rooms (room_number, room_type, price_per_night, description, facilities) 
            VALUES 
            ('101', 'Single', 1000.00, 'Cozy single room on the ground floor.', 'WiFi, Fan, Attached Bath'),
            ('102', 'Double', 1500.00, 'Standard double room with city view.', 'WiFi, AC, TV'),
            ('201', 'Deluxe', 2500.00, 'Spacious corner room with premium bedding.', 'WiFi, AC, TV, Mini Fridge'),
            ('202', 'Suite', 4000.00, 'Luxury suite with a separate sitting area.', 'WiFi, AC, TV, Mini Fridge, Sofa')
        `);

        console.log('Database successfully seeded with rooms!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedRooms();