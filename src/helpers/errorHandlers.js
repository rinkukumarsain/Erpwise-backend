// global import
const { ValidationError } = require('express-validation');

// local import
const { handleErrorResponse } = require('./response');
const { statusCode } = require('../../config/default.json');


/**
 * handle route not found
 * 
 * @param {object} req http request object
 * @param {object} res http response object
 * @param {object} next http forward func
 * @returns {*} forward the result
 */
const routeNotFound = (req, res, next) => {
    const err = new Error();
    err.statusCode = statusCode.NOT_FOUND;
    err.message = 'Route Not Found';
    next(err);
};

/**
 * handle global errors
 * 
 * @param {object} err http error
 * @param {object} req http request object
 * @param {object} res http response object
 * @param {object} next http response object
 * @returns {*} forward the result
 */
const globalErrors = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        const errorMsg = [];
        if (err.details) {
            const errorBody = err.details.body || err.details.query || err.details.params || err.details.headers;
            errorBody.forEach(ele => errorMsg.push({ message: ele.message }));
            return handleErrorResponse(res, err.statusCode, 'Request validation error.', errorMsg[0],next);
        }

    }
    return handleErrorResponse(res, err.statusCode, err.message, {});
};

module.exports = {
    routeNotFound,
    globalErrors
};