const express = require('express');
const fs = require('fs');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { upload } = require('../utils/multer');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { enquiryItemService } = require('../services');
const { enquiryItemValidators: { createEnquiryItem, updateEnquiryItemById } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/enquiryItem';

/**
 * Route for creating a new enquiry item.
 */
router.post('/create', jwtVerify, validate(createEnquiryItem), async (req, res) => {
    try {
        const result = await enquiryItemService.createEnquiryItem(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (enquiryItem/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for upadting enquiry item.
 */
router.post('/update/:id', jwtVerify, validate(updateEnquiryItemById), async (req, res) => {
    try {
        const result = await enquiryItemService.updateEnquiryItemById(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry item.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.delete(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading enquiry items in bulk.
 */
router.post('/bulkupload/:id', jwtVerify, upload.single('file'), async (req, res) => {
    try {
        logger.info(LOG_ID, `File to read all item's | File Path :- ${req.file.path}`);
        console.log('req.file', req.file);
        const result = await enquiryItemService.itemBulkUpload(req.auth, req.params.id, req.file.path);
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.log(err);
                logger.error(LOG_ID, `Error occurred while remove file from path (${req.file.path}) : ${err.message}`);
                return;
            }
            logger.info(LOG_ID, `Enquiry Item | File removed successfully | File Path :- ${req.file.path}`);
        });
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;