const express = require('express');
const fs = require('fs');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { upload } = require('../utils/multer');
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
        const result = await supplierItemService.createSupplierItem(req.auth, req.body, req.headers['x-org-type']);
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
        const result = await supplierItemService.updateSupplierItemById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
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
        const result = await supplierItemService.delete(req.auth, req.params.id, req.headers['x-org-type']);
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
 * Route for getting all available hscodes.
 */
router.get('/get/hscode', jwtVerify, async (req, res) => {
    try {
        const result = await supplierItemService.getAllAvailableHsCode(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/get/hscode : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading supplier items in bulk.
 */
router.post('/bulkupload/:id', jwtVerify, upload.single('file'), async (req, res) => {
    try {
        logger.info(LOG_ID, `File to read all item's | File Path :- ${req.file.path}`);
        // console.log('req.file', req.file);
        const result = await supplierItemService.itemBulkUpload(req.auth, req.headers['x-org-type'], req.params.id, req.file.path);
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.log(err);
                logger.error(LOG_ID, `Error occurred while remove file from path (${req.file.path}) : ${err.message}`);
                return;
            }
            logger.info(LOG_ID, `Supplier Item | File removed successfully | File Path :- ${req.file.path}`);
        });
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplierItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;