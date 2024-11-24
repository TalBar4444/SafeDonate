import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import AssociationCarousel from "../components/AssociationCarousel";
import "../styles/FilteredResultsPage.css";

/**
 * FilteredResultsPage that displays filtered association results
 */
const FilteredResultsPage = () => {
  const location = useLocation();
  const { authUser } = useAuthContext();
  const { filteredNPOs, selectedCategories } = location.state || {}; // Get the filtered NPOs from state
  const [displayedNPOs, setDisplayedNPOs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9); // Number of NPOs to show at a time
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Load initial 9 NPOs
  useEffect(() => {
    if (filteredNPOs && filteredNPOs.length > 0) {
      setDisplayedNPOs(filteredNPOs.slice(0, 9));
    }

    console.log("Filtered NPOs:", selectedCategories);
  }, [filteredNPOs]);

  // Handle scroll event to load more NPOs
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !loading &&
      displayedNPOs.length < filteredNPOs.length
    ) {
      setLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + 9); // Show 9 more NPOs
        setLoading(false);
      }, 500); // Reduce loading time
    }
  }, [loading, displayedNPOs.length, filteredNPOs.length]);

  useEffect(() => {
    setDisplayedNPOs(filteredNPOs.slice(0, visibleCount));
  }, [visibleCount, filteredNPOs]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="filtered-results-page ">
      <h2 className="filtered-results-page-title pb-5">
        סינון
      </h2>
      <h3 className="filtered-results-page-results-title pb-2 text-lg">
        {selectedCategories.length > 0 ? selectedCategories.join(", ") : "לא נבחרו קטגוריות"}
      </h3>

      <AssociationCarousel dataList={displayedNPOs} userId={authUser?.id} />
    
      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <span>טוען עוד עמותות...</span>
        </div>
      )}
    </div>
  );
};

export default FilteredResultsPage;