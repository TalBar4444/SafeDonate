const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token and sets it as an HTTP-only cookie
 * Token contains user ID and expires in 15 days
 * Cookie includes security settings to prevent XSS and CSRF attacks
 */
const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.jwtSecret, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: "strict",
	});
};

module.exports = generateTokenAndSetCookie;