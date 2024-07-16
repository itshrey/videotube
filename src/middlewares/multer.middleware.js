import multer from "multer"; // Import the multer module for handling file uploads

// Define storage configuration for multer
const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: function (req, file, cb) {
        // The callback function takes an error (if any) as the first argument and the destination path as the second argument
        cb(null, "./public/temp");
    },
    // Set the filename for uploaded files
    filename: function (req, file, cb) {
        // The callback function takes an error (if any) as the first argument and the desired filename as the second argument
        cb(null, file.originalname); // Use the original name of the uploaded file
    }
});

// Create an instance of multer with the defined storage configuration
export const upload = multer({ storage });

// Example of handling multiple fields with multer
// This example demonstrates how to handle multiple file fields in a single request
// You should ensure your middleware setup matches your usage in the router
// Usage in router (example):
// router.post('/upload', upload.fields([
//     { name: 'profilePic', maxCount: 1 },
//     { name: 'documents', maxCount: 10 }
// ]), (req, res) => {
//     // Handle the request after files have been uploaded
// });
