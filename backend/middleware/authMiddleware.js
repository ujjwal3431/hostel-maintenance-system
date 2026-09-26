const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // 1. Get the token from the request headers
    const token = req.header('Authorization')?.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user's ID and role to the request object so the next route can use it
        req.user = decoded; 
        next(); // Move on to the actual route
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { protect };