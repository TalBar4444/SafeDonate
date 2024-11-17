const { scrapeData } = require('../utils/scraperDataa.js');
//const { processScrapedResults } = require('../utils/filterResults.js');
const { filterResults } = require('../utils/filterScrapedResults.js');
const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
const { flaskAPIBaseUrl } = require("./../config");
const axios = require("axios");

const scrapeOnline = async (req, res) => {
    const { associationName, associationNumber, category } = req.body;
    const filterName = associationName.replace(/\(ע~ר\)/g, '').trim();
    console.log("filterName: ", filterName);
    console.log('Starting scraping process for association number:',associationName, associationNumber, category);
    try {
        const allResults = await scrapeData(filterName, category);
       
        const filteredResults = filterResults(allResults, filterName);

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
        return res.status(200).json({ allResults });

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
        return response.data;
    } catch (err) {
        console.error("Error processing data:", err);
        throw err;
    }
};

const getContactInfo = async (req, res) => {
    const { associationNumber } = req.body;
    try {
        const contactInfo = await fetchContactInfo(associationNumber);
        console.log('Contact Information:', contactInfo.address);
        return res.status(200).json({ contactInfo });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve contact information' });
    }
}

module.exports = { getContactInfo, scrapeOnline };

//const HebrewSearchScraper = require('../utils/mainScraper');
// const scraper = require('../utils/scraperDataa.js');
// const { processScrapedResults } = require('../utils/filterResults.js');
// const { fetchContactInfo } = require('../utils/scrapeContactInfo.js');
// const { flaskAPIBaseUrl } = require("./../config");
// const axios = require("axios");

// const scrapeOnline = async (req, res) => {
//     const { associationName, associationNumber, category } = req.body;
//     //const scrapedResults = [];
//     const filteredResults = []

//     console.log('Starting scraping process for association number:',associationName, associationNumber, category);
//     try {
//         await scraper.scrapeData(associationName, associationNumber, category, (keyword, scrapedResults) => {
//             const filtered = processScrapedResults(keyword, associationName, associationNumber, scrapedResults);
            
//             console.log(`Filtered results for keyword "${keyword}":`, filtered);
//             filteredResults.push(filtered);
//         });
//         console.log('Final filtered results:', filteredResults);
//         //return res.status(200).json({ results: filteredResults });

//         // Get filter from Flask server
//         // const analyzeResults = await generateAnalyzer({
//         //     results: filteredResults,
//         //     associationNumber,
//         // });
//         // console.log('Analyze Results:', analyzeResults);
//         //return res.status(200).json({ analyzeResults });
//         return res.status(200).json({ filteredResults });

//     } catch (error) {
//         console.error('Error scraping online data:', error.message);
//         return res.status(500).json({ error: 'Failed to scrape data' });
//     }
// }

// // Helper function to deduplicate results and remove invalid entries
// // const processResults = (results) => {
// //     const seenLinks = new Set();
// //     return results.filter(result => {
// //         // Skip if no title or title is "No title found"
// //         if (!result.title || result.title === "No title found") {
// //             return false;
// //         }
// //         // Skip if we've seen this link before
// //         if (seenLinks.has(result.link)) {
// //             return false;
// //         }
// //         seenLinks.add(result.link);
// //         return true;
// //     });
// // };



// // const scrapeOnline = async (req, res) => {
// //     const { associationName, associationNumber, category } = req.body;
// //     //const scrapedResults = [];
// //     //let analysisData;

// //     console.log('Starting scraping process for association number:',associationName, associationNumber, category);
// //     const scraper = new HebrewSearchScraper();
    
// //     try {
// //         await scraper.init();
// //         const analysisData = await scraper.scrapeData(associationName, associationNumber, category);
// //         console.log('Analysis Results:', analysisData);
        
// //         //const analyzeResults = await generateAnalyzer(analysisData);
// //         const analyzeResults = { message: "Analyzed data here" }; // Placeholder for actual analysis

// //         return res.status(200).json({ 
// //             //scrapedResults: analysisData,
// //             analysis: analyzeResults
// //         });
// //         //const results = await scraper.scrapeData(associationName, associationNumber, category, (validResults) => {
// //         //     // Process each batch of results
// //         //     scrapedResults.push(...validResults);
// //         // });


// //         // Process results to remove duplicates and invalid entries
// //         //const processedResults = processResults(scrapedResults);

// //         // Prepare data for Flask analysis
// //         // const analysisData = {
// //         //     results: scrapedResults.map(result => ({
// //         //         title: result.title,
// //         //         link: result.link,
// //         //         content: result.content,
// //         //         keyword: result.keyword,
// //         //     })),
// //         //     associationName,
// //         //     associationNumber,
// //         // };

// //         // Get analysis from Flask server
// //         // const analyzeResults = await generateAnalyzer(analysisData);
// //         // console.log('Analysis Results:', analysisData);

// //         // console.log('after models:', analyzeResults)

// //         // return res.status(200).json({ 
// //         //     //scrapedResults: processedResults,
// //         //     //analysis: analyzeResults
// //         // });

// //     } catch (error) {
// //         console.error('Scraping process failed:', error.message);
// //         return res.status(500).json({ error: 'Scraping process failed' });
// //     } finally {
// //         await scraper.close();
// //     }
// // }



// // Function to get analysis from Flask server
// const generateAnalyzer = async (data) => {
//     try {
//         const flaskAPIUrl = `${flaskAPIBaseUrl}/analyze`;
//         const response = await axios.post(flaskAPIUrl, data);
//         return response.data;
//     } catch (err) {
//         console.error("Error processing data:", err);
//         throw err;
//     }
// };

// const getContactInfo = async (req, res) => {
//     const { associationNumber } = req.body;
//     try {
//         const contactInfo = await fetchContactInfo(associationNumber);
//         console.log('Contact Information:', contactInfo.address);
//         return res.status(200).json({ contactInfo });

//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to retrieve contact information' });
//     }
// }

// module.exports = { getContactInfo, scrapeOnline };