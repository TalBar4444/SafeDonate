import { useState } from "react";
import axios from "axios";

/**
 * Custom hook to fetch and manage unique association categories from the government API
 */
const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                `https://data.gov.il/api/3/action/datastore_search?resource_id=be5b7935-3922-45d4-9638-08871b17ec95&limit=1000`
            );
            
            // Extract unique categories from the response
            const allCategories = response.data.result.records.map(record => record["סיווג פעילות ענפי"]);
            const uniqueCategories = [...new Set(allCategories)].filter(Boolean).sort();
            
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    return { loadingCategories, categories, fetchCategories };
};

export default useCategories;