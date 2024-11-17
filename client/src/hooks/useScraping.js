import { useState } from "react";
import axios from "axios";

const useScraping = () => {
    const [loadingScraping, setLoadingScraping] = useState(true);
    const [negativeInfo, setNegativeInfo] = useState([]);
    const [error, setError] = useState(null)

    const fetchScrapedData = async ({associationName, associationNumber, category }) => {
        try {
            // Check if data is in sessionStorage
            const cacheKey = `scrape_${associationNumber}`;
            const cachedScrapedData = sessionStorage.getItem(cacheKey);

            if (cachedScrapedData) {
                console.log("doing caching of scraped Data");
                setNegativeInfo(JSON.parse(cachedScrapedData));
                setLoadingScraping(false);
            } else {
                console.log("Fetching new scraping data...");   // Fetch data from the API if not cached
              
                const response = await axios.post(
                    "http://localhost:5000/scrape/search",
                    {
                        associationName,
                        associationNumber,
                        category,
                    }
                );
                const scrapedData = response.data.results;
                if (scrapedData.length > 0) {
                    console.log(scrapedData);
                    // Store the scraped data in sessionStorage
                    sessionStorage.setItem(cacheKey, JSON.stringify(scrapedData));
                    setNegativeInfo(scrapedData); // Save negative info
                } else {
                    console.log("No scraped data found");
                }
            }
        } catch (error) {
            console.error("Failed to fetch or process scraped data:", error.message);
            setError("Error fetching scraping information");
        } finally {
            setLoadingScraping(false); // Ensure loadingScraping is false in all cases
        }
    };

    return { loadingScraping, negativeInfo, fetchScrapedData };
}

export default useScraping;