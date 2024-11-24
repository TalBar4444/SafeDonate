import React, { useState, useEffect } from "react";
import axios from "axios"

/**
 * A button component that allows users to add/remove associations to their favorites
 * Displays different styles and text based on favorite status
 * Manages favorite state through API calls to the backend
 */
const FavoriteButton = ({ association, userId }) => {
  const [favorite, setFavorite] = useState(false);
  const aName = association["שם עמותה בעברית"]
  const aNumber = association["מספר עמותה"]

  useEffect(() => {
    const checkFavoriteExistence = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/users/updateExist/${userId}`, {
            associationNumber: aNumber
        });
        setFavorite(response.data.exists);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteExistence();
  }, []);

  const handleClick = async () => {
    setFavorite(!favorite);

    if (favorite) {
      await axios.put(`http://localhost:5000/users/updateRemove/${userId}`, {
          associationNumber: aNumber       
      })
    } else {
      await axios.put(`http://localhost:5000/users/updateAdd/${userId}`, {
          associationName: aName, 
          associationNumber: aNumber       
      })
    }
  };

  return (
    <div className="">
      {favorite ? (
        <button
          className="favorite-button flex items-center justify-center gap-2 bg-[#2B4F71] hover:bg-[#1a3c5e] text-white font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-[#2B4F71]"
          onClick={handleClick}
        >
          <p className="text-lg">הסר מהמועדפים</p>
          <span className="text-xl">❤️</span>
        </button>
        
      ) : (
        <button
          className="favorite-button flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#101010] font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg border-2 border-gray-300 transform hover:-translate-y-0.5"
          onClick={handleClick}
        >
          <p className="text-lg">הוסף למועדפים</p>
          <span className="text-xl">🤍</span>
        </button>
      )}
    </div>
  );
};

export default FavoriteButton;
