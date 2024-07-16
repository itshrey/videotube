// Define the ApiError class that extends the built-in Error class
class ApiError extends Error {
    /** 
     * Constructor for ApiError
     * @param {number} statusCode - The HTTP status code for the error
     * @param {string} [message="Something went wrong"] - The error message
     * @param {Array} [errors=[]] - Additional error details
     * @param {string} [stack=""] - The stack trace of the error
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        // Call the parent class constructor with the error message
        super(message);
        
        // Set the HTTP status code for the error
        this.statusCode = statusCode;
        
        // Initialize additional properties
        this.data = null;  // Placeholder for additional data (if any)
        this.message = message;  // Error message
        this.success = false;  // Indicate that the operation was not successful
        this.errors = errors;  // Array of additional error details
        
        // Set the stack trace for the error
        if (stack) {
            this.stack = stack;
        } else {
            // Capture the current stack trace if none is provided
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class for use in other modules
export {ApiError};
