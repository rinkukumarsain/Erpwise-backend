const express = require('express');
// const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { currencyService } = require('../services');
// const { userValidators } = require('../validators');
// const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

const LOG_ID = 'routes/currency';

/**
 * Route for get all currencies.
 */
router.get('/getAll', async (req, res) => {
    try {
        const result = await currencyService.getAllCurrencies();
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during currency/getAll: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;