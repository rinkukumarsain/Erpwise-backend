const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { uploadS3 } = require('../utils/multer');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { enquiryServices } = require('../services');
const { enquiryValidators: {
    createEnquiry,
    getAllEnquiry,
    deleteEnquiryDocument
} } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/enquiry';

/**
 * Route for creating enquiry.
 */
router.post('/create', jwtVerify, validate(createEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.createEnquiry(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all enquiries.
 */
router.get('/getAll', jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllEnquiry(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all enquiries: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting enquiry by id.
 */
router.get('/get/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getEnquiryById(req.headers['x-org-type'], req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/get/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting Recommended Supplier With Items.
 */
router.get('/getRecommendedSupplier/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getRecommendedSupplierWithItems(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/getRecommendedSupplier/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading enquiry document.
 */
router.post('/upload/:id', jwtVerify, uploadS3.single('image'), async (req, res) => {
    try {
        const result = await enquiryServices.uploadEnquiryDocument(req.params.id, req.file, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/upload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry document.
 */
router.post('/deleteDocument/:id', jwtVerify, validate(deleteEnquiryDocument), async (req, res) => {
    try {
        const result = await enquiryServices.deleteEnquiryDocument(req.params.id, req.body.imageUrl, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/deleteDocument/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;