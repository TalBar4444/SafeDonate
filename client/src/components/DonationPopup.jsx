import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/DonationPopup.css";

/**
 * Modal component for recording donations to associations
 */
const DonationPopup = ({ authUser, association, isOpen, onClose }) => {
  const [loadingDonation, setLoadingDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [error, setError] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDonationAmount("");
      setError("");
      setLoadingDonation(false);
    }
  }, [isOpen]);

  // Validate donation amount
  const handleInputErrors = (value) => {
    return !isNaN(value) && value > 0;
  };

  // Process donation submission
  const handleDonate = async () => {
    const success = handleInputErrors(donationAmount);
    if (!success) {
      setError("אנא הכנס סכום תרומה תקין");
      return;
    }
    setLoadingDonation(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/donations/donate",
        {
          userId: authUser,
          associationName: association["שם עמותה בעברית"],
          associationNumber: association["מספר עמותה"],
          amount: donationAmount,
        }
      );

      if (response.status === 200) {
        setDonationAmount("");
        handleSuccess();
      } else {
        handleFailure();
      }
    } catch (error) {
      console.error("Failed to record donation:", error);
      handleFailure();
    } finally {
      setLoadingDonation(false);
      onClose();
    }
  };

  const handleSuccess = () => {
    toast.success("התרומה תועדה בהצלחה!");
  };

  const handleFailure = () => {
    toast.error("תיעוד התרומה נכשל. אנא נסה שוב.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-md p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto font-sans" dir="rtl">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="סגור"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="mb-6">
          <h1 className="text-[#2B4F71] text-2xl font-bold mb-1">תיעוד תרומה</h1>
          <h2 className="text-gray-600 text-lg">פרטי התרומה</h2>
        </div>

        <div className="flex items-center mb-4 gap-3">
          <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">💰</div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">סכום התרומה</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45B5AA]"
              placeholder="הכנס סכום בש״ח"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mb-4 gap-3">
          <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">🏢</div>
          <div className="text-gray-700">
            <strong>שם העמותה:</strong> {association["שם עמותה בעברית"]}
          </div>
        </div>

        <div className="flex items-center mb-6 gap-3">
          <div className="w-9 h-9 bg-[#45B5AA] rounded-full flex items-center justify-center text-white">🔢</div>
          <div className="text-gray-700">
            <strong>מספר העמותה:</strong> {association["מספר עמותה"]}
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        )}

        <button
          className="w-full bg-[#2B4F71] text-white py-3 px-6 rounded-lg hover:bg-[#1a3c5e] transition-colors font-medium"
          onClick={handleDonate}
          disabled={loadingDonation}
        >
          {loadingDonation ? "מתעד תרומה..." : "תעד תרומה"}
        </button>
      </div>
    </div>
  );
};

export default DonationPopup;