const express = require('express');
const { validate } = require('express-validation');

const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();
const { vatService } = require('../services');
const { vatValidators: { createVat, getAllVat, updatevat } } = require('../validators');

const LOG_ID = 'routes/vat';

/**
 * Route for get all vat.
 */
router.get('/getAll', validate(getAllVat), jwtVerify, async (req, res) => {
    try {
        const result = await vatService.getAllVat(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during vat/getAll: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for get vat by id.
 */
router.get('/getById/:id', jwtVerify, async (req, res) => {
    try {
        const result = await vatService.getvatById(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during vat/getById: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating vat.
 */
router.post('/create', validate(createVat), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await vatService.createVat(req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during vat/create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating the vat.
 */
router.post('/update/:id', validate(updatevat), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await vatService.updatevat(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during vat/update: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting the vat.
 */
router.post('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await vatService.deletevat(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during vat/delete: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;