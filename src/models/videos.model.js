import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema from mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Import pagination plugin for aggregation

// Define the schema for a video
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Field for the video file URL (e.g., from Cloudinary)
            required: true // This field is mandatory
        },
        thumbnail: {
            type: String, // Field for the thumbnail image URL (e.g., from Cloudinary)
            required: true // This field is mandatory
        },
        title: {
            type: String, // Field for the video title
            required: true // This field is mandatory
        },
        description: {
            type: String, // Field for the video description
            required: true // This field is mandatory
        },
        duration: {
            type: Number, // Field for the video duration in seconds
            required: true // This field is mandatory
        },
        views: {
            type: Number, // Field for the number of views the video has received
            default: 0 // Default value is 0
        },
        isPublished: {
            type: Boolean, // Field to indicate if the video is published or not
            default: true // Default value is true (published)
        },
        owner: {
            type: Schema.Types.ObjectId, // Field for the owner's ID (referencing the User model)
            ref: "User" // Reference to the User model
        }
    },
    {
        timestamps: true // Automatically create createdAt and updatedAt fields
    }
);

// Add pagination capabilities to the video schema using the mongooseAggregatePaginate plugin
videoSchema.plugin(mongooseAggregatePaginate);

// Create and export the Video model based on the videoSchema
export const Video = mongoose.model("Video", videoSchema);
