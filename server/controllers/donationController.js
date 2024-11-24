const Donation = require('../models/donationModel');

/**
 * Creates a new donation record in the database
 */
module.exports.createDonation = async function createDonation(req, res) {
    const { userId, associationName, associationNumber, amount } = req.body;

    try {
        if (!associationName || !associationNumber || !amount) {
            return res.status(400).json({ message: 'error with associationNumber or donation amount' });
        }

        // create new donation
        const newDonation = await Donation.create({
            userId,
            associationName: associationName,
            associationNumber: associationNumber.toString(),
            amount,
        });
        return res.status(200).json({ newDonation });

    } catch (error) {
        return res.status(500).json({ message: 'Error while creating donation:', error });
    }
}

/**
 * Retrieves all donations made by a specific user
 */
module.exports.getTotalDonationListOfUser = async function getTotalDonationListOfUser(req, res) {

    const userId = req.params.userId;
   
    try {
        const donations = await Donation.find({ userId });

        if(!donations || donations.length === 0){
            return res.status(200).send({ message: 'No donations found for this user', donations: [] });
        }
        return res.status(200).send(donations);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching donation list", error });
    }
}

/**
 * Calculates the total amount of donations made by a specific user
 */
module.exports.getTotalDonationAmountOfUser = async function getTotalDonationAmountOfUser(req, res) {
    const userId = req.params.userId;
 
    try {
        const donations = await Donation.find({ userId });

        const totalAmount = donations.reduce((total, donation) => {
            return total + parseFloat(donation.amount);
        }, 0);

        res.status(200).json({ totalDonations: totalAmount });
    } catch (error) {
        res.status(500).json({ message: "Error calculating total donations", error });
    }
}

/**
 * Retrieves all donations made to a specific association
 */
module.exports.getDonationListForAssociation = async function getDonationListForAssociation(req, res) {

    const associationNumber = req.params.associationNumber;

    try {
        const donations = await Donation.find({ association: associationNumber });

        if (!donations.length) {
            return res.status(404).send({ message: 'No donation list found for this specific association' });
        }
        return res.status(200).send(donations);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching donation list for association:', error });
    }
}

/**
 * Calculates the total amount of donations made to a specific association
 */
module.exports.getDonationAmountForAssociation = async function getDonationAmountForAssociation(req, res) {

    const { associationNumber } = req.params;
    
    try {
        const donations = await Donation.find({ association: associationNumber });

        if (!donations.length) {
            return res.status(404).send({ message: 'No donations amount found for this specific association' });
        }

        const totalAmount = donations.reduce((total, donation) => {
            return total + parseFloat(donation.amount);
        }, 0);

        res.status(200).json({ totalDonations: totalAmount });
   
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching amount of donations for association:', error });
    }
}

/**
 * Retrieves all donations made by a specific user to a specific association
 */
module.exports.getDonationsByUserForAssociation = async function getDonationsByUserForAssociation(req, res) {
    const { userId, associationNumber } = req.params;

    try {
        const donations = await Donation.find({ userId, association: associationNumber });

        if(!donations){
            return res.status(404).send({ message: 'No donations found for this user and association' });
        }
        return res.status(200).send(donations);
        
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching donations by user for association:', error });
    }
}

/**
 * Retrieves all donation records from the database
 */
module.exports.getAllDonationsData = async function getAllDonationsData(req, res) {
    try {
        const donations = await Donation.find();

        if (!donations || donations.length === 0) {
            return res.status(200).json({ message: "No donations found", associations: [] });
        }
        return res.status(200).json({ count: donations.length, data: donations });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching donation list", error });
    }
}

/**
 * Calculates the total amount of all donations in the database
 */
module.exports.getTotalDonationsAmount = async function getTotalDonationsAmount(req, res) {

    try {
        const donations = await Donation.find();
        if (!donations) {
            return res.status(200).json({ message: "No donations found"});
        }
        
        const totalAmount = donations.reduce((total, donation) => {
            return total + parseFloat(donation.amount);
        }, 0);

        return res.status(200).json({ totalAmount });

    } catch (error) {
        return res.status(500).json({ message: "Error calculating total donations sum", error });
    }
}

/**
 * Deletes all donation records from the database
 */
module.exports.deleteAllDonations = async function deleteAllDonations(req, res) {
    
    try {
        const result = await Donation.deleteMany({});
        return res.status(200).json({ message: 'All onations have been deleted', result});
    } catch(errot){
        return res.status(500).json({ message: 'Error deleting all donations', error});
    }
}
