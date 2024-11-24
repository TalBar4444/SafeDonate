const express = require('express');
const donationController = require('../controllers/donationController')

const donationRouter = express.Router();

// Create a new donation record
donationRouter.post('/donate', donationController.createDonation);

// Get total amount of all donations across platform
donationRouter.get('/allDonationsAmount', donationController.getTotalDonationsAmount);

// Get complete data for all donations
donationRouter.get('/allDonationsData', donationController.getAllDonationsData);

// Get list of donations for a specific association
donationRouter.get('/list/:associationNumber', donationController.getDonationListForAssociation);

// Get total donation amount for a specific association
donationRouter.get('/amount/:associationNumber', donationController.getDonationAmountForAssociation);

// Get total donation amount for a specific user
donationRouter.get('/sum/:userId', donationController.getTotalDonationAmountOfUser);

// Get list of all donations made by a specific user
donationRouter.get('/:userId', donationController.getTotalDonationListOfUser);

// Get donations made by specific user to specific association
donationRouter.get('/:userId/association/:associationNumber', donationController.getDonationsByUserForAssociation);

// Delete all donation records (admin only)
donationRouter.delete('/deleteAllDonations', donationController.deleteAllDonations);

module.exports = donationRouter;