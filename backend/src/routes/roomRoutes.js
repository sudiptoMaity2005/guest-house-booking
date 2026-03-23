const express = require('express');
const router = express.Router();

// 1. Import your Multer middleware (adjust the path if yours is named differently)
// This is required to parse the incoming image file from the frontend
const upload = require('../middleware/upload'); // Or wherever your multer config is

// 2. Import your controllers
// Add your specific image upload controller function here (e.g., uploadRoomImage)
const { getRooms, getRoomById, uploadRoomImage } = require('../controllers/roomController'); 

// --- PUBLIC ROUTES ---
router.get('/', getRooms); 
router.get('/:id', getRoomById);

// --- ADMIN / UPLOAD ROUTES ---
// The frontend is sending a PUT request to /api/rooms/:id/image
// upload.single('image') tells Multer to look for the file attached to the 'image' key
router.put('/:id/image', upload.single('image'), uploadRoomImage);

module.exports = router;