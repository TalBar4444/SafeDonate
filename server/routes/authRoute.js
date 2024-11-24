const express = require('express');
const authController = require("../controllers/authController.js");

const authRouter = express.Router();

// Handle user registration/signup
authRouter.post('/signup', authController.signup);

// Handle user login and authentication
authRouter.post('/login', authController.login);

// Handle user logout and session termination
authRouter.post('/logout', authController.logout);

module.exports = authRouter;