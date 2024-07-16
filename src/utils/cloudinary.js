// Import Cloudinary's v2 module and the filesystem (fs) module
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// Configure Cloudinary with environment variables for cloud name, API key, and API secret
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Upload a file to Cloudinary
 * @param {string} localFilePath - The path to the local file to be uploaded
 * @returns {object|null} The response from Cloudinary if successful, otherwise null
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If no file path is provided, return null
        if (!localFilePath) return null;
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Automatically detect the file type (image, video, etc.)
        });
        
        // File has been uploaded successfully
        console.log("file is uploaded on cloudinary ", response.url);
        
        // Remove the local file after upload
        fs.unlinkSync(localFilePath);
        
        // Return the response from Cloudinary
        return response;
    } catch (error) {
        // Remove the local file if an error occurs during upload
        fs.unlinkSync(localFilePath);
        
        // Return null to indicate the upload failed
        return null;
    }
};

// Export the uploadOnCloudinary function for use in other modules
export {uploadOnCloudinary};
