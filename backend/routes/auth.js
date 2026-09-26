const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    // 1. FIRST: Extract the token from the frontend request
    const { token } = req.body; 

    // 2. SECOND: Console log to check the Render environment variable
    console.log("THE RENDER CLIENT ID IS:", process.env.GOOGLE_CLIENT_ID);

    // 3. THIRD: Verify the token (now it knows what 'token' is!)
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    // ... the rest of your code (finding/creating the user) stays the same ...
        const { sub, email, name } = payload; // 'sub' is the unique Google ID

        // 2. Domain Restriction (Core feature for your project)
        // Note: While building and testing, you might want to comment these 3 lines out
        // so you can test with your personal @gmail.com account.
        if (!email.endsWith('@gkv.ac.in')) {
            return res.status(403).json({ message: 'Access restricted to university students only.' });
        }

        // 3. Find or Create the User in MongoDB
        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({
                name: name,
                email: email,
                googleId: sub,
                role: 'student' // Default role
            });
            await user.save();
        }

        // 4. Generate a secure JSON Web Token (JWT) for the session
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Keeps the student logged in for 7 days
        );

        // 5. Send token and user data back to the frontend
        res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role } });
        
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
});

module.exports = router;