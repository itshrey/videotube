import { Router } from "express"; // Importing Router from express to create route handlers
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
} from "../controllers/user.controller.js"; // Importing user-related controller functions
import { upload } from "../middlewares/multer.middleware.js"; // Importing upload middleware for file handling
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Importing JWT verification middleware

const router = Router(); // Creating a new router instance

// Route for user registration
router.route("/register").post(
    // Handling file uploads for avatar and cover image
    upload.fields([
        {
            name: "avatar", // Field name for avatar
            maxCount: 1 // Allow only one avatar file
        }, 
        {
            name: "coverImage", // Field name for cover image
            maxCount: 1 // Allow only one cover image file
        }
    ]),
    registerUser // Call the registerUser controller function
);

// Route for user login
router.route("/login").post(loginUser); // Call the loginUser controller function

// Secured routes that require JWT verification
router.route("/logout").post(verifyJWT, logoutUser); // Call logoutUser controller function after verifying JWT
router.route("/refresh-token").post(refreshAccessToken); // Call refreshAccessToken controller function
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // Call changeCurrentPassword after verifying JWT
router.route("/current-user").get(verifyJWT, getCurrentUser); // Call getCurrentUser after verifying JWT
router.route("/update-account").patch(verifyJWT, updateAccountDetails); // Call updateAccountDetails after verifying JWT
//post: Used for creating new resources (e.g., registering a user or logging in).
//get: Used for retrieving data (e.g., fetching user profiles or watch history).
//patch: Used for updating existing resources (e.g., updating account details, avatar, or cover image).
// Route for updating user avatar
router.route("/avatar").patch(
    verifyJWT, // Verify JWT for security
    upload.single("avatar"), // Handle single file upload for avatar
    updateUserAvatar // Call updateUserAvatar controller function
);

// Route for updating user cover image
router.route("/cover-image").patch(
    verifyJWT, // Verify JWT for security
    upload.single("coverImage"), // Handle single file upload for cover image
    updateUserCoverImage // Call updateUserCoverImage controller function
);

// Route for fetching a user’s channel profile by username
router.route("/c/:username").get(verifyJWT, getUserChannelProfile); // Call getUserChannelProfile with verified JWT

// Route for fetching the user's watch history
router.route("/history").get(verifyJWT, getWatchHistory); // Call getWatchHistory with verified JWT

export default router; // Exporting the router for use in other parts of the application
