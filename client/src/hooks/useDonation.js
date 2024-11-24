import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

/**
 * Custom hook to handle donation functionality including validation and submission
 */
const useDonation = () => {
    const [loadingDonation, setLoadingDonation] = useState(false);
    const [donationType, setDonationType] = useState("חד פעמי");
    const [donationAmount, setDonationAmount] = useState("");
    const [addDedication, setAddDedication] = useState(false);
    const [dedicationText, setDedicationText] = useState("");
    const { authUser } = useAuthContext();

    const donation = async (association, donationAmount) => {
        const success = handleInputErrors(email, password);
        if (!success) return;

        setLoadingDonation(true);
        try {
            const response = await axios.post(   // Make the POST request
                "http://localhost:5000/donations/donate",
                {
                    userId: authUser, // Include the userId from the logged-in user
                    associationName: association["שם עמותה בעברית"],
                    associationNumber: association["מספר עמותה"], // Use association number as ID
                    amount: donationAmount, // Donation amount from input
                }
            );

            // Handle successful donation
            if (response.status === 200) {
                alert("Donation successful! Thank you for your contribution.");
                setShowModal(false); // Close the donation popup
                setDonationAmount(""); // Clear the donation amount field
                setDedicationText(""); // Clear the dedication text
                setAddDedication(false); // Reset the dedication checkbox
                handleCloseModal();
            } else {
                alert("There was an issue with your donation. Please try again.");
            }
        } catch (error) {
            console.error("Failed to make a donation:", error);
            alert("Failed to process the donation. Please try again later.");
        } finally {
            setLoadingDonation(false);
        }
    };

    return { loadingDonation, donation }
};

function handleInputErrors(donationAmount) {
    if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
        alert("Please enter a valid donation amount.");
        return false;
    }
    return true
}

export default useDonation;
