import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

/**
 * Custom hook for handling user registration
 */
const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ firstName, lastName, email, password, confirmPassword }) => {
		const success = handleInputErrors({ firstName, lastName, email, password, confirmPassword });
		if (!success) return;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
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

	return { loading, signup };
};

export default useSignup;

function handleInputErrors({ firstName, lastName, email, password, confirmPassword }) {
	if (!firstName || !lastName || !email || !password || !confirmPassword) {
		toast.error("מלא את כל השדות");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("הסיסמאות לא מתאימות");
		return false;
	}

	if (password.length < 4) {
		toast.error("סיסמה חייבת להכיל 4 ספרות לפחות");
		return false;
	}

	return true;
}