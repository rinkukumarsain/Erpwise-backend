const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { leadContacts } = require('../services');
const { leadContactValidators: { createLeadContact, updateLeadById } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/leadContact';

/**
 * Route for creating lead contact.
 */
router.post('/create', jwtVerify, validate(createLeadContact), async (req, res) => {
    try {
        const result = await leadContacts.createLeadContact(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during leadContact/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (leadContact/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
* Route for getting all leads.
*/
router.get('/getAll/:id', jwtVerify, async (req, res) => {
    try {
        const result = await leadContacts.getAllLeadContact(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
* Route for getting all leads.
*/
router.post('/updateLeadById/:id', jwtVerify, validate(updateLeadById), async (req, res) => {
    try {
        const result = await leadContacts.updateLeadById(req.auth, req.params.id, req.headers['x-lead-type'], req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
* Route for getting all leads.
*/
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await leadContacts.delete(req.params.id);
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