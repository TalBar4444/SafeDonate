import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import AssociationCarousel from "../components/AssociationCarousel";
import Loading from "../components/Loading";
import "../styles/Home.css";

/**
 * Home page that displays a carousel of random associations
 */
const Home = ({ setSuggestions, setNpoData }) => {
  const [data, setData] = useState([]); 
  const [randomNPOs, setRandomNPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredNPOs } = location.state || {};

  const getRandomNPOs = (npoList) => {
    const shuffled = [...npoList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 9);
  };

  const fetchAssociationData = async () => {
    try {
      const response = await fetch(
        "https://data.gov.il/api/3/action/datastore_search?resource_id=be5b7935-3922-45d4-9638-08871b17ec95"
      );
      const jsonData = await response.json();
      const activeData = jsonData.result.records.filter(
        (association) =>
          association["סטטוס עמותה"] === "רשומה" ||
          association["סטטוס עמותה"] === "פעילה"
      );

      setData(activeData);
      setSuggestions(activeData);
      setNpoData(activeData);
      setRandomNPOs(getRandomNPOs(activeData));
    } catch (error) {
      setError(error.toString());
      console.error("Error fetching association data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filteredNPOs?.length) {
      setRandomNPOs(getRandomNPOs(filteredNPOs));
      setLoading(false);
    } else {
      fetchAssociationData();
    }
  }, [filteredNPOs, setSuggestions, setNpoData]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="home pb-5px">
      {!loading ? (
        <>
          <h1 className="home-title pb-5px">
            ברוכים הבאים ל-SafeDonate
          </h1>
          <AssociationCarousel 
            dataList={randomNPOs} 
            userId={authUser?.id} 
          />

          <div className="more-npos-button-container">
            <button
              className="more-npos-button"
              onClick={() => navigate("/advanced-search")}
            >
              חפשו עוד עמותות
            </button>
          </div>
      </>
      ) : (
        <Loading/>
      )}
    </div>
  );
};

export default Home;