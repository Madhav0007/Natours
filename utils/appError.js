class AppError extends Error {
  constructor(message, statusCode) {
     // Call the constructor of parent class (Error) with the message argument
    super(message);
    this.statusCode = statusCode;
    // If the statusCode starts with '4', it sets status to 'fail', indicating a client error.
    // Otherwise, it sets status to 'error', indicating a server error.
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // This property can be used to differentiate between operational errors 
    // (expected errors that can occur during normal operation) and programming or unknown errors.
    this.isOperational = true;
    // when new object is created and constructor  is called then call will not be logged in console
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
