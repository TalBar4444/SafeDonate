import { createContext, useContext, useState } from "react";

/**
 * Context for managing authentication state throughout the application
 * Provides user authentication data and methods to update it
 */
export const AuthContext = createContext();

/**
 * Custom hook to access the AuthContext
 * @returns {Object} The auth context value
 */
export const useAuthContext = () => {
	return useContext(AuthContext);
};

/**
 * Provider component that wraps the app to provide authentication context
 * Manages user state and persists it in localStorage
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("local-user")) || null);

	return <AuthContext.Provider value={{ authUser, setAuthUser }}>{children}</AuthContext.Provider>;
};