const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { leadContacts } = require('../services');
const { leadContactValidators: { createLeadContact, updateLeadContactById } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/leadContact';

/**
 * Route for creating lead contact.
 */
router.post('/create', jwtVerify, authorizeRoleAccess, validate(createLeadContact), async (req, res) => {
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

// /**
//  * Route for getting all lead contact.
//  */
// router.get('/getAll/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
//     try {
//         const result = await leadContacts.getAllLeadContact(req.params.id);
//         if (result.success) {
//             return handleResponse(res, statusCode.OK, result);
//         }
//         return handleResponse(res, statusCode.BAD_REQUEST, result);
//     } catch (err) {
//         logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
//         handleErrorResponse(res, err.status, err.message, err);
//     }
// });

/**
 * Route for updating lead contact by id.
 */
router.post('/update/:id', jwtVerify, authorizeRoleAccess, validate(updateLeadContactById), async (req, res) => {
    try {
        delete req.body.leadId;
        const result = await leadContacts.updateLeadContactById(req.auth, req.params.id, req.body);
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
 * Route for deleting lead contact by id.
 */
router.get('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadContacts.delete(req.auth, req.params.id);
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