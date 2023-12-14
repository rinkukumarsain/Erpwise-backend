const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { supplierAddressServices } = require('../services');
const { supplierAddressValidators: { create, update } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/supplierAddress';

/**
 * Route for creating a new supplier address.
 */
router.post('/create', jwtVerify, validate(create), async (req, res) => {
    try {
        const result = await supplierAddressServices.create(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierAddress/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (supplierAddress/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for upadting supplier address.
 */
router.post('/update/:id', jwtVerify, validate(update), async (req, res) => {
    try {
        const result = await supplierAddressServices.update(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierAddress/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting supplier address.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await supplierAddressServices.delete(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierAddress/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for designating a address as a primary address of supplier.
 */
router.get('/makeDefalut/:addressType/:id', jwtVerify, async (req, res) => {
    try {
        const result = await supplierAddressServices.makeAddressDefault(req.params.id, req.params.addressType);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while makeing a address - defalut (makeAddressDefault): ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;