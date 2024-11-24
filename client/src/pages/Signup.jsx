import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSignup from "../hooks/useSignup";
import "../styles/Signup.css";

/**
 * Signup page that allows users to create a new account
 */
const Signup = () => {
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const { loading, signup } = useSignup();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
	};

  const handleLoginRedirect = () => {
    navigate("/login");
  }; 

  return (
    <div className="signup-page">
      <div className="signup-container">
         <h2>יצירת משתמש חדש</h2>
         <form onSubmit={handleSubmit} className="signup-form">

            <label htmlFor="firstName">שם פרטי</label>
            <input
               type="text"
               id="firstName"
               placeholder="הכנס את שמך הפרטי"
               value={inputs.firstName}
               onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
               required
            />

            <label htmlFor="lastName">שם משפחה</label>
            <input
               type="text"
               id="lastName"
               placeholder="הכנס את שם המשפחה שלך"
               value={inputs.lastName}
               onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
               required
            />

            <label htmlFor="email">אימייל</label>
            <input
               type="email"
               id="email"
               placeholder="הכנס את כתובת האימייל שלך"
               value={inputs.email}
               onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
               required
            />

            <label htmlFor="password">סיסמא</label>
            <input
               type="password"
               id="password"
               placeholder="הכנס את הסיסמא שלך"
               value={inputs.password}
               onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
               required
            />

            <label htmlFor="confirmPassword">אמת סיסמא</label>
            <input
               type="password"
               id="confirmPassword"
               placeholder="הכנס את הסיסמא שלך שוב"
               value={inputs.confirmPassword}
               onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
               required
            />

            <button type="submit" className="signup-button" disabled={loading}>
               צור חשבון
            </button>
				
         </form>

        <div className="login-redirect">
          <p>
            כבר יש לך חשבון?{" "}
            <span className="highlight" onClick={handleLoginRedirect}>
              התחבר כאן
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;