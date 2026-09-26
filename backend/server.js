const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');

// Use Routes
app.use('/api/auth', authRoutes); // All auth requests go to http://localhost:5000/api/auth/...
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
    res.send('Hostel Maintenance API is running...');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});