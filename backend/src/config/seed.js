const pool = require('./db');

const seedRooms = async () => {
    try {
        console.log('Clearing old rooms...');
        await pool.query('DELETE FROM rooms'); // Clears the table

        console.log('Inserting new rooms...');
        await pool.query(`
            INSERT INTO rooms (room_number, room_type, price_per_night, description, facilities, location, rating, thumbnail_url) 
            VALUES 
            ('101', 'Single', 1000.00, 'Nestled among the snow-capped pines of Manali, this timber-lined solitary retreat offers a warm atmosphere and breathtaking valley views.', 'WiFi, Fan, Attached Bath', 'Manali, Himachal Pradesh', 4.8, 'https://res.cloudinary.com/dq7wgaqdp/image/upload/v1774010249/dreygo_rooms/kfcrqhlciyonmx9rnfwg.jpg'),
            ('102', 'Double', 1500.00, 'Experience the vibrant pulse of Mumbai from this chic, contemporary room featuring floor-to-ceiling windows and a glittering city skyline view.', 'WiFi, AC, TV', 'Bandra West, Mumbai', 4.9, 'https://res.cloudinary.com/dq7wgaqdp/image/upload/v1774010452/dreygo_rooms/odsqpbvnf2hyfzjitjub.avif'),
            ('201', 'Deluxe', 2500.00, 'A sun-drenched coastal haven featuring bohemian decor, premium bedding, and a private balcony just a short stroll from the beach.', 'WiFi, AC, TV, Mini Fridge', 'Vagator, North Goa', 4.7, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop'),
            ('202', 'Suite', 4000.00, 'The ultimate urban luxury oasis. This expansive suite boasts sleek modern design, a massive living area, and a dedicated workspace.', 'WiFi, AC, TV, Mini Fridge, Sofa', 'Koramangala, Bengaluru', 4.6, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop'),
            ('301', 'Heritage Suite', 3500.00, 'Experience royalty in this beautifully restored heritage suite with traditional Rajasthani architecture and modern luxury.', 'WiFi, AC, King Bed, Pool Access', 'Jaipur, Rajasthan', 4.8, 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c53?q=80&w=1000&auto=format&fit=crop'),
            ('302', 'Treehouse', 4500.00, 'Disconnect from the world in this elevated eco-treehouse surrounded by lush tea gardens and misty mountains.', 'WiFi, Balcony, Valley View, Breakfast', 'Munnar, Kerala', 4.9, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1000&auto=format&fit=crop'),
            ('401', 'Studio', 1800.00, 'A minimalist, airy studio perfect for solo travelers or remote workers looking for peace near the Ganges.', 'WiFi, Kitchenette, AC, Work Desk', 'Rishikesh, Uttarakhand', 4.7, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop'),
            ('402', 'Ocean Villa', 5500.00, 'Wake up to the sound of crashing waves in this premium cliffside villa featuring private beach access.', 'WiFi, AC, Private Beach Access, Pool', 'Varkala, Kerala', 4.9, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000&auto=format&fit=crop'),
            ('501', 'Cozy Cabin', 2200.00, 'A warm wooden cabin with a fireplace, offering spectacular panoramic views of the Kanchenjunga range.', 'WiFi, Heater, Mountain View, Fireplace', 'Darjeeling, West Bengal', 4.6, 'https://images.unsplash.com/photo-1519974719765-e653d9539281?q=80&w=1000&auto=format&fit=crop'),
            ('502', 'Lakeview Double', 2800.00, 'Elegant double room featuring large windows that open up to a serene, uninterrupted view of Lake Pichola.', 'WiFi, AC, TV, Lake View', 'Udaipur, Rajasthan', 4.8, 'https://images.unsplash.com/photo-1533759413974-9e15f3b745ac?q=80&w=1000&auto=format&fit=crop'),
            ('601', 'Colonial Bungalow', 3200.00, 'Step back in time in this vintage British-era bungalow, complete with antique furniture and a private tea garden.', 'WiFi, Fireplace, Garden, Library', 'Ooty, Tamil Nadu', 4.7, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop'),
            ('602', 'Modern Penthouse', 6000.00, 'Ultra-luxury high-rise penthouse offering a 360-degree view of the city skyline, perfect for weekend getaways.', 'WiFi, AC, Jacuzzi, City Skyline, Smart Home', 'South Delhi, Delhi', 4.9, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop'),
            ('701', 'Desert Tent', 5000.00, 'Experience the magic of the Thar desert under a canopy of stars in this luxurious, fully-air-conditioned glamping tent.', 'WiFi, AC, Breakfast, Safari Access', 'Jaisalmer, Rajasthan', 4.9, 'https://images.unsplash.com/photo-1534889557022-261688ab8978?q=80&w=1000&auto=format&fit=crop'),
            ('702', 'Houseboat', 4200.00, 'Float peacefully on the pristine waters of Dal Lake in this intricately carved traditional Kashmiri houseboat.', 'WiFi, Heating, Chef, Lake View', 'Srinagar, Jammu & Kashmir', 4.8, 'https://images.unsplash.com/photo-1610015569426-804ec83ef282?q=80&w=1000&auto=format&fit=crop'),
            ('801', 'French Villa', 3800.00, 'A vibrant mustard-yellow heritage villa boasting high ceilings, vintage teak furniture, and a sunlit private courtyard.', 'WiFi, AC, Courtyard, Library', 'Pondicherry', 4.7, 'https://images.unsplash.com/photo-1560580434-df7f6920f09a?q=80&w=1000&auto=format&fit=crop'),
            ('802', 'Coffee Estate', 3000.00, 'Wake up to the aroma of freshly roasted beans in this secluded plantation cottage surrounded by dense tropical forests.', 'WiFi, AC, Plantation Tour, Breakfast', 'Coorg, Karnataka', 4.9, 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1000&auto=format&fit=crop')
        `);

        console.log('Database successfully seeded with rooms!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedRooms();