import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

/**
 * Custom hook to handle user login functionality
 */
const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	/** Handles the login process
	 * @param {string} email - User's email
	 * @param {string} password - User's password
	 */
	
	const login = async (email, password) => {
		const success = handleInputErrors(email, password);
		if (!success) return;
		setLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}

			localStorage.setItem("local-user", JSON.stringify(data));
			setAuthUser(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};

export default useLogin;

function handleInputErrors(email, password) {
	if (!email || !password) {
		toast.error("Please fill in all fields");
		return false;
	}

	return true;
}