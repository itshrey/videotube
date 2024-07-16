// Import necessary modules and functions
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Define the verifyJWT middleware function
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Retrieve the token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(req.cookies);
        console.log(token);

        // Check if the token is present
        if (!token) {
            // If no token is found, throw an ApiError with a 401 status code (Unauthorized)
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the decoded token, excluding password and refreshToken fields
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // Check if the user exists
        if (!user) {
            // If no user is found, throw an ApiError with a 401 status code (Unauthorized)
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user to the request object
        req.user = user;

        // Call the next middleware function
        next();
    } catch (error) {
        // If an error occurs, throw an ApiError with a 401 status code (Unauthorized) and the error message
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
