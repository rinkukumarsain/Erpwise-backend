const { handleErrorResponse } = require('../helpers/response');
const { roleBaseRouteAccess } = require('../../config/default.json');

/**
 * Middleware to authorize access based on user role and route.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
exports.authorizeRoleAccess = async (req, res, next) => {
    try {
        const val = req.baseUrl.split('/');
        // console.log('>>>>>>>>>>>>>>>',`/${val[val.length - 1]}${req.route.path}`);
        // console.log(roleBaseRouteAccess[req.auth.role]);
        // Check if the user's role has access to the current route
        if (roleBaseRouteAccess[req.auth.role].includes(`/${val[val.length - 1]}${req.route.path}`)) {
            next(); // User is authorized, proceed to the next middleware or route
        } else {
            return handleErrorResponse(res, 401, 'You are not authorized', {});
        }
    } catch (error) {
        // Handle missing or invalid token
        const err = new Error(error);
        return handleErrorResponse(res, err.status || 401, 'Token Required !!', err);
    }
};