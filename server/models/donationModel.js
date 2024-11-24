const mongoose = require('mongoose');

/**
 * Schema for donation records in MongoDB
 * Stores information about donations made by users to associations
 * Includes user ID reference, association details, and donation amount
 * Automatically adds timestamps for created/updated dates
 */
const donationSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        associationName: {
            type: String,
            required: true,
        },
        associationNumber: {
            type: Number,
            required: true,
        },
        amount: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Donation', donationSchema);