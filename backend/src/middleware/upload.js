const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Authenticate with Cloudinary using your .env keys
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Multer to forward files to your Cloudinary 'dreygo_rooms' folder
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dreygo_rooms', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
        // This automatically optimizes massive photos before saving them!
        transformation: [{ width: 1000, height: 800, crop: 'limit' }] 
    }
});

const upload = multer({ storage: storage });
module.exports = upload;