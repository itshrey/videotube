import express from "express"; // Import the Express framework
import cors from "cors"; // Import the CORS middleware for cross-origin requests
import cookieParser from "cookie-parser"; // Import the cookie parser middleware

// Create an instance of the Express application
const app = express();

// Configure CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from specified origin
    credentials: true // Enable sending cookies and credentials with requests
}));

// Middleware to parse JSON bodies, with a limit on request size
app.use(express.json({ limit: "16kb" })); // Limit the request body to 16KB for JSON payloads

// Middleware to parse URL-encoded bodies, with a limit on request size
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Limit the request body to 16KB for URL-encoded payloads

// Middleware to serve static files from the "public" directory
app.use(express.static("public")); // Serve static assets such as images, CSS files, etc.

// Middleware to parse cookies from incoming requests
app.use(cookieParser()); // Enable cookie parsing in request objects

// Router import for user-related routes
import userRouter from "./routes/user.routes.js"; // Import the user router

// Declare routes for user-related API endpoints
app.use("/api/v1/users", userRouter); // Mount the user router on the "/api/v1/users" path

// Export the Express application instance for use in other modules
export { app };
