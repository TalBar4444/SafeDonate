import { useState } from "react";
import axios from "axios";


// Add this dummy data
const DUMMY_RESULTS = {
    analyzeResults: {
        analysis_results: [
            {
                title: "Sample Negative Info 1",
                snippet: "This is a dummy negative result for testing",
                link: "https://example.com/1"
            },
            {
                title: "Sample Negative Info 7",
                snippet: "Another dummy negative result",
                link: "https://example.com/3"
            }
        ]
    }
};

const useScraping = () => {
    const [negativeInfo, setNegativeInfo] = useState(null);
    const [loadingScraping, setLoadingScraping] = useState(true);
    const [error, setError] = useState(null);

    const fetchScrapedData = async ({ associationName, associationNumber, category }) => {
        setLoadingScraping(true);
        setError(null);
        
        try {
            // Check if data is in sessionStorage
            const cacheKey = `scrape_${associationNumber}`;
            const cachedScrapedData = sessionStorage.getItem(cacheKey);

            if (cachedScrapedData) {
                console.log("Using cached scraped data");
                const parsedData = JSON.parse(cachedScrapedData);
                setNegativeInfo(parsedData);
                setLoadingScraping(false);
                return;
            }

            // console.log("Fetching dummy scraping data...");
            
            // // Simulate API delay
            // await new Promise(resolve => setTimeout(resolve, 2000));

            console.log("Fetching new scraping data...");
            const response = await axios.post(
                "http://localhost:5000/scrape/search",
                {
                    associationName,
                    associationNumber,
                    category,
                }
            );

            const { allResults: filteredResults, analyzeResults } = response.data;
            
            // Use dummy data instead
            //const { analyzeResults } = DUMMY_RESULTS;
            
            if (analyzeResults?.analysis_results?.length > 0) {
            // Cache the results
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({analyzeResults}));
                    console.log("Analysis results found and cached:", analyzeResults.analysis_results);
                    setNegativeInfo(analyzeResults.analysis_results);
                } catch (storageError) {
                    console.warn("Failed to cache scraped data:", storageError.message);
                }
            } else {
                console.log("לא נמצאו תוצאות");
                setError("לא נמצאו תוצאות");
                setNegativeInfo([]);
            }

        } catch (error) {
            console.error("Failed to fetch or process scraped data:", error);
            setError(error.response?.data?.message || error.message || "Error fetching scraping information");
            setNegativeInfo([]);
        } finally {
            setLoadingScraping(false);
        }
    };

    return { loadingScraping, negativeInfo, error, fetchScrapedData };
};

export default useScraping;