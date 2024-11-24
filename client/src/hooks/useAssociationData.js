import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch and manage association details with caching support
 */
const useAssociationData = () => {
    const [association, setAssociation] = useState(null);
    const [loadingAssoc, setLoadingAssociation] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssociation = async ({ associationNumber }) => {
        setLoadingAssociation(true);
        setError(null);

        try {
            const cacheKey = `assoc_${associationNumber}`;
            const cachedData = sessionStorage.getItem(cacheKey);

            if (cachedData) {
                console.log("Using cached data");
                setAssociation(JSON.parse(cachedData));
                setLoadingAssociation(false);
            } else {
                console.log("Fetching from API");
                const filterQuery = JSON.stringify({ "מספר עמותה": associationNumber });
                const response = await axios.get(
                    `https://data.gov.il/api/3/action/datastore_search`,
                    {
                        params: {
                            resource_id: 'be5b7935-3922-45d4-9638-08871b17ec95',
                            filters: filterQuery,
                            limit: 1 
                        }
                    }
                );

                if (response.data.success && response.data.result.records.length > 0) {
                    const associationData = response.data.result.records[0];
                    sessionStorage.setItem(cacheKey, JSON.stringify(associationData));
                    setAssociation(associationData);
                } else {
                    setError("לא נמצאה עמותה");
                }

            }
        } catch (err) {
            setError(err.message || "אירעה שגיאה בחיפוש העמותה");
        } finally {
            setLoadingAssociation(false);
        }

    };

    return { loadingAssoc, association, error, fetchAssociation };
};

export default useAssociationData;