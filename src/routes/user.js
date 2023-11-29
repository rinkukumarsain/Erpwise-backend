const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { userService } = require('../services');
const { userValidators } = require('../validators');
// const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

const LOG_ID = 'routes/user';

/**
 * Route for user login.
 */
router.post('/login', validate(userValidators.login), async (req, res) => {
    try {
        const result = await userService.login(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;