import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import FavoriteButton from "../components/FavoriteButton.jsx";
import useAssociationData from "../hooks/useAssociationData.js";
import useContactInfo from "../hooks/useContactInfo.js";
import useApprovals from "../hooks/useApprovals.js";
import useScraping from "../hooks/useScraping.js";
import DonationPopup from "../components/DonationPopup.jsx";
import Loading from "../components/Loading.jsx";
import ContactCard from "../components/ContactCard.jsx";
import "../styles/AssociationPage.css";

import { removeTilde, replaceTildesAlgorithm } from "../utils/filterText.js";

const AssociationPage = () => {
  const { associationNumber } = useParams();
  const { authUser } = useAuthContext();
  const { loadingAssoc, association, error, fetchAssociation } = useAssociationData();
  const { loading, contactInfo } = useContactInfo(associationNumber);
  const { loadingApprovals, approvals, fetchApprovals } = useApprovals();
  const { loadingScraping, negativeInfo, scrapeError, fetchScrapedData } = useScraping();
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const toggleExplanation = () => setShowExplanation((prev) => !prev);
  const handleToggleExpand = () => setIsExpanded(!isExpanded);
  const handleMoreInfo = () =>
    window.open(`https://www.guidestar.org.il/organization/${associationNumber}`,"_blank");
  const handleDonateClick = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  // fetch association Data
  useEffect(() => {
    fetchAssociation({ associationNumber });
    fetchApprovals({ associationNumber });
  }, [associationNumber]);

  // Fetch scraping data when association data is available or when association number changes
  useEffect(() => {
    if (association) {
      const associationName = replaceTildesAlgorithm(association["שם עמותה בעברית"])
      const category = removeTilde(association["סיווג פעילות ענפי"]);
      fetchScrapedData({ associationName, associationNumber, category });
    }
  }, [association]); // Added associationNumber as dependency

  return (
    <div className="main-content">
      <div className="association-page">
        {!loadingAssoc ? (
          <>
            {/* Right Section */}
            <div className="right-section">
              <div className="circle-image">
                {association["שם עמותה בעברית"]? association["שם עמותה בעברית"].substring(0, 2): "נפ"}
              </div>

              <div className="npo-name">
                {replaceTildesAlgorithm(association["שם עמותה בעברית"]) || "שם עמותה לא זמין"}
              </div>

              <div className="npo-place">
                {association["כתובת - ישוב"] || "כתובת עמותה לא זמינה"}
              </div>

              <div className="npo-number">
                מספר עמותה: {association["מספר עמותה"] || "מספר עמותה לא זמין"}
              </div>

              <div className="npo-status">
                סטטוס עמותה: {association["סטטוס עמותה"] || "סטטוס לא זמין"}
              </div>

              <div>
                <button className="donate-button" onClick={() => setIsCardOpen(true)}>
                    יצירת קשר
                </button>
                
                {isCardOpen && (
                  <ContactCard 
                    isLoading={loading} 
                    contactInfo={Object.keys(contactInfo).length ? contactInfo : null}
                    onClose={() => setIsCardOpen(false)} 
                  />
                )}
              </div>

              <div>
                <button className="donate-button" onClick={handleDonateClick}>
                  לתיעוד התרומה
                </button>
                <DonationPopup
                  authUser={authUser}
                  association={association}
                  isOpen={isPopupOpen}
                  onClose={handleClosePopup}
                />
              </div>

              <FavoriteButton association={association} userId={authUser._id} />

              <button className="donate-button" onClick={handleMoreInfo}>
                מידע נוסף על העמותה
              </button>
            </div>

            {/* Separator Line */}
            <div className="separator"></div>

            {/* Left Section for Goals */}
            <div className="left-section">
              <h2 className="goals-headline">מטרות העמותה</h2>
              <p className="npo-goals">
                {replaceTildesAlgorithm(association["מטרות עמותה"]) ||
                  "העמותה טרם שיתפה את מטרותיה. נשמח לעדכן אותך ברגע שיתווסף מידע נוסף."}
              </p>

              <h2 className="negative-info-headline">מידע שנאסף על אמינות העמותה</h2>
              {/* Negative Info Section */}
              {loadingScraping ? (
                <div className="loading-message">
                  <p>מחפש מידע על העמותה...</p>
                </div>
              ) : scrapeError ? (
                <p className="error-message">
                  {scrapeError}
                </p>
              ) : negativeInfo === null ? (
                <p className="error-message">
                  לא הצלחנו לאסוף מידע על העמותה. אנא נסה שוב מאוחר יותר.
                </p>
              ) : negativeInfo.length === 0 ? (
                <p className="safe-to-donate-message">
                  לא נמצא כל מידע שלילי על העמותה.
                </p>
              ) : (
                <div className="negative-info-summary">
                  <div className="category-header" onClick={handleToggleExpand} style={{ cursor: "pointer" }}>
                    <p>נמצאו {negativeInfo.length} תוצאות הקשורות לעמותה
                      {isExpanded ? " ▼" : " ▲"}
                    </p>
                  </div>

                  {isExpanded && (
                    <table className="category-content">
                      <thead>
                        <tr>
                          <th>כותרת</th>
                          <th>קישור</th>
                        </tr>
                      </thead>
                      <tbody>
                        {negativeInfo.map((item, index) => (
                          <tr key={index}>
                            <td>{item.title}</td>
                            <td>
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                קישור
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <div className="approvals-section">
                <h2 className="approvals-headline">טבלת אישורים</h2>
                <span className="explanation-text-link" onClick={toggleExplanation}> למה צריך את זה?</span>
                {showExplanation && (
                  <p className="explanation-text">
                    טבלת האישורים מספקת מידע לגבי העמותה והאישורים שקיבלה.
                    עמותות מאושרות הן עמותות שקיבלו את האישורים הנדרשים על פי
                    החוק, מה שמגביר את אמינותן.
                  </p>
                )}

                {loadingApprovals ? (
                  <p>טוען נתוני אישורים...</p>
                ) : approvals && approvals.length > 0 ? (
                    <table className="approvals-table">
                      <thead>
                        <tr>
                          <th>שנת האישור</th>
                          <th>סטטוס אישור</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvals.map((record, index) => (
                          <tr key={index}>
                            <td>{record["שנת האישור"]}</td>
                            <td>{record["האם יש אישור"]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                ) : (
                  <p className="no-approvals-message">
                    העמותה מעולם לא נרשמה כעמותה תקינה על ידי רשם העמותות
                  </p>
                )}
              </div>
              
              {/* Disclaimer Section */}
              <div className="disclaimer-section bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8 mx-4">
                <p className="disclaimer-text text-gray-600 text-sm leading-relaxed text-right">
                  כל המידע המוצג בעמוד זה נאסף ממקורות ציבוריים זמינים ברשת.
                  למרות שאנו משתדלים להציג מידע מדויק ועדכני, אנו לא נושאים
                  באחריות לכל טעות או אי דיוק במידע המוצג. המידע המוצג הינו
                  לצורכי שקיפות בלבד ואין לראות בו כהמלצה חד משמעית לתרומה
                  לעמותה מסוימת.
                </p>
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default AssociationPage;