const express = require('express');
const scrapeController = require('../controllers/scrapeController');

const scrapeRouter = express.Router();

// Get contact information for an association by scraping their website
scrapeRouter.post('/contact', scrapeController.getContactInfo);

// Search and scrape online sources for information about an association
scrapeRouter.post('/search', scrapeController.scrapeOnline);

module.exports = scrapeRouter;