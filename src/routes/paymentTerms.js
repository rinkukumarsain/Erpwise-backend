const express = require('express');
const { validate } = require('express-validation');

const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();
const { paymentTermsService } = require('../services');
const { paymentTermsValidators: { createPaymentTerms, getAllPaymentTerms, updatePaymentTerms,enableOrDisablePaymentTerms } } = require('../validators');

const LOG_ID = 'routes/paymentTerms';

/**
 * Route for get all payment term.
 */
router.get('/getAll', validate(getAllPaymentTerms), jwtVerify, async (req, res) => {
    try {
        const result = await paymentTermsService.getAllPaymentTerms(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during payment term/getAll: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for get payment term by id.
 */
router.get('/getById/:id', jwtVerify, async (req, res) => {
    try {
        const result = await paymentTermsService.getPaymentTermsById(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during payment term/getById: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating payment term.
 */
router.post('/create', validate(createPaymentTerms), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await paymentTermsService.createPaymentTerms(req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during payment term/create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating the payment terms.
 */
router.post('/update/:id', validate(updatePaymentTerms), jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await paymentTermsService.updatePaymentTerms(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during payment terms/update: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting the payment terms.
 */
router.post('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await paymentTermsService.deletePaymentTerms(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during payment term/delete: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating payment term status.
 */
router.post('/updateStatus', jwtVerify, authorizeRoleAccess, validate(enableOrDisablePaymentTerms), async (req, res) => {
    try {
        const result = await paymentTermsService.enableOrDisablePaymentTerms(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during paymentTerms/updateStatus: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;