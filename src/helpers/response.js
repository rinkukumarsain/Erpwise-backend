const { statusCode } = require('../../config/default.json');

/** Class representing as a Response. */
class Response {
    /**
     * Gets Response data
     * 
     * @param {number} status status of API call
     * @param {object} data Response Data
     */
    constructor(status, data) {
        this.status = status;
        this.data = data;
    }
}

/** Class representing an Error Response. */
class ErrorResponse {

    /**
     * Setup new Error Response
     *
     * @param {number} status code of error
     * @param {string} message error explanation
     * @param {object} error original error object
     */
    constructor(status, message, error = {}) {
        this.status = status;
        this.message = message;
        this.error = error;
    }
}


/**
 * handle response
 * 
 * @param {object} res http response object
 * @param {object} status http status code of the response
 * @param {object} data containing data to be returned
 */
const handleResponse = (res, status = statusCode.OK, data) => {
    const response = new Response(status, data);
    res.status(status).send(response);
};

/**
 * handle error response
 *
 * @param {object} res  http response object
 * @param {object} status http status code of the response
 * @param {object} message error message
 * @param {object} error error object
 */
const handleErrorResponse = (res, status = 500, message, error) => {
    const response = new ErrorResponse(status, message, error);
    res.status(status).send(response);
};

module.exports = {
    handleResponse,
    handleErrorResponse
};