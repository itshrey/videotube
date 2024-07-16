/*"devDependencies": {
  "nodemon": "^3.1.4", // Development tool that automatically restarts the server on code changes
  "prettier": "3.3.2" // Code formatter to maintain consistent code style
},
"dependencies": {
  "bcrypt": "^5.1.1", // Library for hashing passwords and securing user data
  "cloudinary": "^2.2.0", // Service for managing and storing images and videos in the cloud
  "cookie-parser": "^1.4.6", // Middleware for parsing cookies from the request
  "cors": "^2.8.5", // Middleware for enabling Cross-Origin Resource Sharing (CORS)
  "dotenv": "^16.4.5", // Module for loading environment variables from a .env file
  "express": "^4.19.2", // Web framework for building web applications and APIs
  "jsonwebtoken": "^9.0.2", // Library for generating and verifying JSON Web Tokens (JWT)
  "mongoose": "^8.4.4", // MongoDB object modeling tool for Node.js, simplifying database interactions
  "mongoose-aggregate-paginate-v2": "^1.1.1", // Plugin for adding pagination support to Mongoose aggregate queries
  "multer": "^1.4.5-lts.1" // Middleware for handling multipart/form-data, used for file uploads
}
*/

// Import the dotenv package to load environment variables from a .env file
import dotenv from "dotenv"; 

// Import the database connection function from the index.js file
import connectDB from "./db/index.js"; 

// Import the Express app instance from the app.js file
import { app } from "./app.js"; 

// Load environment variables from the .env file
dotenv.config({
    path: './.env' // Specify the path to the .env file
});

/*
The following commented-out code shows an alternative way to set up the server and connect to MongoDB using Mongoose.
This is not in use but provides an example of how to structure the application if needed.

import mongoose from "mongoose"; // Import Mongoose for database interactions
import { DB_NAME } from "./constants"; // Import database name from constants
import express from "express"; // Import Express framework
const app = express(); // Create an Express application instance

// Immediately Invoked Function Expression (IIFE) to handle asynchronous database connection
(async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        // Set up error handling for the app
        app.on("error", (error) => {
            console.log("ERRR:", error); // Log any errors
            throw error; // Throw error to stop the application
        });

        // Start the server and listen on the specified port
        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.log("Error", error); // Log any connection errors
        throw error; // Throw error to stop the application
    }
})()
*/

// Connect to the database and start the server
connectDB()
    .then(() => {
        // Start the server once the database connection is established
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        // Log an error message if the database connection fails
        console.log("MONGO DB CONNECTION FAILED !!!", err);
    });
