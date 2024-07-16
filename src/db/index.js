import mongoose from "mongoose"; // Import mongoose for MongoDB connection handling

import { DB_NAME } from "../constants.js"; // Import the database name from constants

// Define an asynchronous function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database using the connection string from environment variables
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        
        // If the connection is successful, log the host information
        console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // If there is an error during the connection, log the error message
        console.log("MONGODB connection error", error);
        
        // Exit the process with a failure code
        process.exit(1);
    }
}

// Export the connectDB function for use in other modules
export default connectDB;
