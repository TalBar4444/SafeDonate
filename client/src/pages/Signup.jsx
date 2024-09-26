import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSignup from "../hooks/useSignup";
import "../Signup.css";

const Signup = () => {
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const { loading, signup } = useSignup();
  //const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
	};
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [verifyPassword, setVerifyPassword] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // // const [dob, setDob] = useState("");
  // // const [phoneNumber, setPhoneNumber] = useState("");
  // const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  // const navigate = useNavigate();
  // const today = new Date().toISOString().split("T")[0];

  // const handleSignUp = async (e) => {
  //   e.preventDefault();

  //   if (password !== verifyPassword) {
  //     alert("Passwords do not match!");
  //     return;
  //   }

  //   if (!showAdditionalFields) {
  //     // Move to the next step
  //     setShowAdditionalFields(true);
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("http://localhost:3000/users/signup", {
  //       firstName: firstName,
  //       lastName: lastName,
  //       email: email,
  //       password: password,
        
  //       // dob: dob,
  //       // phoneNumber: phoneNumber,
  //     });

  //     if (response.status === 200) {
  //       const token = response.data.token;
  //       const expires = new Date(Date.now() + 3600000); // 1 hour from now
  //       document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/`;

  //       navigate("/", { state: { id: email } });
  //     } else {
  //       console.log("Signup failed. Please check your input.");
  //     }
  //   } catch (error) {
  //     console.error("Error during signup:", error);
  //   }
  // };

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


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./SignUp.css";

// const Signup = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [verifyPassword, setVerifyPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   // const [dob, setDob] = useState("");
//   // const [phoneNumber, setPhoneNumber] = useState("");
//   const [showAdditionalFields, setShowAdditionalFields] = useState(false);
//   const navigate = useNavigate();
//   const today = new Date().toISOString().split("T")[0];

//   const handleSignUp = async (e) => {
//     e.preventDefault();

//     if (password !== verifyPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     if (!showAdditionalFields) {
//       // Move to the next step
//       setShowAdditionalFields(true);
//       return;
//     }

//     try {
//       const response = await axios.post("http://localhost:3000/users/signup", {
//         firstName: firstName,
//         lastName: lastName,
//         email: email,
//         password: password,
        
//         // dob: dob,
//         // phoneNumber: phoneNumber,
//       });

//       if (response.status === 200) {
//         const token = response.data.token;
//         const expires = new Date(Date.now() + 3600000); // 1 hour from now
//         document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/`;

//         navigate("/", { state: { id: email } });
//       } else {
//         console.log("Signup failed. Please check your input.");
//       }
//     } catch (error) {
//       console.error("Error during signup:", error);
//     }
//   };

//   const handleLoginRedirect = () => {
//     navigate("/login");
//   };

//   return (
//     <div className="signup-page">
//       <div className="signup-container">
//         <h2>יצירת משתמש חדש</h2>
//         <form onSubmit={handleSignUp} className="signup-form">
//           {/* Step 1: Email, Password, Verify Password */}
//           {!showAdditionalFields && (
//             <>
//               <label htmlFor="email">אימייל</label>
//               <input
//                 type="email"
//                 id="email"
//                 placeholder="הכנס את כתובת האימייל שלך"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />

//               <label htmlFor="password">סיסמא</label>
//               <input
//                 type="password"
//                 id="password"
//                 placeholder="הכנס את הסיסמא שלך"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />

//               <label htmlFor="verifyPassword">אמת סיסמא</label>
//               <input
//                 type="password"
//                 id="verifyPassword"
//                 placeholder="הכנס את הסיסמא שלך שוב"
//                 value={verifyPassword}
//                 onChange={(e) => setVerifyPassword(e.target.value)}
//                 required
//               />

//               <button type="submit" className="signup-button">
//                 המשך
//               </button>
//             </>
//           )}

//           {/* Step 2: Additional Info */}
//           {showAdditionalFields && (
//             <>
//               <label htmlFor="firstName">שם פרטי</label>
//               <input
//                 type="text"
//                 id="firstName"
//                 placeholder="הכנס את שמך הפרטי"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 required
//               />

//               <label htmlFor="lastName">שם משפחה</label>
//               <input
//                 type="text"
//                 id="lastName"
//                 placeholder="הכנס את שם המשפחה שלך"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 required
//               />

//               {/* <label htmlFor="dob">תאריך לידה</label>
//               <input
//                 type="date"
//                 id="dob"
//                 max={today}
//                 value={dob}
//                 onChange={(e) => setDob(e.target.value)}
//                 required
//               /> */}

//               {/* <label htmlFor="phoneNumber">מספר טלפון (אופציונלי)</label>
//               <input
//                 type="tel"
//                 id="phoneNumber"
//                 placeholder="הכנס את מספר הטלפון שלך"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//               /> */}

//               <button type="submit" className="signup-button">
//                 צור חשבון
//               </button>
//             </>
//           )}
//         </form>

//         <div className="login-redirect">
//           <p>
//             כבר יש לך חשבון?{" "}
//             <span className="highlight" onClick={handleLoginRedirect}>
//               התחבר כאן
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;



