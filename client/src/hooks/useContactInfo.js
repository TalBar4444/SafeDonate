import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const useContactInfo = (associationNumber) => {
	const [loading, setLoading] = useState(true);
	const [contactInfo, setContactInfo] = useState({});

	useEffect(() => {
		if (!associationNumber) return; // No association number, skip fetching

		const fetchContactInfo = async () => {
			setLoading(true);
			try {
				// Check localStorage first
				const cacheKey = `contact_${associationNumber}`;
				const cachedData = localStorage.getItem(cacheKey);

				if (cachedData) {
					setContactInfo(JSON.parse(cachedData));
					setLoading(false);
					return;
				}

				const response = await axios.post(
					"http://localhost:5000/scrape/contact",
					{ associationNumber }
				);

				if (response.data.error) {
					throw new Error(response.data.error);
				}

				const newContactInfo = response.data.contactInfo || {};
				// Cache the results
				localStorage.setItem(cacheKey, JSON.stringify(newContactInfo));
				setContactInfo(newContactInfo);
			} catch (error) {
				toast.error(error.message);
				setContactInfo({}); // Reset contact info on error
			} finally {
				setLoading(false);
			}
		};
		
		fetchContactInfo();
	}, [associationNumber]);
	return { loading, contactInfo };
};

export default useContactInfo;