/**
 * Main server setup and configuration file
 * Initializes Express server with middleware and routes
 * Connects to MongoDB database
 * Handles API endpoints for auth, users, scraping and donations
 */

// Core dependencies
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const cors = require('cors');

// Route handlers
const authRouter = require('./routes/authRoute.js')
const userRouter = require('./routes/userRoute.js');
const scrapeRouter = require('./routes/scrapeRoute.js');
const donationRounter = require('./routes/donationRoute.js');

// Database connection
const connectToMongoDB = require('./db/connectToMongoDB.js')

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Configure middleware
 * - Enable CORS for cross-origin requests
 * - Parse JSON request bodies
 * - Parse cookies from requests
 */

// Configure CORS options
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS with options
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/**
 * Register API routes
 * - Authentication endpoints
 * - User management endpoints  
 * - Web scraping endpoints
 * - Donation management endpoints
 */
app.use("/api/auth", authRouter);
app.use('/users', userRouter);
app.use('/scrape', scrapeRouter);
app.use('/donations', donationRounter);

/**
 * Start server and connect to database
 * Listens on configured port
 * Establishes MongoDB connection
 */
app.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});