const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { supplierItemService } = require('../services');
const { supplierItemValidators: { createSupplierItem, updateSupplierItemById } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/supplierItem';

/**
 * Route for creating a new supplier item.
 */
router.post('/create', jwtVerify, validate(createSupplierItem), async (req, res) => {
    try {
        const result = await supplierItemService.createSupplierItem(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (supplierItem/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for upadting supplier item.
 */
router.post('/update/:id', jwtVerify, validate(updateSupplierItemById), async (req, res) => {
    try {
        const result = await supplierItemService.updateSupplierItemById(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting supplier item.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await supplierItemService.delete(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for designating a address as a primary address of supplier.
 */
router.get('/makeDefalut/:addressType/:id', jwtVerify, async (req, res) => {
    try {
        const result = await supplierItemService.makeAddressDefault(req.params.id, req.params.addressType);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while makeing a address - defalut (makeAddressDefault): ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all available hscodes.
 */
router.get('/get/hscode', jwtVerify, async (req, res) => {
    try {
        const result = await supplierItemService.getAllAvailableHsCode();
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/get/hscode : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;