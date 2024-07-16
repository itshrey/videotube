// Define the asyncHandler function to handle asynchronous route handlers
const asyncHandler = (requestHandler) => {
  // Return a new function that wraps the request handler
  return (req, res, next) => {
      // Call the request handler and ensure any errors are caught and passed to the next middleware
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// Export the asyncHandler function for use in other modules
export { asyncHandler };

// Alternative implementations:

// Basic definition of asyncHandler function
// const asyncHandler = () => {}

// Function that takes another function as an argument and returns a function
// const asyncHandler = (func) => () => {}

// Function that takes another function as an argument and returns an asynchronous function
// const asyncHandler = (func) => async () => {}

// More explicit implementation of asyncHandler function
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         // Await the execution of the passed function
//         await fn(req, res, next);
//     } catch (error) {
//         // Handle any errors by sending a response with the appropriate status code and message
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// }
