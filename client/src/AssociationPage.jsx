import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./AssociationPage.css";

const AssociationPage = () => {
  const { id } = useParams();
  const [association, setAssociation] = useState(null);
  const [approvals, setApprovals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [donationType, setDonationType] = useState("חד פעמי");
  const [donationAmount, setDonationAmount] = useState("");
  const [addDedication, setAddDedication] = useState(false);
  const [dedicationText, setDedicationText] = useState("");
  const [negativeInfo, setNegativeInfo] = useState([]);
  const [hasNegativeInfo, setHasNegativeInfo] = useState(false);

  useEffect(() => {
    const fetchAssociation = async () => {
      try {
        const token = Cookies.get("token");
        if (token) {
          const tokenResponse = await axios.post(
            "http://localhost:3000/users/getToken",
            { token }
          );
          if (tokenResponse.status === 200) {
            setUser(tokenResponse.data);
            const response = await fetch(
              `https://data.gov.il/api/3/action/datastore_search?resource_id=be5b7935-3922-45d4-9638-08871b17ec95&filters={"_id":"${id}"}`
            );
            if (!response.ok) {
              throw new Error(`Http error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            if (jsonData.result.records.length > 0) {
              const associationData = jsonData.result.records[0];
              setAssociation(associationData);
              const associationNumber = associationData["מספר עמותה"];
              await fetchApprovals(associationNumber);
            } else {
              setError("No association found");
            }
          }
        } else {
          console.log("No token found.");
        }
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    const fetchApprovals = async (associationNumber) => {
      try {
        const response2 = await fetch(
          `https://data.gov.il/api/3/action/datastore_search?resource_id=cb12ac14-7429-4268-bc03-460f48157858&q=${associationNumber}`
        );
        if (!response2.ok) {
          throw new Error(`Http error! status: ${response2.status}`);
        }
        const jsonData2 = await response2.json();
        const sortedData = jsonData2.result.records.sort((a, b) => {
          const yearA = parseInt(a["שנת האישור"], 10);
          const yearB = parseInt(b["שנת האישור"], 10);
          return yearB - yearA;
        });
        setApprovals(sortedData);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    const fetchNegativeInfo = async (associationNumber) => {
      try {
        const response3 = await axios.get(
          `http://localhost:3000/scrape/${associationNumber}`
        );
        setNegativeInfo(response3.data);
        setHasNegativeInfo(response3.data.length > 0); // Set flag based on scraping results
      } catch (error) {
        setError("Error fetching negative information");
        console.error(error);
      }
    };

    fetchAssociation();
  }, [id]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Donation submitted:",
      donationType,
      donationAmount,
      dedicationText
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="association-page">
      {association ? (
        <>
          {/* Right Section */}
          <div className="right-section">
            <div className="circle-image">
              {association["שם עמותה בעברית"]
                ? association["שם עמותה בעברית"].substring(0, 2)
                : "נפ"}
            </div>

            <div className="npo-name">
              {association["שם עמותה בעברית"] || "No name available"}
            </div>

            <div className="npo-place">
              {association["כתובת - ישוב"] || "No place available"}
            </div>

            <div className="npo-number">
              מספר עמותה: {association["מספר עמותה"] || "No number available"}
            </div>

            <button className="donate-button" onClick={handleOpenModal}>
              לתרומה
            </button>
          </div>

          {/* Separator Line */}
          <div className="separator"></div>

          {/* Left Section for Goals */}
          <div className="left-section">
            <h2>
              {approvals && approvals.length > 0 ? (
                <span style={{ color: "green" }}>העמותה מאושרת</span>
              ) : (
                <span style={{ color: "red" }}>העמותה אינה מאושרת</span>
              )}
            </h2>

            <h2 className="goals-headline">מטרות העמותה</h2>
            <p className="npo-goals">
              {association["מטרות עמותה"] || "No goals available"}
            </p>

            {/* Negative Info Section */}
            <div className="negative-info">
              <h3>
                {hasNegativeInfo ? (
                  <span style={{ color: "red" }}>
                    העמותה מצאה מעורבת בהליכים פליליים
                  </span>
                ) : (
                  <span style={{ color: "green" }}>
                    העמותה לא הייתה מעורבת בהליכים פליליים
                  </span>
                )}
              </h3>
              <p>
                <strong>Disclaimer:</strong> The information displayed is
                scraped from public sources and may not be entirely accurate or
                up-to-date.
              </p>
            </div>
          </div>

          {/* Donation Popup */}
          {showModal && (
            <div className="popup-overlay">
              <div className="popup-content">
                <button onClick={handleCloseModal} className="close-popup">
                  &times;
                </button>
                <div className="popup-title">
                  <span>תשלום מאובטח</span>
                  <span className="lock-icon">🔒</span>
                </div>

                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="חד פעמי"
                      checked={donationType === "חד פעמי"}
                      onChange={() => setDonationType("חד פעמי")}
                    />
                    תרומה חד פעמית
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="הוראת קבע"
                      checked={donationType === "הוראת קבע"}
                      onChange={() => setDonationType("הוראת קבע")}
                    />
                    הוראת קבע
                  </label>
                </div>

                <input
                  type="number"
                  className="donation-amount"
                  placeholder="סכום תרומה"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                />

                <div
                  className={`checkbox-group ${
                    addDedication ? "show-dedication" : ""
                  }`}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={addDedication}
                      onChange={() => setAddDedication(!addDedication)}
                    />
                    רוצה להוסיף הקדשה
                  </label>
                  {addDedication && (
                    <textarea
                      className="dedication-text"
                      placeholder="כתוב כאן את ההקדשה שלך"
                      value={dedicationText}
                      onChange={(e) => setDedicationText(e.target.value)}
                    />
                  )}
                </div>

                <button className="submit-donation" onClick={handleSubmit}>
                  תרמו עכשיו
                </button>
                {donationAmount && (
                  <p className="donation-summary">
                    סכום לתרומה: ₪{donationAmount}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Association data not available.</p>
      )}
    </div>
  );
};

export default AssociationPage;
