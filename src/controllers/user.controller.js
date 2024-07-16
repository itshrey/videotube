import { asyncHandler } from "../utils/asyncHandler.js"; // Importing asyncHandler for handling async route functions
import { ApiError } from "../utils/ApiError.js"; // Importing ApiError class for error handling
import { User } from "../models/user.model.js"; // Importing User model for database operations
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Importing function to upload files to Cloudinary
import { ApiResponse } from "../utils/ApiResponse.js"; // Importing ApiResponse class for standard API responses
import jwt from "jsonwebtoken"; // Importing jsonwebtoken for token handling
import mongoose from "mongoose"; // Importing mongoose for MongoDB interactions

// Function to generate access and refresh tokens for a user
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); // Find user by ID
        const accessToken = await user.generateAccessToken(); // Generate access token
        const refreshToken = await user.generateRefreshToken(); // Generate refresh token

        user.refreshToken = refreshToken; // Save refresh token to user document
        await user.save({ validateBeforeSave: false }); // Save user without validation

        return { accessToken, refreshToken }; // Return generated tokens
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

// Function to register a new user
const registerUser = asyncHandler(async (req, res) => {
    // Extract user details from the request body
    const { fullName, email, username, password } = req.body;

    // Validate that all fields are provided
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if the user already exists by username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Get avatar file path from the uploaded files
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    // Check if cover image is provided
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Validate avatar presence
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar and cover image to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Create a new user document
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Fetch the created user excluding password and refresh token
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return response with created user information
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

// Function to log in an existing user
const loginUser = asyncHandler(async (req, res) => {
    // Extract user details from the request body
    const { email, username, password } = req.body;

    // Validate presence of either username or email
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // Find the user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if the provided password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate access and refresh tokens for the user
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    // Fetch the logged-in user excluding password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options for security
    const options = {
        httpOnly: true, // Prevent client-side access to cookies
        secure: true // Use secure cookies
    };

    // Set cookies and return response with user information and tokens
    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        );
});

// Function to log out a user
const logoutUser = asyncHandler(async (req, res) => {
    // Remove refresh token from the user's document
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // Remove the refreshToken field
            }
        },
        {
            new: true
        }
    );

    // Cookie options for security
    const options = {
        httpOnly: true,
        secure: true
    };

    // Clear cookies and return response indicating logout
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

// Function to refresh access token using refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        // Verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Find the user associated with the token
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Check if the refresh token matches
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // Cookie options for security
        const options = {
            httpOnly: true,
            secure: true
        };

        // Generate new access and refresh tokens
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

        // Set cookies and return response with new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Function to change the current user's password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user?._id);
    // Check if the old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Update user's password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Function to get the currently logged-in user's information
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ));
});

// Function to update account details of the user
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    // Validate that fullName and email are provided
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    // Update user account details
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password"); // Exclude password from the result

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Function to update user's avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    // Validate that avatar file is provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update user's avatar in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password"); // Exclude password from the result

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar updated successfully")
        );
});

// Function to update user's cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    // Validate that cover image file is provided
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    // Upload cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cloudinary");
    }

    // Update user's cover image in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password"); // Exclude password from the result

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover Image updated successfully")
        );
});

// Function to get a user's channel profile by username
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // Validate that username is provided
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    // Aggregate user data along with subscriber information
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase() // Match username case-insensitively
            }
        },
        {
            $lookup: {
                from: "subscriptions", // Join with subscriptions collection
                localField: "_id", // User's ID field
                foreignField: "channel", // Subscription's channel field
                as: "subscribers" // Name of the output array
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" // Name of the output array for channels subscribed to
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers" // Count number of subscribers
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo" // Count number of channels subscribed to
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // Check if the user is subscribed
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1 // Specify fields to include in the output
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        );
});

// Function to get the watch history of the user
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) // Match current user by ID
            }
        },
        {
            $lookup: {
                from: "videos", // Join with videos collection
                localField: "watchHistory", // User's watch history field
                foreignField: "_id", // Video's ID field
                as: "watchHistory", // Name of the output array
                pipeline: [
                    {
                        $lookup: {
                            from: "users", // Join with users collection to get video owners
                            localField: "owner", // Video's owner field
                            foreignField: "_id", // User's ID field
                            as: "owner", // Name of the output array for owners
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1 // Project owner fields
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner" // Get the first owner from the lookup
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

// Exporting all the functions for use in routes
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}