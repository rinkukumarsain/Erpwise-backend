const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) for the given user details.
 * 
 * @param {object} userDetails - The user details to be encoded in the token.
 * @returns {string} - The generated JWT.
 */
exports.generateAuthToken = (userDetails) => {
    return jwt.sign(userDetails, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};