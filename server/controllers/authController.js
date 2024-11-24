const User = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/generateToken.js');

/**
 * Authenticates a user and logs them in
 * @param {Object} req - Express request object containing email and password in body
 * @param {Object} res - Express response object
 * @returns {Object} User data and authentication token on success, error message on failure
 */
module.exports.login = async function login(req, res) {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "אימייל וסיסמא לא תואמים" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

/**
 * Creates a new user account
 * @param {Object} req - Express request object containing user registration data in body
 * @param {Object} res - Express response object
 * @returns {Object} New user data and authentication token on success, error message on failure
 */
module.exports.signup = async function signup(req, res) {
	try {
		const { firstName, lastName, email, password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "סיסמאות לא תואמות" });
		}

		const user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ error: "קיים חשבון לכתובת מייל זו" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			Association: []
		});	

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
		
			await newUser.save();
			res.status(201).json({
				_id: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				Association: newUser.Association,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}

	} catch (err) {
		console.log("Error in signup controller", err.message);
		res.status(500).json({ error: "Internal Server Error" });
		
	}
}

/**
 * Logs out a user by clearing their authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message on logout, error message on failure
 */
module.exports.logout = async function logout(req, res) {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}