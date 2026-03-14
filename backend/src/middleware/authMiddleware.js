const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = verified.user; 
        next(); 
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;