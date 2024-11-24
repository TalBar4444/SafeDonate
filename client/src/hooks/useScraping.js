import { useState } from "react";
import axios from "axios";

/**
 * Custom hook to fetch and manage association scraping data
 */
const useScraping = () => {
    const [negativeInfo, setNegativeInfo] = useState(null);
    const [loadingScraping, setLoadingScraping] = useState(false);
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
                setNegativeInfo(parsedData.analyzeResults);
                setLoadingScraping(false);
                return;
            }

            console.log("Fetching new scraping data...");
            const response = await axios.post(
                "http://localhost:5000/scrape/search",
                {
                    associationName,
                    associationNumber,
                    category,
                }
            );

            const { analyzeResults } = response.data;

            if (analyzeResults?.length > 0) {
            // Cache the results
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({analyzeResults}));
                    console.log("Analysis results found and cached:", analyzeResults);
                    setNegativeInfo(analyzeResults);
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