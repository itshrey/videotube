import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema from mongoose

// Define the schema for a subscription
const subscriptionSchema = new Schema({
    // Define the subscriber field
    subscriber: {
        type: Schema.Types.ObjectId, // Use ObjectId type to reference another document
        ref: "User" // Reference the User model, indicating that subscriber is a User
    },
    // Define the channel field
    channel: {
        type: Schema.Types.ObjectId, // Use ObjectId type to reference another document
        ref: "User" // Reference the User model, indicating that channel is a User
    }
}, { timestamps: true }); // Enable automatic creation of createdAt and updatedAt fields

// Create and export the Subscription model based on the subscriptionSchema
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
