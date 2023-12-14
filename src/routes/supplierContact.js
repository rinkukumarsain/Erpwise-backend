const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { supplierContactServices } = require('../services');
const { supplierContactValidators: { createSupplierContact, updateSupplierContactById } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/supplierContact';

/**
 * Route for creating supplier contact.
 */
router.post('/create', jwtVerify, validate(createSupplierContact), async (req, res) => {
    try {
        const result = await supplierContactServices.createSupplierContact(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierContact/create : ${err.message}`);
        logger.error(`${LOG_ID} - Error (supplierContact/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating supplier contact by id.
 */
router.post('/update/:id', jwtVerify, validate(updateSupplierContactById), async (req, res) => {
    try {
        const result = await supplierContactServices.updateSupplierContactById(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierContact/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting supplier contact by id.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await supplierContactServices.delete(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, ` Error occurred during supplierContact/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;