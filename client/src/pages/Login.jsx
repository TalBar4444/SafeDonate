import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import axios from "axios";
import "../styles/Login.css";

/**
 * Login page that allows users to log in to the platform
 */
const Login = () => {
  const [email, setEmail] = useState(""); // Email input state
  const [password, setPassword] = useState(""); // Password input state
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const { loading, login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>ברוכים הבאים ל-SafeDonate</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {" "}
          {/* Attach handleLogin to form submit */}
          <label htmlFor="email">אימייל</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Set email value
            placeholder="הכנס את כתובת האימייל שלך"
            required
          />
          <label htmlFor="password">סיסמא</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Set password value
            placeholder="הכנס את הסיסמא שלך"
            required
          />{" "}
          <button type="submit" className="login-button">
            התחבר
          </button>
        </form>

        <div className="signup-redirect">
          <p>
            עוד לא ב-SafeDonate?{" "}
            <span className="highlight" onClick={handleSignUpRedirect}>
              צרו חשבון כאן
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
