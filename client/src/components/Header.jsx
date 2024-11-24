import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import debounce from "lodash.debounce";
import "../styles/Header.css";
import logo from "../assets/logo.png";
import icon from "../assets/icon-header.png";
import profileIcon from "../assets/user-profile-icon.png";

/**
 * Header component that displays the main navigation bar
 * Contains search functionality with autocomplete suggestions
 * Handles user authentication status and navigation
 * Provides quick access to main site features
 */


const Header = ({ handleLogin }) => {
  const navigate = useNavigate();
  const searchBarRef = useRef(null);
  const { authUser } = useAuthContext();

  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  // Debounced search logic
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm) {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://data.gov.il/api/3/action/datastore_search?resource_id=be5b7935-3922-45d4-9638-08871b17ec95`,
          {
            params: { q: searchTerm },
          }
        );

        const filtered = response.data.result.records;

        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching NPO data:", error);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSuggestionClick = (suggestionId) => {
    navigate(`/AssociationPage/${suggestionId}`);
    setSearchInput("");
    setShowSuggestions(false);
  };

  const navigateToProfile = () => {
    navigate(`/profile/${authUser._id}`);
  };

  useEffect(() => {
    setLoggedIn(!!authUser);
  }, [authUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSearchInput("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header" aria-label="Main header">
      <div className="header-container">
        <div className="header-title">
          <a href="/" className="header-icon-link">
            <img src={icon} alt="SafeDonate Icon" className="header-icon" />
          </a>
          <a href="/" className="header-logo-link">
            <img src={logo} alt="SafeDonate Logo" className="header-logo" />
          </a>
        </div>

        {/* Navigation Section */}
        <div className="header-nav">
          {/* Search Bar */}
          <div className="search-bar-wrapper" ref={searchBarRef}>
            <input
              type="text"
              placeholder={"חיפוש"}
              aria-label="Search NPOs"
              className="search-bar"
              value={searchInput}
              onChange={handleInputChange}
            />

            {showSuggestions && (
              <div className="suggestions-dropdown">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.slice(0, 7).map((suggestion) => (
                    <div
                      key={suggestion["מספר עמותה"]}
                      className="suggestion-item"
                      onClick={() =>
                        handleSuggestionClick(suggestion["מספר עמותה"])
                      }
                    >
                      {suggestion["שם עמותה בעברית"]}
                    </div>
                  ))
                ) : (
                  <div className="no-suggestions mr-2">לא נמצאו תוצאות</div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <button
            className="header-tab"
            onClick={() => navigate("/advanced-search")}
          >
            חיפוש מתקדם
          </button>

          <button className="header-tab" onClick={() => navigate("/about-us")}>
            קצת עלינו
          </button>

          {/* Profile Section */}
          <div onClick={loggedIn ? navigateToProfile : handleLogin}>
            {loggedIn ? (
              <div className="profile-circle bg-[#2d6be7] hover:bg-[#264bae] hover:scale-110 transition cursor-pointer">
                <span className="z-50 text-2xl text-white flex items-center justify-center">
                  {authUser.firstName[0].toUpperCase()}
                  {authUser.lastName[0].toUpperCase()}
                </span>
              </div>
            ) : (
              <div>
                <img
                  src={profileIcon}
                  alt="Profile"
                  className="w-14 h-14 bg-[#ffffff] rounded-full border-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
