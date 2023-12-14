const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { leadAddress } = require('../services');
const { leadAddressValidators: { create, update } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/leadAddress';

/**
 * Route for creating a new lead address.
 */
router.post('/create', jwtVerify, authorizeRoleAccess, validate(create), async (req, res) => {
    try {
        const result = await leadAddress.create(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during leadAddress/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (leadAddress/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// /**
//  * Route for getting all lead address.
//  */
// router.get('/getAll', jwtVerify, authorizeRoleAccess, async (req, res) => {
//     try {
//         const result = await leadAddress.getAllLeadAddress(req.headers['x-lead-type']);
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
 * Route for upadting lead address.
 */
router.post('/update/:id', jwtVerify, authorizeRoleAccess, validate(update), async (req, res) => {
    try {
        const result = await leadAddress.update(req.auth, req.params.id, req.body);
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
 * Route for deleting lead address.
 */
router.get('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadAddress.delete(req.auth, req.params.id);
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
 * Route for designating a address as a primary address.
 */
router.get('/makePrimary/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadAddress.makeAddressPrimary(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while makeing a address - Primary (makeAddressPrimary): ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;