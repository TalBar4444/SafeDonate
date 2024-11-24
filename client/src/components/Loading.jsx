import React, { useEffect, useState } from "react";
import "../styles/Loading.css";

/**
 * Displays a loading spinner with Hebrew text while content is being fetched
 */
const Loading = () => {

    return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loader-text">טוען... נא להמתין</p>
        </div>     
      );
};


export default Loading;
