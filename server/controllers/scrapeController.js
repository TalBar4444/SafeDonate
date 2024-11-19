const { scrapeData } = require('../utils/scraperDataa.js');
const { filterScrapedResults, filterText } = require('../utils/filterResults.js');
const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
const { flaskAPIBaseUrl } = require("./../config");
const axios = require("axios");

const scrapeOnline = async (req, res) => {
    const { associationName, associationNumber, category } = req.body;
    const filterName = filterText(associationName);
    console.log("filterName:", filterName);
    console.log('Starting scraping process for association number:',associationName, associationNumber, category);
    try {
        const allResults = await scrapeData(filterName, category);
        console.log("allResults: ", allResults);
       
        const filteredResults = filterScrapedResults(allResults, associationName,filterName);

        const finalResults = {
            results: filteredResults,
            filterName,
            associationNumber
        }
       console.log("finalResults: ", finalResults);

        // Get filter from Flask server
        const analyzeResults = await generateAnalyzer({
            results: filteredResults,
            filterName,
            associationNumber
        });
        console.log('Analyze Results:', analyzeResults);
        
        //return res.status(200).json({ analyzeResults });
        return res.status(200).json({ 
            allResults: filteredResults,
            analyzeResults 
        });

    } catch (error) {
        console.error('Error scraping online data:', error.message);
        return res.status(500).json({ error: 'Failed to scrape data' });
    }
}

// Function to get analysis from Flask server
const generateAnalyzer = async (data) => {
    try {
        const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
        const response = await axios.post(flaskAPIUrl, data);
        
        // Extract analysis results from response
        const { analysis_results } = response.data;
        return {analysis_results};

    } catch (err) {
        console.error("Error processing data:", err);
        throw new Error("Failed to analyze content: " + err.message);
    }
};

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