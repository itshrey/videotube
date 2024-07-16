// Define the ApiResponse class to structure API responses
class ApiResponse {
    /**
     * Constructor for ApiResponse
     * @param {number} statusCode - The HTTP status code for the response
     * @param {any} data - The data to be included in the response
     * @param {string} [message="Success"] - The message to be included in the response
     */
    constructor(statusCode, data, message = "Success") {
        // Set the HTTP status code for the response
        this.statusCode = statusCode;
        
        // Set the data to be included in the response
        this.data = data;
        
        // Set the message to be included in the response
        this.message = message;
        
        // Determine success based on the status code (any status code less than 400 is considered successful)
        this.success = statusCode < 400;
    }
}

// Export the ApiResponse class for use in other modules
export { ApiResponse };
