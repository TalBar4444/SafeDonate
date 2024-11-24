const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database using environment variable URI
 * Logs success or error message based on connection status
 */
const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.log("Error connecting to MongoDB", error.message);
	}
};

module.exports = connectToMongoDB;