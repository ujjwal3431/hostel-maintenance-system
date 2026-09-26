const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Assuming you have a User model in your models folder
const User = require('../models/User'); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    // 1. Extract the token sent from the Vercel frontend
    const { token } = req.body; 

    // 2. Debugging trap to see exactly what Render thinks the Client ID is
    console.log("THE RENDER CLIENT ID IS:", process.env.GOOGLE_CLIENT_ID);

    // 3. Verify the token with Google
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    // 4. Extract user details from the verified Google payload
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // 5. Enforce University Domain Validation
    if (!email.endsWith('@gkv.ac.in')) {
        return res.status(403).json({ message: "Access denied. Please use a @gkv.ac.in email." });
    }

    // 6. Find existing user, or create a new student account
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
            name: name,
            email: email,
            role: 'student', // By default, new logins are students
            profilePicture: picture
        });
        await user.save();
    }

    // 7. Generate your backend's JWT token
    // (Ensure you have a JWT_SECRET environment variable set in Render!)
    const jwtToken = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET || 'fallback_secret_key_please_change', 
        { expiresIn: '7d' }
    );

    // 8. Send the data back to the frontend to log the user in
    res.status(200).json({ token: jwtToken, user });

  } catch (error) {
    // 9. Error Handler
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Authentication failed. Invalid token." });
  }
});

module.exports = router;