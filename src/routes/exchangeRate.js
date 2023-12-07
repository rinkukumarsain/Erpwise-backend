const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { exchangeRateService } = require('../services');
const { exchangeRateValidators } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/exchangeRate';

/**
 * Route for exchangeRate create.
 */
router.post('/create', validate(exchangeRateValidators.create), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        req.body.orgId = req.headers['x-org-type'];
        const result = await exchangeRateService.create(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

router.post('/update/:id', validate(exchangeRateValidators.updated), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        req.body._id = req.params.id;
        const result = await exchangeRateService.updated(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

router.get('/get',  jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        req.query.orgId = req.headers['x-org-type'];
        const result = await exchangeRateService.getExchangeRate(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;