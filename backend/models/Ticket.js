const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this ticket to the student who created it
        required: true
    },
    category: {
        type: String,
        enum: ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Other'],
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: null // Image is optional but recommended
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Resolved'],
        default: 'Pending'
    },
    adminNotes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);