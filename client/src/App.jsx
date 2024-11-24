import { useState } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import AssociationPage from "./pages/AssociationPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import NotConnected from "./pages/NotConnected";
import AdvancedSearch from "./pages/AdvancedSearch";
import FilteredResultsPage from "./pages/FilteredResultsPage";

const ROUTES = {
  HOME: "/",
  ASSOCIATION_PAGE: "/AssociationPage/:associationNumber",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile/:userId",
  ABOUT_US: "/about-us",
  ADVANCED_SEARCH: "/advanced-search",
  FILTERED_RESULTS: "/filtered-results",
  NOT_FOUND: "*",
  NOT_CONNECTED: "/not-connected",
};

const App = () => {
  const { authUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [npoData, setNpoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const navigate = useNavigate();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleLogin = () => {
    navigate(ROUTES.LOGIN); // Use navigate here
  };

  const handleSignup = () => {
    navigate(ROUTES.SIGNUP);
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      {/* Pass searchTerm and suggestions to Header */}
      <Header
        onSearch={handleSearch}
        suggestions={suggestions}
        handleLogin={handleLogin}
      />
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <Home
              filteredData={filteredData}
              setFilteredData={setFilteredData}
              searchTerm={searchTerm}
              setSuggestions={setSuggestions}
              setNpoData={setNpoData} 
            />
          }
        />
    
        <Route
          path={ROUTES.ASSOCIATION_PAGE}
          element={
            authUser ? <AssociationPage /> : <Navigate to={ROUTES.NOT_CONNECTED} />
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path={ROUTES.SIGNUP}
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path={ROUTES.PROFILE}
          element={authUser ? <UserProfile /> : <Navigate to={ROUTES.LOGIN} />}
        />
        <Route path={ROUTES.ABOUT_US} element={<AboutUs />} />
    
        <Route
          path={ROUTES.ADVANCED_SEARCH}
          element={
            <AdvancedSearch
              // npoData={npoData}
              // setFilteredData={setFilteredData}
              />
          } 
        />
        <Route
          path={ROUTES.FILTERED_RESULTS}
          element={<FilteredResultsPage />}
        />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        <Route path={ROUTES.NOT_CONNECTED} element={<NotConnected />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
