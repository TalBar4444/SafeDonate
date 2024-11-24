const { scrapeData } = require('../utils/scraperData.js');
const { filterScrapedResults, filterText } = require('../utils/filterResults.js');
const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
const { flaskAPIBaseUrl } = require("./../config");
const axios = require("axios");

/**
 * Scrapes online data for an association and analyzes the results
 * Fetches data based on association name and number, filters it,
 * and sends it to Flask server for analysis
 */
const scrapeOnline = async (req, res) => {
    const { associationName, associationNumber, category } = req.body;
    const filterName = filterText(associationName);
    console.log('Starting scraping process for association number:', associationName, associationNumber, category);

    try {
        const allResults = await scrapeData(associationName, filterName, category);
        const filteredResults = filterScrapedResults(allResults);
        
        const analyzeResults = await generateAnalyzer({
            results: filteredResults,
            associationName,
            filterName,
            associationNumber
        });
        console.log('Analyze Results:', analyzeResults);
        return res.status(200).json(analyzeResults);

    } catch (error) {
        console.error('Error scraping online data:', error.message);
        return res.status(500).json({ error: 'Failed to scrape data' });
    }
}

/**
 * Sends scraped data to Flask server for analysis
 * Makes POST request to Flask endpoint and returns analyzed results
 */
const generateAnalyzer = async (data) => {
    try {
        const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
        const response = await axios.post(flaskAPIUrl, data);
        return response.data;

    } catch (err) {
        console.error("Error processing data:", err);
        throw new Error("Failed to analyze content: " + err.message);
    }
};

/**
 * Retrieves contact information for a specific association
 * Fetches address and other contact details using association number
 */
const getContactInfo = async (req, res) => {
    const { associationNumber } = req.body;
    try {
        const contactInfo = await fetchContactInfo(associationNumber);       
        if (!contactInfo) {
            return res.status(200).json({ 
                message: "No contact information available for this association",
                contactInfo: null 
            });
        }

        console.log('Contact Information:', contactInfo.address);
        return res.status(200).json({ contactInfo });

    } catch (error) {
        console.error('Error fetching contact info:', error);
        return res.status(500).json({ 
            error: 'Failed to retrieve contact information',
            details: error.message
        });
    }
}

module.exports = { getContactInfo, scrapeOnline };