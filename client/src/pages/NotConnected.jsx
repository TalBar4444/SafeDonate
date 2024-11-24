import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotConnected.css";

/**
 * NotConnected page that displays a message when the user is not logged in
 */
const NotConnected = () => {
    const navigate = useNavigate();

    // Define the redirect function
    const handleLoginRedirect = () => navigate("/login");

    return (
        <div className="notconnected-page">
            <div className="unauthenticated-message">
                <h2>אינכם מחוברים</h2>
                <p>על מנת לצפות במידע על העמותה, עליכם להתחבר למערכת.</p>
                <button className="login-button" onClick={handleLoginRedirect}>
                    התחבר כאן
                </button>
            </div>
        </div >
    );
};

export default NotConnected;