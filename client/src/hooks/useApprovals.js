import { useState } from "react";
import axios from "axios";

/**
 * Custom hook to fetch and manage association approval data from the government API
 */
const useApprovals = () => {
    const [approvals, setApprovals] = useState([]);
    const [loadingApprovals, setLoadingApprovals] = useState(true);
    
    const fetchApprovals = async ({ associationNumber }) => {
        try {
            const response = await axios.get(
                `https://data.gov.il/api/3/action/datastore_search?resource_id=cb12ac14-7429-4268-bc03-460f48157858&q=${associationNumber}`
            );
            const sortedData = response.data.result.records.sort((a, b) => {
                const yearA = parseInt(a["שנת האישור"], 10);
                const yearB = parseInt(b["שנת האישור"], 10);
                return yearB - yearA;
            });
            console.log("in fetchApprovals")
            setApprovals(sortedData);
        } catch (error) {
            setError(error);
            //setLoading(false);
        } finally {
            setLoadingApprovals(false);
        }
    };
    return { loadingApprovals, approvals, fetchApprovals };
};

export default useApprovals;