import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema from mongoose
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

// Define the schema for a user
const userSchema = new Schema(
    {
        username: {
            type: String, // Username field of type String
            required: true, // Username is required
            unique: true, // Username must be unique
            lowercase: true, // Convert username to lowercase
            trim: true, // Remove whitespace from both ends of the username
            index: true // Index this field for faster querying
        },
        email: {
            type: String, // Email field of type String
            required: true, // Email is required
            unique: true, // Email must be unique
            lowercase: true, // Convert email to lowercase
            trim: true // Remove whitespace from both ends of the email
        },
        fullName: {
            type: String, // Full name field of type String
            required: true, // Full name is required
            trim: true, // Remove whitespace from both ends of the full name
            index: true // Index this field for faster querying
        },
        avatar: {
            type: String, // Avatar field of type String (URL)
            required: true // Avatar is required
        },
        coverImage: {
            type: String // Cover image field of type String (URL)
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId, // Each entry in watch history is an ObjectId
                ref: "Video" // Reference to the Video model
            }
        ],
        password: {
            type: String, // Password field of type String
            required: [true, 'Password is required'] // Password is required with a custom error message
        },
        refreshToken: {
            type: String // Refresh token field of type String
        }
    },
    {
        timestamps: true // Automatically create createdAt and updatedAt fields
    }
);

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
    // If the password is not modified, skip the hashing
    if (!this.isModified("password")) return next();

    // Hash the password with a salt factor of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if a given password matches the hashed password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiry time
        }
    );
}
//jwt.sign is a method provided by the jsonwebtoken library that is used to generate a JSON Web Token (JWT). Here's a detailed explanation of its usage and parameters, along with an example:

//Usage
//jwt.sign(payload, secretOrPrivateKey, [options, callback])

// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Token expiry time
        }
    );
}

// Create and export the User model based on the userSchema
export const User = mongoose.model("User", userSchema);
