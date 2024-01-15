const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { agentServices } = require('../services');
const { agentValidators: {
    createAgent
} } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/agent';

/**
 * Route for creating agent.
 */
router.post('/create', jwtVerify, validate(createAgent), async (req, res) => {
    try {
        const result = await agentServices.createAgent(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during agent/create : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all agent.
 */
router.post('/getAll', jwtVerify, async (req, res) => {
    try {
        const result = await agentServices.getAllAgent(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during agent/getAll : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;