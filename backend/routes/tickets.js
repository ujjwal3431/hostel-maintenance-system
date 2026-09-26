const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer (Stores the uploaded file in server memory temporarily)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST: Create a new ticket
// 'protect' ensures they are logged in, 'upload.single' grabs the image file
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { category, roomNumber, description } = req.body;
        let imageUrl = null;

        // If the student uploaded an image, send it to Cloudinary
        if (req.file) {
            // Convert file buffer to a Base64 string for Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            
            const cldRes = await cloudinary.uploader.upload(dataURI, { folder: 'hostel_tickets' });
            imageUrl = cldRes.secure_url; // The live link to the photo
        }

        // Save the ticket in MongoDB
        const newTicket = new Ticket({
            studentId: req.user.userId, // Pulled securely from the JWT by our middleware
            category,
            roomNumber,
            description,
            imageUrl
        });

        await newTicket.save();
        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });

    } catch (error) {
        console.error('Ticket creation error:', error);
        res.status(500).json({ message: 'Server error while creating ticket.' });
    }
});

// GET: Fetch tickets
router.get('/', protect, async (req, res) => {
    try {
        let tickets;
        // If the user is an admin, fetch ALL tickets. 
        if (req.user.role === 'admin') {
            // .populate() pulls the student's name and email from the User collection based on the studentId
            tickets = await Ticket.find().populate('studentId', 'name email').sort({ createdAt: -1 });
        } else {
            // If it's a student, fetch ONLY their tickets.
            tickets = await Ticket.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
        }
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets.' });
    }
});

// PUT: Update ticket status (Admin Only)
router.put('/:id', protect, async (req, res) => {
    try {
        // Security check: Only admins can move tickets across the Kanban board
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { status } = req.body; // Expecting 'Pending', 'Assigned', or 'Resolved'
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );

        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: 'Error updating ticket status.' });
    }
});

module.exports = router;