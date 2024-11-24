import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "../styles/UserProfile.css";
import { useAuthContext } from "../context/AuthContext";
import useLogout from "../hooks/useLogout";

/**
 * UserProfile page that displays user profile, information and actions
 */
const UserProfile = () => {
  const { userId } = useParams();
  const [donations, setDonations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("donations");
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const { loading, logout } = useLogout();

  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        try {
          const donationsResponse = await axios.get(
            `http://localhost:5000/donations/${userId}`
          );

          if (donationsResponse.status === 200) {
            // Sort donations by newest first
            const sortedDonations = [...donationsResponse.data].sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            setDonations(sortedDonations || []);
          } else {
            console.log("No donations found");
          }
        } catch (error) {
          console.error("Failed to fetch user's donation list:", error);
        }

        try {
          const favoritesResponse = await axios.get(
            `http://localhost:5000/users/favorite/${userId}`
          );

          if (favoritesResponse.status === 200) {
            // Sort favorites by newest first
            const sortedFavorites = [...favoritesResponse.data.favoriteAssociations].reverse();
            setFavorites(sortedFavorites);
          } else {
            console.log("No favorite associations found");
          }
        } catch (error) {
          console.error("Failed to fetch user's favorite associations:", error);
        }
      } else {
        console.log("Token verification failed.");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    await logout();
    console.log(authUser);
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/users/deleteUserById/${userId}`
        );
        if (response.status === 200) {
          alert("Your account has been successfully deleted.");
          Cookies.remove("token");
          setUser(null);
          navigate("/");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  if (!authUser) return <p>You don't have a user account.</p>;

  return (
    <div className="main-content">
      <div className="profile-page">
        <div className="profile-container">
          <h2>פרופיל אישי</h2>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <div className="w-10 h-10 bg-[#0072FF] bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-[#0072FF] text-xl">👤</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-500">שם פרטי</p>
                  <p className="text-lg font-medium text-gray-800">{authUser.firstName}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <div className="w-10 h-10 bg-[#0072FF] bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-[#0072FF] text-xl">👥</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-500">שם משפחה</p>
                  <p className="text-lg font-medium text-gray-800">{authUser.lastName}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <div className="w-10 h-10 bg-[#0072FF] bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-[#0072FF] text-xl">✉️</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-500">כתובת אימייל</p>
                  <a 
                    href={`mailto:${authUser.email}`}
                    className="text-lg font-medium text-[#0072FF] hover:text-[#00C6FF] transition-colors"
                  >
                    {authUser.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === "donations"
                  ? "text-[#0072FF] border-b-2 border-[#0072FF]"
                  : "text-gray-500 hover:text-[#00C6FF]"
              }`}
              onClick={() => setActiveTab("donations")}
            >
              התרומות שלי
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === "favorites"
                  ? "text-[#0072FF] border-b-2 border-[#0072FF]"
                  : "text-gray-500 hover:text-[#00C6FF]"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              עמותות מועדפות
            </button>
          </div>

          {/* Donations Tab Content */}
          {activeTab === "donations" && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#0072FF] bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-[#0072FF] text-xl">💰</span>
                </div>
                <h3 className="mr-4 text-2xl font-bold text-gray-800">התרומות שלי</h3>
              </div>

              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                      <div className="flex items-center flex-1">
                        <div className="w-8 h-8 bg-[#104d8e] bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-[#104d8e] text-sm">₪</span>
                        </div>
                        <div className="mr-4 flex-1">
                          <p className="text-lg font-medium text-gray-800">{donation.associationName}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">סכום: ₪{donation.amount}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(donation.createdAt).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-xl font-medium text-gray-700 mb-4">עדיין לא ביצעת תרומות</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-[#0072FF] text-white px-4 py-2 rounded-full text-lg font-medium hover:bg-[#00C6FF] transition-colors"
                  >        
                    התחלו לתרום
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab Content */}
          {activeTab === "favorites" && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#0072FF] bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-[#0072FF] text-xl">⭐</span>
                </div>
                <h3 className="mr-4 text-2xl font-bold text-gray-800">עמותות מועדפות</h3>
              </div>

              {favorites.length > 0 ? (
                <div className="space-y-4">
                  {favorites.map((association, index) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/AssociationPage/${association.number}`)}
                      className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer transition-all hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 bg-[#104d8e] bg-opacity-10 rounded-full flex items-center justify-center">
                        <span className="text-[#104d8e] text-sm">🏢</span>
                      </div>
                      <span className="mr-4 text-lg font-medium text-[#104d8e] hover:text-[#00C6FF] transition-colors">
                        {association.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-xl font-medium text-gray-700 mb-4">אין עמותות מועדפות</p>
                  <button
                    onClick={() => navigate("/advanced-Search")}
                    className="bg-[#0072FF] text-white px-4 py-2 rounded-full text-lg font-medium hover:bg-[#00C6FF] transition-colors"
                  >
                    חפשו עמותות להוסיף
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="profile-buttons">
            <button onClick={handleLogout} className="logout-button">
              התנתק
            </button>
            <button onClick={handleDeleteAccount} className="delete-button">
              מחק משתמש
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;