const jwt = require('jsonwebtoken');
const { handleErrorResponse } = require('../helpers/response');
const { userModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');

/**
 * Middleware to verify a JWT token for admin authorization.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {Function} next - The next middleware function in the Express pipeline.
 */
exports.jwtVerify = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split('Bearer ')[1];

        const findToken = await query.findOne(userModel, { token });
        if (!findToken) return handleErrorResponse(res, 401, 'Invalid token', {});

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                // Handle invalid token
                return handleErrorResponse(res, err.status || 401, 'Invalid token', err);
            } else {
                // Token is valid, set user authentication details in the request object
                req.auth = {
                    _id: decoded.userId,
                    email: decoded.email,
                    role: decoded.role
                };
                next();
            }
        });
    } catch (error) {
        // Handle missing or invalid token
        const err = new Error(error);
        return handleErrorResponse(res, err.status || 401, 'Token Required', err);
    }
};
